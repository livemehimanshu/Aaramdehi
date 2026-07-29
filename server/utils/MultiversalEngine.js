const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with',
  'hai', 'ko', 'ka', 'ke', 'ki', 'mein', 'me', 'main', 'aur', 'ek', 'se', 'par', 'bhi', 'ya', 'yeh', 'woh', 'jo', 'jab', 'tab', 'kya', 'kyun', 'kaise', 'kon', 'kaha', 'kabhi', 'har', 'sabhi', 'apna', 'apne', 'apni', 'hum', 'tum', 'unka', 'unki', 'unke', 'mera', 'meri', 'mere', 'tera', 'teri', 'tere', 'usko', 'uska', 'uski', 'uske', 'ismein', 'usmein', 'yahan', 'wahan', 'idhar', 'udhar', 'lekin', 'magar', 'aur', 'fir', 'phir', 'toh', 'tabhi', 'jabki', 'jaisa', 'jaise', 'jaisi', 'aisa', 'aise', 'aisi', 'kuch', 'kisi', 'kuchh', 'sab', 'sabhi', 'kaun', 'kahin', 'kaunse', 'kis', 'kisne', 'kiske', 'kiski'
]);

const HINGLISH_MAP = {
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
  'kali': 'black',
  'safed': 'white',
  'lal': 'red',
  'pili': 'yellow',
  'nili': 'blue',
};

const KEYBOARD_PROXIMITY = {
  'a': 'qs', 'b': 'vn', 'c': 'xv', 'd': 'sf', 'e': 'wr', 'f': 'dg',
  'g': 'fh', 'h': 'gj', 'i': 'uo', 'j': 'hk', 'k': 'jl', 'l': 'k',
  'm': 'n', 'n': 'bm', 'o': 'ip', 'p': 'o', 'q': 'wa', 'r': 'et',
  's': 'ad', 't': 'ry', 'u': 'yi', 'v': 'cb', 'w': 'eq', 'x': 'zc',
  'y': 'tu', 'z': 'x', '0': '9', '1': '2', '2': '13', '3': '24',
  '4': '35', '5': '46', '6': '57', '7': '68', '8': '79', '9': '80'
};

class EngineItem {
  constructor(id, title, category, brand, is_essential, thumbnail = null, sellingPrice = 0, tags = [], description = "", rawProduct = null) {
      this.id = id;
      this.title = title;
      this.category = category;
      this.brand = brand;
      this.is_essential = is_essential;
      this.thumbnail = thumbnail;
      this.sellingPrice = sellingPrice;
      this.base_score = 1.0;
      this.rawProduct = rawProduct; 
      
      this.search_text = `${title} ${category} ${brand} ${(tags || []).join(' ')} ${description}`.toLowerCase();
      this.title_lower = String(title || '').toLowerCase();
      
      this.tokens = this.search_text.split(/\s+/).filter(Boolean);
      this.norm_tokens = this.tokens.map(t => t.replace(/(.)\1+/g, '$1'));
  }
}

export class MultiversalEngine {
  constructor(catalog) {
      this.items = [];
      this.category_index = new Map();
      this.inverted_index = new Map();
      this.token_document_frequency = new Map();
      this.total_documents = 0;

      for (const item of catalog) {
          const item_id = String(item.id || item._id || item.productId || 'unknown');
          const title = String(item.title || item.name || item.productName || 'Untitled Product');
          
          let category = 'General';
          if (item.category && typeof item.category === 'object') {
              category = String(item.category.name || item.category.label || 'General');
          } else if (item.category) {
              category = String(item.category);
          }

          const brand = String(item.brand || '');
          const tags = Array.isArray(item.tags) ? item.tags : [];
          const description = String(item.description || item.shortDescription || '');
          const is_essential = Boolean(item.is_essential || item.essential || false);
          const thumbnail = item.thumbnail || item.image || '';
          const price = Number(item.sellingPrice || item.price || item.mrp || 0);

          const engine_item = new EngineItem(item_id, title, category, brand, is_essential, thumbnail, price, tags, description, item);
          this.items.push(engine_item);
          
          if (!this.category_index.has(category)) {
              this.category_index.set(category, []);
          }
          this.category_index.get(category).push(engine_item);

          const unique_tokens = new Set(engine_item.tokens);
          for (const token of unique_tokens) {
              if (!this.inverted_index.has(token)) this.inverted_index.set(token, new Set());
              this.inverted_index.get(token).add(item_id);
              
              this.token_document_frequency.set(token, (this.token_document_frequency.get(token) || 0) + 1);

              for (const [hinglish_word, english_word] of Object.entries(HINGLISH_MAP)) {
                  if (token === english_word) {
                      if (!this.inverted_index.has(hinglish_word)) this.inverted_index.set(hinglish_word, new Set());
                      this.inverted_index.get(hinglish_word).add(item_id);
                  }
              }
          }
          this.total_documents++;
      }
  }

  _levenshtein_distance(s1, s2) {
      if (s1.length < s2.length) return this._levenshtein_distance(s2, s1);
      if (s2.length === 0) return s1.length;

      let previous_row = Array.from({ length: s2.length + 1 }, (_, i) => i);
      for (let i = 0; i < s1.length; i++) {
          let current_row = [i + 1];
          for (let j = 0; j < s2.length; j++) {
              let insertions = previous_row[j + 1] + 1;
              let deletions = current_row[j] + 1;
              let substitutions = previous_row[j] + (s1[i] !== s2[j] ? 1 : 0);
              current_row.push(Math.min(insertions, deletions, substitutions));
          }
          previous_row = current_row;
      }
      return previous_row[previous_row.length - 1];
  }

  _levenshtein_ratio(s1, s2) {
      const distance = this._levenshtein_distance(s1, s2);
      const max_len = Math.max(s1.length, s2.length, 1);
      return 1.0 - (distance / max_len);
  }

  _keyboard_distance(s1, s2) {
      let distance = 0.0;
      const min_len = Math.min(s1.length, s2.length);
      for (let i = 0; i < min_len; i++) {
          if (s1[i] !== s2[i]) {
              const proximity = KEYBOARD_PROXIMITY[s1[i]] || '';
              if (proximity.includes(s2[i])) {
                  distance += 0.5;
              } else {
                  distance += 1.0;
              }
          }
      }
      distance += Math.abs(s1.length - s2.length) * 0.5;
      return distance;
  }

  _phonetic_match(term1, term2) {
      const p1 = term1.replace(/[aeiouwy]/g, '');
      const p2 = term2.replace(/[aeiouwy]/g, '');
      
      if (p1 === p2 && term1.length > 2 && term2.length > 2) return true;
      if (term1.length > 2 && term2.length > 2) {
          return term1.substring(0, 2) === term2.substring(0, 2) && term1.slice(-1) === term2.slice(-1);
      }
      return false;
  }

  _expand_hinglish_query(term) {
      const expanded = new Set([term]);
      if (HINGLISH_MAP[term]) expanded.add(HINGLISH_MAP[term]);
      
      for (const [hinglish_key, english_val] of Object.entries(HINGLISH_MAP)) {
          if (hinglish_key.length > 2 && (hinglish_key.includes(term) || term.includes(hinglish_key))) {
              expanded.add(english_val);
          }
      }
      return Array.from(expanded);
  }

  _get_idf_score(term) {
      const doc_freq = this.token_document_frequency.get(term) || 1;
      if (this.total_documents === 0) return 1.0;
      return Math.log(this.total_documents / (1.0 + doc_freq));
  }

  _get_candidate_items_from_index(query_terms) {
      if (!query_terms || query_terms.length === 0) return this.items;
      
      const candidate_ids = new Set();
      for (const term of query_terms) {
          if (this.inverted_index.has(term)) {
              for (const id of this.inverted_index.get(term)) {
                  candidate_ids.add(id);
              }
          }
      }
      
      if (candidate_ids.size === 0) return this.items;
      return this.items.filter(item => candidate_ids.has(item.id));
  }

  _score_item(item, query_terms, expanded_terms, category) {
      let score = item.base_score;
      let is_match = false;
      
      const LEVENSHTEIN_THRESHOLD = 0.75;
      const KEYBOARD_THRESHOLD = 1.5;
      const PHONETIC_BOOST = 5.0;
      
      if (category && item.category.toLowerCase() === category.toLowerCase()) score += 5.0;

      const query_str = query_terms.join(' ');
      if (query_str && item.title_lower.includes(query_str)) {
          score += 15.0;
          is_match = true;
      }

      const currentHour = new Date().getHours();
      if (currentHour < 6 && item.is_essential) {
          score += 5.0;
      }

      if (query_terms && query_terms.length > 0) {
          for (const term of query_terms) {
              const idf_boost = this._get_idf_score(term) * 10.0;
              
              if (item.tokens.includes(term)) {
                  score += 10.0 + idf_boost;
                  is_match = true;
                  continue;
              }
              
              if (item.search_text.includes(term)) {
                  score += 6.0 + (idf_boost * 0.5);
                  is_match = true;
                  continue;
              }
              
              if (item.tokens.some(t => t.startsWith(term))) {
                  score += 7.0 + (idf_boost * 0.7);
                  is_match = true;
                  continue;
              }

              let best_lev_ratio = 0.0;
              for (const token of item.tokens) {
                  const lev_ratio = this._levenshtein_ratio(term, token);
                  if (lev_ratio > best_lev_ratio) best_lev_ratio = lev_ratio;
              }
              
              if (best_lev_ratio > LEVENSHTEIN_THRESHOLD) {
                  score += (best_lev_ratio * 5.0) + (idf_boost * 0.5);
                  is_match = true;
                  continue;
              }

              let best_keyboard_score = Infinity;
              for (const token of item.tokens) {
                  const comparison_len = Math.min(term.length, token.length);
                  const kbd_distance = this._keyboard_distance(term, token.substring(0, comparison_len));
                  if (kbd_distance < best_keyboard_score) best_keyboard_score = kbd_distance;
              }

              if (best_keyboard_score < KEYBOARD_THRESHOLD) {
                  const keyboard_boost = (1.0 - (best_keyboard_score / KEYBOARD_THRESHOLD)) * 4.0;
                  score += keyboard_boost + (idf_boost * 0.3);
                  is_match = true;
                  continue;
              }

              let phonetic_matched = false;
              for (const token of item.tokens) {
                  if (this._phonetic_match(term, token)) {
                      score += PHONETIC_BOOST + (idf_boost * 0.4);
                      is_match = true;
                      phonetic_matched = true;
                      break;
                  }
              }
              if (phonetic_matched) continue;

              const norm_term = term.replace(/(.)\1+/g, '$1');
              let norm_matched = false;
              for (const norm_token of item.norm_tokens) {
                  if (norm_term === norm_token) {
                      score += 8.0 + idf_boost;
                      is_match = true;
                      norm_matched = true;
                      break;
                  } else if (this._levenshtein_ratio(norm_term, norm_token) > 0.80) {
                      score += 5.0 + (idf_boost * 0.6);
                      is_match = true;
                      norm_matched = true;
                      break;
                  }
              }
              if (norm_matched) continue;
          }
      }

      for (const expanded_term of expanded_terms) {
          if (!query_terms.includes(expanded_term) && item.search_text.includes(expanded_term)) {
              score += 8.0;
              is_match = true;
              break;
          }
      }

      return { score, is_match };
  }

  search(query, category = null) {
      const query_str = String(query || '').toLowerCase().trim();
      const query_terms = (query_str.match(/\w+/g) || []).filter(t => !STOP_WORDS.has(t));
      
      let all_expanded_terms = [];
      for (const term of query_terms) {
          all_expanded_terms = all_expanded_terms.concat(this._expand_hinglish_query(term));
      }
      
      const all_search_terms = [...new Set([...query_terms, ...all_expanded_terms])];
      let candidate_items = this._get_candidate_items_from_index(all_search_terms);

      if (category && category.toLowerCase() !== 'all') {
          const filtered = candidate_items.filter(item => item.category.toLowerCase() === category.toLowerCase());
          candidate_items = filtered.length > 0 ? filtered : (this.category_index.get(category) || []);
      }

      const scored = [];
      for (const item of candidate_items) {
          const { score, is_match } = this._score_item(item, query_terms, all_expanded_terms, category);
          if (query_terms.length === 0 || is_match) {
              item.rawProduct.searchScore = Number(score.toFixed(2));
              scored.push(item.rawProduct);
          }
      }

      scored.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));
      return scored;
  }
}
