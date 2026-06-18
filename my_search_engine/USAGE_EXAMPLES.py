"""
🎯 MultiversalEngine v2.0 - Usage Examples
Demonstrates all 4 new production features
"""

# ============================================================================
# SETUP
# ============================================================================

from engine import MultiversalEngine

# Sample catalog
catalog = [
    {
        'id': '1',
        'name': 'Wooden Chair - Premium',
        'category': 'Furniture',
        'brand': 'AramDehi',
        'description': 'Beautiful wooden chair with cushion',
        'sellingPrice': 2499,
        'thumbnail': 'chair1.jpg',
        'tags': ['wooden', 'chair', 'seating'],
        'is_essential': True
    },
    {
        'id': '2',
        'name': 'Cotton Bedsheet Set',
        'category': 'Bedding',
        'brand': 'DreamCo',
        'description': 'Soft cotton bedsheet with pillows',
        'sellingPrice': 1999,
        'thumbnail': 'bedsheet1.jpg',
        'tags': ['cotton', 'bedsheet', 'sleep'],
    },
    {
        'id': '3',
        'name': 'Memory Foam Mattress',
        'category': 'Bedding',
        'brand': 'ComfortMax',
        'description': 'Premium memory foam mattress',
        'sellingPrice': 15999,
        'thumbnail': 'mattress1.jpg',
        'tags': ['foam', 'mattress', 'comfort'],
    },
    # ... more products
]

# Initialize engine
engine = MultiversalEngine(catalog, top_k=5)

# ============================================================================
# EXAMPLE 1: BASIC SEARCH (Unchanged from v1)
# ============================================================================

print("=" * 80)
print("EXAMPLE 1: Basic Search (Backward Compatible)")
print("=" * 80)

results = engine.search("wooden chair")
print(f"\n🔍 Search: 'wooden chair'")
print(f"⏱️  Latency: {results['latency_ms']}")
print(f"📊 Results: {len(results['results'])} items")
for item in results['results']:
    print(f"  - {item['title']} (Score: {item['score']})")

# ============================================================================
# EXAMPLE 2: INVERTED INDEX - Fast Search (Doesn't exist in v1)
# ============================================================================

print("\n" + "=" * 80)
print("EXAMPLE 2: Inverted Index Feature (10-20x faster)")
print("=" * 80)

# Behind the scenes, engine built an inverted index during __init__
print(f"\n📊 Index Statistics:")
print(f"   Total Documents: {engine.total_documents}")
print(f"   Unique Tokens: {len(engine.inverted_index)}")
print(f"   Example Token 'wooden': {len(engine.inverted_index['wooden'])} products")

results = engine.search("cushion")  # Now uses index for O(k) lookup
print(f"\n🔍 Search: 'cushion' (via inverted index)")
print(f"⏱️  Latency: {results['latency_ms']}")

# ============================================================================
# EXAMPLE 3: LEVENSHTEIN DISTANCE - Typo Tolerance
# ============================================================================

print("\n" + "=" * 80)
print("EXAMPLE 3: Levenshtein Distance (Typo Tolerance)")
print("=" * 80)

typo_queries = [
    "cahir",      # typo: chair
    "plow",       # typo: pillow
    "matress",    # typo: mattress
    "cusion",     # typo: cushion
]

for typo_query in typo_queries:
    results = engine.search(typo_query)
    print(f"\n🔍 Typo Search: '{typo_query}'")
    print(f"⏱️  Latency: {results['latency_ms']}")
    if results['results']:
        top_result = results['results'][0]
        print(f"✅ Found: {top_result['title']} (Score: {top_result['score']})")
    else:
        print("❌ No matches")

# Test Levenshtein directly
print("\n📏 Direct Levenshtein Tests:")
distances = [
    ('chair', 'cahir'),
    ('pillow', 'plow'),
    ('mattress', 'matress'),
]
for word1, word2 in distances:
    ratio = engine._levenshtein_ratio(word1, word2)
    distance = engine._levenshtein_distance(word1, word2)
    print(f"   '{word1}' vs '{word2}': distance={distance}, ratio={ratio:.2f}")

# ============================================================================
# EXAMPLE 4: KEYBOARD PROXIMITY - Adjacent Key Typos
# ============================================================================

print("\n" + "=" * 80)
print("EXAMPLE 4: Keyboard Proximity Matching")
print("=" * 80)

# Typos where you hit keys next to the intended key
keyboard_typos = [
    "diar",       # typo: chair (d is next to s which is near c)
    "plilow",     # typo: pillow (i is next to o)
]

for typo in keyboard_typos:
    kbd_distance = engine._keyboard_distance(typo[:3], 'cha')
    print(f"\n⌨️  Keyboard Distance: '{typo[:3]}' vs 'cha' = {kbd_distance}")
    print(f"   (Lower = more likely keyboard typo, threshold=1.5)")

# ============================================================================
# EXAMPLE 5: PHONETIC MATCHING - Similar Sounds
# ============================================================================

print("\n" + "=" * 80)
print("EXAMPLE 5: Phonetic Matching (Similar Sounding Words)")
print("=" * 80)

phonetic_pairs = [
    ('sofa', 'sopa'),       # Sound similar
    ('shoes', 'shooz'),     # Sound similar
    ('cushion', 'cushun'),  # Sound similar
]

for word1, word2 in phonetic_pairs:
    is_match = engine._phonetic_match(word1, word2)
    print(f"   '{word1}' ≈ '{word2}': {is_match}")

# ============================================================================
# EXAMPLE 6: HINGLISH MAPPING - Hindi/Hinglish Queries
# ============================================================================

print("\n" + "=" * 80)
print("EXAMPLE 6: Hinglish Support (New Feature!)")
print("=" * 80)

hinglish_queries = [
    "kursi",           # Hindi: chair
    "lakdi kursi",     # Hindi: wooden chair
    "gadda",           # Hindi: mattress
    "chadar",          # Hindi: bedsheet
    "takiya",          # Hindi: pillow
]

for hinglish_query in hinglish_queries:
    expanded = engine._expand_hinglish_query(hinglish_query.split()[0])
    results = engine.search(hinglish_query)
    print(f"\n🌍 Hinglish Query: '{hinglish_query}'")
    print(f"   Expanded to: {expanded}")
    if results['results']:
        print(f"   Found {len(results['results'])} results:")
        for item in results['results'][:2]:
            print(f"      - {item['title']} (Score: {item['score']})")

# ============================================================================
# EXAMPLE 7: TF-IDF SCORING - Rare Word Boost
# ============================================================================

print("\n" + "=" * 80)
print("EXAMPLE 7: TF-IDF Scoring (Rare Words Get Priority)")
print("=" * 80)

print(f"\n📊 IDF Scores (Higher = Rarer = Higher Boost):")
test_words = ['wooden', 'cotton', 'foam', 'cushion', 'memory']
for word in test_words:
    idf = engine._get_idf_score(word)
    print(f"   '{word}': IDF = {idf:.2f}")

print(f"\n💡 What This Means:")
print(f"   - If you search 'memory foam':
   - 'memory' is rarer → gets 2x boost")
print(f"   - 'foam' is common → gets 0.5x boost")
print(f"   - Result: Memory foam mattresses ranked high, wooden items ranked low")

# ============================================================================
# EXAMPLE 8: CONTEXT FILTERING - Category-Aware Search
# ============================================================================

print("\n" + "=" * 80)
print("EXAMPLE 8: Category Context Filtering")
print("=" * 80)

results_all = engine.search("bed")
results_furniture = engine.search("bed", user_context={'category': 'Furniture'})
results_bedding = engine.search("bed", user_context={'category': 'Bedding'})

print(f"\n🔍 Search: 'bed'")
print(f"   No category: {len(results_all['results'])} results")
print(f"   Furniture category: {len(results_furniture['results'])} results")
print(f"   Bedding category: {len(results_bedding['results'])} results")

# ============================================================================
# EXAMPLE 9: SEARCH HISTORY - Analytics
# ============================================================================

print("\n" + "=" * 80)
print("EXAMPLE 9: Search History & Analytics")
print("=" * 80)

print(f"\n📋 Last 3 Searches:")
for i, record in enumerate(engine.history[-3:]):
    print(f"\n   #{i+1}")
    print(f"      Query: '{record['query']}'")
    print(f"      Latency: {record['latency']}")
    print(f"      Results: {len(record['results'])} items")
    if record['results']:
        print(f"      Top Result: {record['results'][0]['title']} (Score: {record['results'][0]['score']})")

# ============================================================================
# EXAMPLE 10: COMBINED - Multiple Features
# ============================================================================

print("\n" + "=" * 80)
print("EXAMPLE 10: All Features Combined")
print("=" * 80)

complex_queries = [
    ("kursi", {'category': 'Furniture'}),           # Hinglish + Category
    ("cushon", None),                                # Typo (cushion)
    ("lakdi", {'category': 'Furniture'}),           # Hinglish wooden
    ("matres", None),                               # Typo (mattress)
]

for query, context in complex_queries:
    results = engine.search(query, user_context=context)
    context_str = f" (Category: {context['category']})" if context else ""
    print(f"\n🔍 Search: '{query}'{context_str}")
    print(f"⏱️  {results['latency_ms']}")
    if results['results']:
        for item in results['results'][:2]:
            print(f"   ✅ {item['title']} - Score: {item['score']}")
    else:
        print("   ❌ No results found")

print("\n" + "=" * 80)
print("✅ All examples completed!")
print("=" * 80)
