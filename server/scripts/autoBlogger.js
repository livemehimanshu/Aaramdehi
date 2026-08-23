import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '.env') });

const topics = [
  'How to create a calm and comfortable bedroom with the right bedding',
  'How to style a small living room with practical comfort-first furniture',
  'How to choose supportive pillows for better sleep and posture',
  'Simple home decor changes that make everyday spaces feel more relaxing',
  'How to choose the right door mat for a clean and welcoming home'
];

const serviceAccount = process.env.FIREBASE_CONFIG_JSON
  ? JSON.parse(process.env.FIREBASE_CONFIG_JSON)
  : JSON.parse(fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'config', 'serviceAccountKey.json'), 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://aaramdehi-91f82-default-rtdb.firebaseio.com/'
  });
}

const database = admin.database();
const settingsRef = database.ref('settings');
const blogsRef = database.ref('blogs');

const settingValue = (settings, key, fallback = '') => {
  const setting = Object.values(settings || {}).find((item) => item?.key === key);
  return setting?.value ?? fallback;
};

const slugify = (value) => String(value || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const parseModelJson = (text) => {
  const cleaned = String(text || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Gemini did not return a JSON object');
  return JSON.parse(cleaned.slice(start, end + 1));
};

async function generateArticle(apiKey, model, topic) {
  const prompt = `You are an expert SEO editor for Aaramdehi, an Indian furniture and home-comfort store. Write an original, useful article about: "${topic}". Return ONLY valid JSON with these keys: title, slug, excerpt, content, metaTitle, metaDescription, metaKeywords, category, author. content must be safe HTML using h2, h3, p, ul, li, and strong tags. Use no markdown, no scripts, no links, and no JSON markdown fences. Keep the article 700-1000 words, helpful and specific, not repetitive.`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, responseMimeType: 'application/json' } })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `Gemini request failed (${response.status})`);
  return parseModelJson(data.candidates?.[0]?.content?.parts?.[0]?.text);
}

async function fetchCoverImage(apiKey, topic) {
  if (!apiKey) return '';
  const response = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(topic)}&client_id=${encodeURIComponent(apiKey)}`);
  if (!response.ok) throw new Error(`Unsplash request failed (${response.status})`);
  const data = await response.json();
  return data.urls?.regular || '';
}

async function notifyGoogle(url) {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) return;
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/indexing'] });
  const client = await auth.getClient();
  await google.indexing({ version: 'v3', auth: client }).urlNotifications.publish({ requestBody: { url, type: 'URL_UPDATED' } });
}

async function run() {
  const [settingsSnapshot, blogsSnapshot] = await Promise.all([settingsRef.once('value'), blogsRef.once('value')]);
  const settings = settingsSnapshot.val() || {};
  const enabled = String(settingValue(settings, 'AI_BLOGGER_ENABLED', 'false')).toLowerCase() === 'true';
  if (!enabled && process.env.FORCE_AUTO_BLOG !== 'true') {
    console.log('AI Blogger is disabled. Enable it from /admin/ai-blogger or set FORCE_AUTO_BLOG=true.');
    return;
  }

  const geminiApiKey = process.env.GEMINI_API_KEY || settingValue(settings, 'AI_BLOGGER_GEMINI_API_KEY');
  const unsplashApiKey = process.env.UNSPLASH_API_KEY || settingValue(settings, 'AI_BLOGGER_UNSPLASH_API_KEY');
  const model = process.env.GEMINI_MODEL || settingValue(settings, 'AI_BLOGGER_MODEL', 'gemini-2.5-flash');
  if (!geminiApiKey) throw new Error('Gemini API key is not configured');

  const existingBlogs = blogsSnapshot.val() ? Object.values(blogsSnapshot.val()) : [];
  const topic = topics[existingBlogs.length % topics.length];
  const article = await generateArticle(geminiApiKey, model, topic);
  const slug = slugify(article.slug || article.title);
  if (!slug || !article.title || !article.content) throw new Error('Generated article is missing required fields');
  if (existingBlogs.some((blog) => blog.slug === slug)) throw new Error(`Blog slug already exists: ${slug}`);

  const image = await fetchCoverImage(unsplashApiKey, topic);
  const now = new Date().toISOString();
  const blog = {
    title: article.title,
    slug,
    excerpt: article.excerpt || '',
    content: article.content,
    metaTitle: article.metaTitle || article.title,
    metaDescription: article.metaDescription || article.excerpt || '',
    metaKeywords: article.metaKeywords || '',
    category: article.category || 'Home Decor',
    author: article.author || 'Aaramdehi Editorial Team',
    image,
    status: 'Published',
    publishedAt: now,
    views: 0,
    createdAt: now,
    updatedAt: now,
    source: 'ai-automation'
  };

  const key = blogsRef.push().key;
  await blogsRef.child(key).set(blog);
  const targetUrl = `${process.env.FRONTEND_URL || 'https://www.aaramdehi.co.in'}/blog/${slug}`;
  await notifyGoogle(targetUrl).catch((error) => console.warn('Google Indexing notification skipped:', error.message));
  console.log(`Published AI blog: ${targetUrl}`);
}

run().catch((error) => {
  console.error('AI Blogger failed:', error);
  process.exitCode = 1;
});
