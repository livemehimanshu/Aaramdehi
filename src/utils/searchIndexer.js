/**
 * Aaramdehi Search Indexing Utilities
 */
const STOPWORDS = new Set(['for', 'the', 'a', 'in', 'with', 'hai', 'ko', 'ka', 'me', 'and', 'to', 'is', 'of', 'this', 'that', 'on', 'at', 'by', 'an', 'each', 'from', 'are']);

export const generateKeywordsOnTheFly = (title, htmlDescription) => {
  if (!title) return [];
  
  // HTML tags remove karein
  const plainDesc = htmlDescription ? htmlDescription.replace(/<[^>]*>/g, ' ') : '';
  const combinedText = `${title} ${plainDesc}`.toLowerCase();
  
  // Tokenization and cleanup
  const cleanText = combinedText.replace(/[.,\-/;:!?"'\[\]{}_\+=\*&^%$#@~`|<>\\\[\]]/g, ' ');
  const tokens = cleanText.split(/\s+/).filter(word => 
    word.length > 2 && !STOPWORDS.has(word)
  );

  // Contextual expansion
  const additionalKeywords = [];
  tokens.forEach(token => {
    if (token === 'pillow' || token === 'pillows') {
      additionalKeywords.push('takiya', 'headrest', 'cushion', 'neck');
    }
    if (token === 'mattress' || token === 'mattresses') {
      additionalKeywords.push('gaddi', 'bed', 'mattres', 'back');
    }
  });
  
  return [...new Set([...tokens, ...additionalKeywords])];
};