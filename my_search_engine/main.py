import logging
import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    import firebase_admin
    from firebase_admin import credentials, db
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False

from engine import MultiversalEngine

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

# ✅ AI Catalog Model for stricter validation
class ProductItem(BaseModel):
    id: str
    title: str
    category: str = "General"
    sellingPrice: float = 0.0
    thumbnail: str = ""
    is_essential: bool = False

class SearchRequest(BaseModel):
    query: str
    user_context: dict = {"category": "bedroom"}

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def init_firebase():
    if not FIREBASE_AVAILABLE:
        logger.warning('firebase-admin is not installed; Firestore support is disabled.')
        return None

    if firebase_admin._apps:
        return True

    cred = None
    if os.getenv('FIREBASE_PRIVATE_KEY'):
        logger.info('Using Firebase credentials from environment variables')
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": os.getenv('FIREBASE_PROJECT_ID'),
            "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
            "private_key": os.getenv('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
            "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
            "token_uri": "https://oauth2.googleapis.com/token",
        })
    else:
        base_dir = os.path.dirname(__file__)
        candidate_paths = [
            os.path.join(base_dir, 'serviceAccountKey.json'),
            os.path.join(base_dir, '..', 'server', 'serviceAccountKey.json'),
            os.path.join(base_dir, '..', 'server', 'config', 'serviceAccountKey.json'),
            os.path.join(base_dir, '..', 'server', 'aaramdehi-91f82-firebase-adminsdk-fbsvc-a144c1cbb1.json'),
        ]

        for cred_path in candidate_paths:
            if os.path.exists(cred_path):
                logger.info('Using Firebase credential file at %s', cred_path)
                cred = credentials.Certificate(cred_path)
                break

        if not cred:
            logger.warning('Firebase credentials not found; using fallback catalog.')
            return None

    db_url = os.getenv('FIREBASE_DATABASE_URL', 'https://aaramdehi-91f82-default-rtdb.firebaseio.com/')
    logger.info('Attempting Firebase RTDB connect to %s', db_url)
    firebase_admin.initialize_app(cred, {'databaseURL': db_url})
    logger.info('Initialized Firebase Admin SDK')
    return True


def load_catalog_from_rtdb():
    if not FIREBASE_AVAILABLE:
        logger.info('Firebase SDK not available; falling back to static catalog.')
        return []

    catalog = []
    try:
        products_ref = db.reference('products')
        products_data = products_ref.get()

        if products_data:
            items = products_data.items() if isinstance(products_data, dict) else enumerate(products_data)
            for key, data in items:
                if not data or not isinstance(data, dict):
                    continue

                category_value = data.get('category')
                if isinstance(category_value, dict):
                    category_value = category_value.get('name') or category_value.get('label') or 'uncategorized'

                catalog.append({
                    'id': str(key),
                    'title': data.get('name') or data.get('title') or data.get('productName') or 'Untitled Product',
                    'category': category_value or 'uncategorized',
                    'is_essential': bool(data.get('is_essential') or data.get('essential') or False),
                    'thumbnail': data.get('thumbnail') or data.get('image') or '',
                    'sellingPrice': float(data.get('sellingPrice') or data.get('price') or data.get('mrp') or 0),
                })

        logger.info('Loaded %d product(s) from Realtime Database.', len(catalog))
    except Exception as exc:
        logger.warning(
            'Failed to load Realtime Database catalog: %s. Falling back to static catalog.',
            exc,
        )
        return []

    return catalog


init_firebase()
firestore_catalog = load_catalog_from_rtdb()

fallback_catalog = [
    {'title': 'Night Lamp', 'category': 'bedroom', 'is_essential': True},
    {'title': 'Study Table', 'category': 'office', 'is_essential': False},
]

catalog = firestore_catalog or fallback_catalog
engine = MultiversalEngine(catalog)
logger.info('Search engine initialized with %d product(s).', len(catalog))

@app.post("/search")
def search_api(request: SearchRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail='Query must not be empty.')
    
    # ✅ Convert dict to tuple for caching compatibility
    context_tuple = tuple(sorted(request.user_context.items()))
    return engine.search(request.query, context_tuple)

@app.get("/search")
def search_get(q: str, category: str | None = None):
    cleaned_category = category.strip() if category and category.strip() else None
    context_tuple = tuple(sorted({"category": cleaned_category}.items())) if cleaned_category else tuple()
    return engine.search(q, context_tuple)

@app.post("/api/sync-catalog")
@app.post("/sync-catalog")
def sync_catalog(catalog: list[ProductItem]):
    global engine
    # Ensure we use model_dump() for Pydantic v2 or dict() for v1
    catalog_dicts = [item.model_dump() if hasattr(item, "model_dump") else item.dict() for item in catalog]
    engine = MultiversalEngine(catalog_dicts)
    logger.info(f"Successfully indexed {len(catalog_dicts)} products via Sync API!")
    return {"status": "success", "message": f"Catalog synced successfully with {len(catalog)} items!"}
