# My Search Engine Backend

This folder contains the FastAPI backend for the search UI.

## Requirements

- Python 3.11+ (Python 3.13 is also supported)
- `fastapi`
- `uvicorn`
- `firebase-admin` (optional, only if Firestore is used)

## Install dependencies

```bash
cd f:\Aramdehi\my_search_engine
python -m pip install -r requirements.txt
```

## Start the backend

```bash
cd f:\Aramdehi\my_search_engine
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

The search endpoint is available at:

- `POST http://127.0.0.1:8001/search`
Firestore integration

If you want to use Firestore as the product catalog source:

1. Place the service account key file in this folder as `serviceAccountKey.json`
2. Or set `GOOGLE_APPLICATION_CREDENTIALS` to the key path
3. Ensure your Firestore collection is named `products`

If Firestore is unavailable, the backend will automatically use a fallback catalog.

## Frontend configuration

The React search component uses the backend URL from `VITE_SEARCH_API_URL` if defined, otherwise it falls back to `http://127.0.0.1:8001/search`.


```env
VITE_SEARCH_API_URL=/api-local/search
```

## Notes

- `server/.gitignore` already excludes `serviceAccountKey.json`.
- The backend enables CORS for local dev. If you run the frontend from another origin, update the CORS settings in `main.py`.
