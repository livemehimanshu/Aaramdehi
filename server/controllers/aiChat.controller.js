import { findAll } from '../config/db.js';

const allowedTopics = ['aaramdehi', 'product', 'products', 'doormat', 'mat', 'pillow', 'towel', 'home', 'comfort', 'decor', 'delivery', 'shipping', 'order', 'blog', 'monsoon', 'rain', 'sleep'];

const parseJson = (text) => {
  const cleaned = String(text || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) return {};
  try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { return {}; }
};

const productSummary = (product) => ({
  id: product._id || product.id,
  name: product.name || product.title || 'Aaramdehi product',
  price: Number(product.sellingPrice || product.price || product.newPrice || 0),
  image: product.thumbnail || product.images?.[0]?.url || product.images?.[0] || product.image || '',
  category: typeof product.category === 'object' ? product.category?.name : product.category,
  description: String(product.description || '').slice(0, 300)
});

export const handleAIChat = async (req, res) => {
  try {
    const message = String(req.body.message || '').trim();
    if (!message || message.length > 500) return res.status(400).json({ success: false, message: 'Message is required and must be under 500 characters.' });

    const [productResult, settingsResult, configResult] = await Promise.allSettled([findAll('products'), findAll('settings'), (async () => {
      const { db } = await import('../config/db.js');
      return (await db.ref('admin_settings/ai_config').once('value')).val() || {};
    })()]);
    const allProducts = productResult.status === 'fulfilled' ? productResult.value : [];
    const settings = settingsResult.status === 'fulfilled' ? settingsResult.value : [];
    const aiConfig = configResult.status === 'fulfilled' ? configResult.value : {};
    if (productResult.status === 'rejected') console.warn('AI chat product catalog unavailable:', productResult.reason?.message || productResult.reason);
    const products = allProducts.filter((product) => product.active !== false && product.isActive !== false);
    const catalog = products.slice(0, 100).map(productSummary);
    const lowerMessage = message.toLowerCase();
    const isRelevant = allowedTopics.some((term) => lowerMessage.includes(term));
    if (!isRelevant) {
      return res.json({ success: true, reply: 'Main sirf Aaramdehi ke products, home comfort solutions, delivery, orders aur blogs ke baare mein help kar sakta hoon.', recommendedProduct: null });
    }

    const apiKey = process.env.GEMINI_API_KEY || settings.find((setting) => setting.key === 'AI_BLOGGER_GEMINI_API_KEY')?.value || aiConfig.geminiApiKey;
    if (!apiKey) return res.status(503).json({ success: false, message: 'AI assistant is not configured. Add GEMINI_API_KEY or save the Gemini key in AI Blogger settings.' });
    const model = process.env.GEMINI_MODEL || aiConfig.selectedModel || settings.find((setting) => setting.key === 'AI_BLOGGER_MODEL')?.value || 'gemini-3.6-flash';
    const prompt = `You are Aaramdehi's concise AI Comfort Assistant. Only discuss Aaramdehi products, doormats, pillows, towels, home comfort, delivery, orders and blogs. Reply in the user's language. Use only this product catalog and never invent products, prices, IDs, stock or policies. Return only JSON: {"reply":"short helpful answer","recommendedProductId":"catalog id or empty string"}. User message: ${JSON.stringify(message)}. Catalog: ${JSON.stringify(catalog)}`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, responseMimeType: 'application/json' } })
    });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.error?.message || `Gemini request failed (${response.status})`);
      error.code = response.status === 429 ? 'AI_RATE_LIMITED' : response.status === 401 || response.status === 403 ? 'AI_AUTH_FAILED' : 'AI_PROVIDER_ERROR';
      throw error;
    }
    const answer = parseJson(data.candidates?.[0]?.content?.parts?.[0]?.text);
    const recommended = catalog.find((product) => String(product.id) === String(answer.recommendedProductId));
    return res.json({ success: true, reply: String(answer.reply || 'Aapke comfort ke liye main products mein help kar sakta hoon.'), recommendedProduct: recommended || null });
  } catch (error) {
    console.error('AI chat error:', error.code || 'AI_UNKNOWN', error.message);
    const message = error.code === 'AI_AUTH_FAILED'
      ? 'AI assistant configuration invalid. Please update the Gemini API key in AI Blogger settings.'
      : error.code === 'AI_RATE_LIMITED'
        ? 'AI assistant is busy right now. Please try again in a minute.'
        : 'AI assistant is temporarily unavailable. Please try again shortly.';
    return res.status(error.code === 'AI_AUTH_FAILED' ? 503 : 500).json({ success: false, message });
  }
};
