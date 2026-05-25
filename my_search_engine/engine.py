import time
import heapq
import difflib
import re  # ✅ Import re module for regex operations
from functools import lru_cache
from datetime import datetime
from collections import defaultdict

# ✅ NLTK Pipeline: Comprehensive Stopwords (English & Hindi/Hinglish)
STOP_WORDS = set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with',
    'hai', 'ko', 'ka', 'ke', 'ki', 'mein', 'me', 'main', 'aur', 'ek', 'se', 'par', 'bhi', 'ya', 'yeh', 'woh', 'jo', 'jab', 'tab', 'kya', 'kyun', 'kaise', 'kon', 'kaha', 'kabhi', 'har', 'sabhi', 'apna', 'apne', 'apni', 'hum', 'tum', 'unka', 'unki', 'unke', 'mera', 'meri', 'mere', 'tera', 'teri', 'tere', 'usko', 'uska', 'uski', 'uske', 'ismein', 'usmein', 'yahan', 'wahan', 'idhar', 'udhar', 'lekin', 'magar', 'aur', 'fir', 'phir', 'toh', 'tabhi', 'jabki', 'jaisa', 'jaise', 'jaisi', 'aisa', 'aise', 'aisi', 'kuch', 'kisi', 'kuchh', 'kisi', 'sab', 'sabhi', 'kya', 'kaun', 'kaise', 'kabhi', 'kahin', 'kaunse', 'kis', 'kisne', 'kiske', 'kiski'])
class EngineItem:
    __slots__ = ('id', 'title', 'category', 'is_essential', 'base_score', 'search_text', 'thumbnail', 'sellingPrice', 'tokens', 'norm_tokens')

    def __init__(self, id, title, category, is_essential, thumbnail=None, sellingPrice=0):
        self.id = id
        self.title = title
        self.category = category
        self.is_essential = is_essential
        self.thumbnail = thumbnail
        self.sellingPrice = sellingPrice
        self.base_score = 1.0
        self.search_text = f"{title} {category}".lower()
        
        # Pre-calculate tokens and normalized versions for performance
        self.tokens = self.search_text.split()
        self.norm_tokens = [re.sub(r'(.)\1+', r'\1', t) for t in self.tokens]

class MultiversalEngine:
    __slots__ = ('items', 'category_index', 'history', 'top_k', 'max_history')

    def __init__(self, catalog: list, top_k: int = 5):
        self.items = []
        self.category_index = defaultdict(list)
        self.history = []
        self.top_k = top_k
        self.max_history = 100

        for item in catalog:
            item_id = item.get('id') or item.get('_id')
            title = item.get('title', '')
            category = item.get('category', '')
            is_essential = bool(item.get('is_essential', False))
            thumbnail = item.get('thumbnail')
            price = item.get('sellingPrice') or item.get('price', 0)
            engine_item = EngineItem(item_id, title, category, is_essential, thumbnail, price)
            self.items.append(engine_item)
            self.category_index[category].append(engine_item)

    def _score_item(self, item, query_terms, norm_query_terms, category):
        score = item.base_score
        is_match = False

        FUZZY_THRESHOLD = 0.7 

        # Boost score if the category in user_context matches the item's category
        if category and item.category == category:
            score *= 2.0

        # Further boost for essential items during early morning hours (existing logic)
        if datetime.now().hour < 6 and item.is_essential:
            score += 5.0

        if query_terms:
            for term, norm_term in zip(query_terms, norm_query_terms):
                # 1. Exact Substring Match (Highest priority)
                if term in item.tokens:
                    score += 10.0
                    is_match = True
                    continue
                elif term in item.search_text:
                    score += 6.0
                    is_match = True
                    continue
                
                # 2. Prefix Matching (More efficient than fuzzy)
                if any(token.startswith(term) for token in item.tokens):
                    score += 7.0
                    is_match = True
                    continue

                # 3. Token-level Fuzzy Matching
                ratios = [difflib.SequenceMatcher(None, term, token).ratio() for token in item.tokens]
                best_ratio = max(ratios) if ratios else 0

                # High-Confidence Fuzzy Matching
                if best_ratio > 0.85:
                    score += (best_ratio * 6.0) # Bahut karibi match ko high boost
                    is_match = True
                    continue
                elif best_ratio > FUZZY_THRESHOLD:
                    score += (best_ratio * 3.0) # Generic fuzzy match
                    is_match = True
                    continue

                # 4. Extreme Typo Match (Normalized matching)
                for norm_token in item.norm_tokens:
                    if norm_term == norm_token:
                        score += 5.0
                        is_match = True
                        break
                    elif difflib.SequenceMatcher(None, norm_term, norm_token).ratio() > 0.85:
                        score += 2.0
                        is_match = True
                        break

        return score, is_match

    # ✅ 100k users ke liye caching zaroori hai
    @lru_cache(maxsize=1024)
    def search(self, query, user_context):
        start_t = time.perf_counter()
        query_terms = [term for term in query.lower().split() if term]
        
        # Pre-normalize query terms once per search
        norm_query_terms = [re.sub(r'(.)\1+', r'\1', term) for term in query_terms]
        
        # Tuple conversion for hashable context (needed for lru_cache)
        category = None
        for key, val in user_context:
            if key == 'category':
                category = val

        candidates = self.category_index.get(category, self.items)

        scored = []
        for item in candidates:
            score, is_match = self._score_item(item, query_terms, norm_query_terms, category)
            if not query_terms or is_match:
                scored.append({
                    'id': item.id,
                    'title': item.title,
                    'category': item.category,
                    'thumbnail': item.thumbnail,
                    'sellingPrice': item.sellingPrice,
                    'score': round(score, 2)
                })

        top_results = heapq.nlargest(self.top_k, scored, key=lambda x: x['score'])
        latency = f"{(time.perf_counter() - start_t) * 1000:.4f}ms"

        self.history.append({'query': query, 'context': user_context, 'results': top_results})
        if len(self.history) > self.max_history:
            self.history.pop(0)
        return {'latency_ms': latency, 'results': top_results}
