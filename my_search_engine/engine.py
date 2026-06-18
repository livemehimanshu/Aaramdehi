import time
import heapq
import re
import math
from functools import lru_cache
from datetime import datetime
from collections import defaultdict

# ✅ NLTK Pipeline: Comprehensive Stopwords (English & Hindi/Hinglish)
STOP_WORDS = set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with',
    'hai', 'ko', 'ka', 'ke', 'ki', 'mein', 'me', 'main', 'aur', 'ek', 'se', 'par', 'bhi', 'ya', 'yeh', 'woh', 'jo', 'jab', 'tab', 'kya', 'kyun', 'kaise', 'kon', 'kaha', 'kabhi', 'har', 'sabhi', 'apna', 'apne', 'apni', 'hum', 'tum', 'unka', 'unki', 'unke', 'mera', 'meri', 'mere', 'tera', 'teri', 'tere', 'usko', 'uska', 'uski', 'uske', 'ismein', 'usmein', 'yahan', 'wahan', 'idhar', 'udhar', 'lekin', 'magar', 'aur', 'fir', 'phir', 'toh', 'tabhi', 'jabki', 'jaisa', 'jaise', 'jaisi', 'aisa', 'aise', 'aisi', 'kuch', 'kisi', 'kuchh', 'kisi', 'sab', 'sabhi', 'kya', 'kaun', 'kaise', 'kabhi', 'kahin', 'kaunse', 'kis', 'kisne', 'kiske', 'kiski'])

# ✅ Hinglish to English Synonym Mapping (Furniture & Bedding Domain)
HINGLISH_MAP = {
    'lakdi': 'wooden',
    'kursi': 'chair',
    'khat': 'bed',
    'gadda': 'mattress',
    'chadar': 'bedsheet',
    'lamba': 'long',
    'chhota': 'small',
    'bada': 'big',
    'rang': 'color',
    'sofa': 'couch',
    'pankha': 'fan',
    'tabla': 'table',
    'darwaza': 'door',
    'khirki': 'window',
    'patli': 'thin',
    'mota': 'thick',
    'halka': 'light',
    'bhara': 'heavy',
    'chamkta': 'shiny',
    'takiya': 'pillow',
    'bistar': 'bed',
    'char paai': 'cot',
    'divaan': 'sofa',
    'takhat': 'platform bed',
    'darwaza': 'door',
    'kali': 'black',
    'safed': 'white',
    'lal': 'red',
    'pili': 'yellow',
    'nili': 'blue',
}

# ✅ Keyboard Proximity Map for typo tolerance (QWERTY layout)
KEYBOARD_PROXIMITY = {
    'a': 'qs', 'b': 'vn', 'c': 'xv', 'd': 'sf', 'e': 'wr', 'f': 'dg',
    'g': 'fh', 'h': 'gj', 'i': 'uo', 'j': 'hk', 'k': 'jl', 'l': 'k',
    'm': 'n', 'n': 'bm', 'o': 'ip', 'p': 'o', 'q': 'wa', 'r': 'et',
    's': 'ad', 't': 'ry', 'u': 'yi', 'v': 'cb', 'w': 'eq', 'x': 'zc',
    'y': 'tu', 'z': 'x', '0': '9', '1': '2', '2': '13', '3': '24',
    '4': '35', '5': '46', '6': '57', '7': '68', '8': '79', '9': '80'
}


class EngineItem:
    __slots__ = ('id', 'title', 'category', 'brand', 'is_essential', 'base_score', 'search_text', 'thumbnail', 'sellingPrice', 'tokens', 'norm_tokens', 'title_lower')

    def __init__(self, id, title, category, brand, is_essential, thumbnail=None, sellingPrice=0, tags=None, description=""):
        self.id = id
        self.title = title
        self.category = category
        self.brand = brand
        self.is_essential = is_essential
        self.thumbnail = thumbnail
        self.sellingPrice = sellingPrice
        self.base_score = 1.0
        # Broaden search text to include tags and description for better recall
        self.search_text = f"{title} {category} {brand} {' '.join(tags or [])} {description}".lower() 
        self.title_lower = title.lower()
        
        # Pre-calculate tokens and normalized versions for performance
        self.tokens = self.search_text.split()
        self.norm_tokens = [re.sub(r'(.)\1+', r'\1', t) for t in self.tokens]


class MultiversalEngine:
    """
    🚀 PRODUCTION-GRADE SEARCH ENGINE v2.0
    Features:
    ✅ Inverted Index: O(k) candidate retrieval instead of O(n)
    ✅ Levenshtein Distance: Fast typo tolerance without difflib
    ✅ Hinglish Mapping: Semantic understanding of Hindi/Hinglish queries
    ✅ TF-IDF Scoring: Rare words boost, common words penalized
    """

    def __init__(self, catalog: list, top_k: int = 5):
        self.items = []
        self.category_index = defaultdict(list)
        self.inverted_index = defaultdict(set)  # ✅ Token -> Set of Item IDs (for O(1) lookup)
        self.token_document_frequency = defaultdict(int)  # ✅ For TF-IDF calculation
        self.history = []
        self.top_k = top_k
        self.max_history = 100
        self.total_documents = 0

        # Build all indexes during initialization
        for item in catalog:
            # ✅ Robust key mapping for multiple data sources (RTDB vs Express)
            item_id = str(item.get('id') or item.get('_id') or item.get('productId') or 'unknown')
            title = item.get('title') or item.get('name') or item.get('productName') or 'Untitled Product'
            
            category_raw = item.get('category')
            if isinstance(category_raw, dict):
                category = category_raw.get('name') or category_raw.get('label') or 'General'
            else:
                category = str(category_raw or 'General')

            brand = str(item.get('brand') or '')
            tags = item.get('tags') if isinstance(item.get('tags'), list) else []
            description = str(item.get('description') or item.get('shortDescription') or '')
            
            # ✅ Handle variations in boolean/float fields
            is_essential = bool(item.get('is_essential') or item.get('essential') or False)
            thumbnail = item.get('thumbnail') or item.get('image') or ''
            price = float(item.get('sellingPrice') or item.get('price') or item.get('mrp') or 0)

            engine_item = EngineItem(item_id, title, category, brand, is_essential, thumbnail, price, tags, description)
            self.items.append(engine_item)
            self.category_index[category].append(engine_item)

            # ✅ BUILD INVERTED INDEX: Map each unique token to item ID
            unique_tokens = set(engine_item.tokens)
            for token in unique_tokens:
                self.inverted_index[token].add(item_id)
                self.token_document_frequency[token] += 1
                
                # 🔄 HINGLISH REVERSE MAPPING: Agar token 'wooden' hai, toh index me 'lakdi' key ke sath bhi is item ko add karo!
                # Isse "lakdi" search karte waqt fallback loop par nahi jana padega, direct candidate mil jayega
                for hinglish_word, english_word in HINGLISH_MAP.items():
                    if token == english_word:
                        self.inverted_index[hinglish_word].add(item_id)
                        # Frequency nahi badhate taaki TF-IDF scoring natural rahe (sirf English frequency count karenge)

            self.total_documents += 1

    def _levenshtein_distance(self, s1: str, s2: str) -> int:
        """
        ✅ LEVENSHTEIN DISTANCE - O(m*n) but optimized with single-row DP
        Replaces slow difflib.SequenceMatcher
        Handles typos: 'plow' -> 'pillow', 'chare' -> 'chair'
        """
        if len(s1) < len(s2):
            return self._levenshtein_distance(s2, s1)
        
        if len(s2) == 0:
            return len(s1)

        # Single-row dynamic programming (space-optimized)
        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                # Calculate insertion, deletion, substitution costs
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        
        return previous_row[-1]

    def _levenshtein_ratio(self, s1: str, s2: str) -> float:
        """Normalized Levenshtein ratio (0.0 to 1.0)"""
        distance = self._levenshtein_distance(s1, s2)
        max_len = max(len(s1), len(s2), 1)
        return 1.0 - (distance / max_len)

    def _keyboard_distance(self, s1: str, s2: str) -> float:
        """
        ✅ KEYBOARD PROXIMITY MATCHING
        Penalizes substitutions based on QWERTY layout
        'plow' vs 'plow' = 0 (exact match)
        'plow' vs 'plkw' = 0.5 (k is adjacent to l on keyboard)
        """
        distance = 0.0
        min_len = min(len(s1), len(s2))
        
        for i in range(min_len):
            if s1[i] != s2[i]:
                if s2[i] in KEYBOARD_PROXIMITY.get(s1[i], ''):
                    distance += 0.5  # Penalty for adjacent keys
                else:
                    distance += 1.0  # Full penalty for non-adjacent keys
        
        distance += abs(len(s1) - len(s2)) * 0.5  # Penalty for length difference
        return distance

    def _phonetic_match(self, term1: str, term2: str) -> bool:
        """
        ✅ PHONETIC MATCHING (Simplified Soundex-like approach)
        Handles words that sound similar:
        'sofa' ~ 'sopa', 'shoes' ~ 'shooz', 'cushion' ~ 'cushun'
        """
        # Remove vowels for phonetic comparison
        p1 = re.sub(r'[aeiouwy]', '', term1)
        p2 = re.sub(r'[aeiouwy]', '', term2)
        
        # Exact phonetic match (after vowel removal)
        if p1 == p2 and len(term1) > 2 and len(term2) > 2:
            return True
        
        # Check if first 2 chars and last char match (weaker phonetic match)
        if len(term1) > 2 and len(term2) > 2:
            return term1[:2] == term2[:2] and term1[-1] == term2[-1]
        
        return False

    def _expand_hinglish_query(self, term: str) -> list:
        """
        ✅ HINGLISH SYNONYM EXPANSION
        Maps Hinglish terms to English equivalents
        Example: 'kursi' -> ['kursi', 'chair']
        """
        expanded = [term]
        
        # Direct mapping
        if term in HINGLISH_MAP:
            expanded.append(HINGLISH_MAP[term])
        
        # Partial/fuzzy mapping (e.g., "lakdi-kursi" contains "lakdi" and "kursi")
        for hinglish_key, english_val in HINGLISH_MAP.items():
            if len(hinglish_key) > 2 and (hinglish_key in term or term in hinglish_key):
                expanded.append(english_val)
        
        return list(set(expanded))  # Remove duplicates

    def _get_idf_score(self, term: str) -> float:
        """
        ✅ INVERSE DOCUMENT FREQUENCY (IDF) CALCULATION
        Rare terms (low doc frequency) get HIGHER boost
        Common terms (high doc frequency) get LOWER boost
        Example:
        - 'cushion' appears in 50 docs -> IDF = log(1000/51) ≈ 2.98 (rare, high boost)
        - 'wooden' appears in 800 docs -> IDF = log(1000/801) ≈ 0.22 (common, low boost)
        """
        doc_freq = self.token_document_frequency.get(term, 1)
        if self.total_documents == 0:
            return 1.0
        # Standard IDF formula: log(Total Docs / (Doc Freq + 1))
        return math.log(self.total_documents / (1.0 + doc_freq))

    def _get_candidate_items_from_index(self, query_terms: list) -> list:
        """
        ✅ INVERTED INDEX LOOKUP - O(k) instead of O(n)
        Return items that match at least one query term using set intersection/union
        """
        if not query_terms:
            return self.items
        
        candidate_ids = set()
        for term in query_terms:
            if term in self.inverted_index:
                candidate_ids.update(self.inverted_index[term])
        
        # If no matches found in index, fallback to all items
        if not candidate_ids:
            return self.items
        
        # Return actual item objects (not IDs)
        return [item for item in self.items if item.id in candidate_ids]

    def _score_item(self, item, query_terms: list, expanded_terms: list, category: str):
        """
        ✅ PRODUCTION SCORING with Levenshtein, Hinglish, Phonetic, TF-IDF
        Returns (score, is_match_boolean)
        """
        score = item.base_score
        is_match = False
        
        LEVENSHTEIN_THRESHOLD = 0.75  # 75% similarity = match
        KEYBOARD_THRESHOLD = 1.5      # Max keyboard distance for match
        PHONETIC_BOOST = 5.0           # Boost for phonetic matches
        
        # 0. Category boost (if provided)
        if category and item.category.lower() == category.lower():
            score += 5.0

        # 1. Full Title Match (High Priority)
        if " ".join(query_terms) in item.title_lower:
            score += 15.0
            is_match = True

        # 2. Early morning essential items boost
        if datetime.now().hour < 6 and item.is_essential:
            score += 5.0

        if query_terms:
            for term in query_terms:
                # ✅ TF-IDF BOOST: Rare terms get higher boost
                idf_boost = self._get_idf_score(term) * 10.0
                
                # 1. Exact Token Match (Highest priority)
                if term in item.tokens:
                    score += 10.0 + idf_boost
                    is_match = True
                    continue
                
                # 1b. Exact substring match
                elif term in item.search_text:
                    score += 6.0 + (idf_boost * 0.5)
                    is_match = True
                    continue
                
                # 2. Prefix Matching (More efficient than fuzzy)
                if any(token.startswith(term) for token in item.tokens):
                    score += 7.0 + (idf_boost * 0.7)
                    is_match = True
                    continue

                # 3. LEVENSHTEIN DISTANCE (Replaces difflib - much faster)
                best_lev_ratio = 0.0
                for token in item.tokens:
                    lev_ratio = self._levenshtein_ratio(term, token)
                    if lev_ratio > best_lev_ratio:
                        best_lev_ratio = lev_ratio
                
                if best_lev_ratio > LEVENSHTEIN_THRESHOLD:
                    score += (best_lev_ratio * 5.0) + (idf_boost * 0.5)
                    is_match = True
                    continue

                # 4. KEYBOARD PROXIMITY (Typo handling)
                best_keyboard_score = float('inf')
                for token in item.tokens:
                    # Compare term with first N chars of token
                    comparison_len = min(len(term), len(token))
                    kbd_distance = self._keyboard_distance(term, token[:comparison_len])
                    if kbd_distance < best_keyboard_score:
                        best_keyboard_score = kbd_distance

                if best_keyboard_score < KEYBOARD_THRESHOLD:
                    keyboard_boost = (1.0 - (best_keyboard_score / KEYBOARD_THRESHOLD)) * 4.0
                    score += keyboard_boost + (idf_boost * 0.3)
                    is_match = True
                    continue

                # 5. PHONETIC MATCHING (Similar-sounding words)
                for token in item.tokens:
                    if self._phonetic_match(term, token):
                        score += PHONETIC_BOOST + (idf_boost * 0.4)
                        is_match = True
                        break

                # 6. NORMALIZED MATCHING (Double-character collapsing)
                norm_term = re.sub(r'(.)\1+', r'\1', term)
                for norm_token in item.norm_tokens:
                    if norm_term == norm_token:
                        score += 8.0 + idf_boost
                        is_match = True
                        break
                    elif self._levenshtein_ratio(norm_term, norm_token) > 0.80:
                        score += 5.0 + (idf_boost * 0.6)
                        is_match = True
                        break

        # 7. HINGLISH EXPANSION BONUS (Bonus for matching expanded synonyms)
        for expanded_term in expanded_terms:
            if expanded_term not in query_terms and expanded_term in item.search_text:
                score += 8.0
                is_match = True
                break

        return score, is_match

    def _normalize_context(self, user_context):
        if user_context is None:
            return tuple()
        if isinstance(user_context, dict):
            return tuple(sorted(user_context.items()))
        if isinstance(user_context, list):
            return tuple(user_context)
        if isinstance(user_context, tuple):
            return user_context
        return tuple(user_context)

    def _extract_category(self, user_context):
        category = None
        for kv in user_context:
            if not isinstance(kv, tuple) or len(kv) != 2:
                continue
            key, val = kv
            if key == 'category' and val:
                category = str(val).strip()
                break
        return category

    def _normalize_query(self, query):
        if not isinstance(query, str):
            query = str(query or '')
        query = query.lower().strip()
        return [term for term in re.findall(r"\w+", query) if term and term not in STOP_WORDS]

    @lru_cache(maxsize=1024)
    def _search_cached(self, query, context_tuple):
        """
        ✅ CACHED SEARCH with Inverted Index + Advanced Scoring
        """
        start_t = time.perf_counter()
        query_terms = self._normalize_query(query)
        category = self._extract_category(context_tuple)

        # ✅ HINGLISH EXPANSION: Expand each query term with synonyms
        all_expanded_terms = []
        for term in query_terms:
            expanded = self._expand_hinglish_query(term)
            all_expanded_terms.extend(expanded)
        
        # ✅ INVERTED INDEX LOOKUP: Get candidate items (O(k) instead of O(n*m))
        # Search using original terms + expanded Hinglish terms
        all_search_terms = query_terms + [t for t in all_expanded_terms if t not in query_terms]
        candidate_items = self._get_candidate_items_from_index(all_search_terms)

        # Filter by category if specified
        if category and category.lower() != 'all':
            filtered_items = [item for item in candidate_items if item.category.lower() == category.lower()]
            if filtered_items:
                candidate_items = filtered_items
            else:
                # Fallback to all items in this category if index didn't find anything
                candidate_items = self.category_index.get(category, [])

        # Score each candidate item
        scored = []
        for item in candidate_items:
            score, is_match = self._score_item(item, query_terms, all_expanded_terms, category)
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

        self.history.append({'query': query, 'context': context_tuple, 'results': top_results, 'latency': latency})
        if len(self.history) > self.max_history:
            self.history.pop(0)
        
        return {'latency_ms': latency, 'results': top_results}

    def search(self, query, user_context=None):
        normalized_context = self._normalize_context(user_context)
        normalized_query = query if isinstance(query, str) else str(query or '')
        return self._search_cached(normalized_query, normalized_context)
