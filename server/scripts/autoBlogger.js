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

const getFirebaseServiceAccount = () => {
  if (process.env.FIREBASE_CONFIG_JSON) {
    return JSON.parse(process.env.FIREBASE_CONFIG_JSON);
  }

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };
  }

  const localKeyPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'config', 'serviceAccountKey.json');
  if (fs.existsSync(localKeyPath)) {
    return JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
  }

  throw new Error('Firebase credentials are missing. Set FIREBASE_CONFIG_JSON or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.');
};

const serviceAccount = getFirebaseServiceAccount();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://aaramdehi-91f82-default-rtdb.firebaseio.com/'
  });
}

const database = admin.database();
const settingsRef = database.ref('settings');
const blogsRef = database.ref('blogs');
const queueRef = database.ref('blog_queue');
const logsRef = database.ref('blog_logs');

const settingValue = (settings, key, fallback = '') => {
  const setting = Object.values(settings || {}).find((item) => item?.key === key);
  return setting?.value ?? fallback;
};

const normalizeModel = (value) => {
  const model = String(value || '').trim();
  return model === 'gemini-2.5-flash' || !model ? 'gemini-3.6-flash' : model;
};

const slugify = (value) => String(value || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const parseModelJson = (text) => {
  const cleaned = String(text || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Gemini did not return a JSON object');
  return JSON.parse(cleaned.slice(start, end + 1));
};

async function generateArticle(apiKey, model, topic, config = {}) {
  const prompt = `You are an expert SEO editor for Aaramdehi, an Indian furniture and home-comfort store. Write an original, useful article about: "${topic}".
Language: ${config.language || 'English'}. For Hinglish, use natural Hindi and English in Latin script.
Writing tone: ${config.writingTone || 'Cozy & Conversational'}.
Primary focus keyword: ${config.focusKeyword || topic}. Include it naturally.
Category hint: ${config.categoryHint || 'home comfort'}.
Include natural internal links to /category/doormats, /category/pillows, and /category/towels where relevant.
Return ONLY valid JSON with these keys: title, slug, excerpt, content, metaTitle, metaDescription, metaKeywords, category, author, imageSearchQuery, socialCaption, hashtags. content must be safe HTML using h2, h3, p, ul, li, strong, and a tags. Use no scripts and no JSON fences. Keep the article 700-1000 words, helpful and specific, not repetitive. Make metaTitle under 60 characters and metaDescription under 160 characters.`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, responseMimeType: 'application/json' } })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `Gemini request failed (${response.status})`);
  return parseModelJson(data.candidates?.[0]?.content?.parts?.[0]?.text);
}

async function fetchCoverImage(apiKey, query) {
  if (!apiKey) return '';
  const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${encodeURIComponent(apiKey)}&per_page=1`);
  if (!response.ok) throw new Error(`Unsplash request failed (${response.status})`);
  const data = await response.json();
  return data.results?.[0]?.urls?.regular || '';
}

const countWords = (value) => String(value || '').trim().split(/\s+/).filter(Boolean).length;

async function notifyGoogle(url) {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) return;
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/indexing'] });
  const client = await auth.getClient();
  await google.indexing({ version: 'v3', auth: client }).urlNotifications.publish({ requestBody: { url, type: 'URL_UPDATED' } });
}

export async function runAutomation({ topic: requestedTopic = '', force = false, focusKeyword = '', language = '', categoryHint = '' } = {}) {
  const [settingsSnapshot, configSnapshot, blogsSnapshot, queueSnapshot] = await Promise.all([settingsRef.once('value'), database.ref('admin_settings/ai_config').once('value'), blogsRef.once('value'), queueRef.once('value')]);
  const settings = settingsSnapshot.val() || {};
  const aiConfig = configSnapshot.val() || {};
  const enabled = String(settingValue(settings, 'AI_BLOGGER_ENABLED', 'false')).toLowerCase() === 'true';
  if (!enabled && !force && process.env.FORCE_AUTO_BLOG !== 'true') {
    console.log('AI Blogger is disabled. Enable it from /admin/ai-blogger or set FORCE_AUTO_BLOG=true.');
    return;
  }

  const geminiApiKey = process.env.GEMINI_API_KEY || settingValue(settings, 'AI_BLOGGER_GEMINI_API_KEY');
  const unsplashApiKey = process.env.UNSPLASH_API_KEY || settingValue(settings, 'AI_BLOGGER_UNSPLASH_API_KEY');
  const model = normalizeModel(process.env.GEMINI_MODEL || settingValue(settings, 'AI_BLOGGER_MODEL', 'gemini-3.6-flash'));
  if (!geminiApiKey) throw new Error('Gemini API key is not configured');

  const existingBlogs = blogsSnapshot.val() ? Object.values(blogsSnapshot.val()) : [];
  const configuredTopics = String(settingValue(settings, 'AI_BLOGGER_TOPIC_LIST', '') || '')
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const currentTime = Date.now();
  const dueQueueItems = Object.entries(queueSnapshot.val() || {})
    .map(([id, item]) => ({ id, ...item }))
    .filter((item) => ['pending', 'Scheduled'].includes(item.status) && new Date(item.publishAt).getTime() <= currentTime)
    .sort((a, b) => new Date(a.publishAt) - new Date(b.publishAt));
  const queueItem = !requestedTopic.trim() && !force ? dueQueueItems[0] : null;
  if (!requestedTopic.trim() && !force && !queueItem && configuredTopics.length === 0) {
    console.log('No scheduled AI blog topic is due.');
    return;
  }
  const topicPool = configuredTopics.length > 0 ? configuredTopics : topics;
  const topic = requestedTopic.trim() || queueItem?.topic || topicPool[existingBlogs.length % topicPool.length];
  const article = await generateArticle(geminiApiKey, model, topic, {
    writingTone: aiConfig.writingTone,
    focusKeyword: focusKeyword || queueItem?.focusKeyword || aiConfig.focusKeyword,
    language: language || queueItem?.language || aiConfig.language,
    categoryHint: categoryHint || queueItem?.categoryHint || aiConfig.categoryHint,
  });
  const slug = slugify(article.slug || article.title);
  if (!slug || !article.title || !article.content) throw new Error('Generated article is missing required fields');
  if (existingBlogs.some((blog) => blog.slug === slug)) throw new Error(`Blog slug already exists: ${slug}`);

  const image = await fetchCoverImage(unsplashApiKey, article.imageSearchQuery || topic);
  const now = new Date().toISOString();
  const articleWordCount = countWords(article.content);
  const readTimeMinutes = Math.max(1, Math.ceil(articleWordCount / 200));
  const articleLanguage = language || queueItem?.language || aiConfig.language || 'English';
  const publishingMode = aiConfig.publishingMode === 'draft' ? 'draft' : 'publish';
  const shouldPublish = publishingMode === 'publish' && String(aiConfig.autoPublishEnabled).toLowerCase() !== 'false';
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
    status: shouldPublish ? 'Published' : 'Draft',
    ...(shouldPublish ? { publishedAt: now } : {}),
    views: 0,
    createdAt: now,
    updatedAt: now,
    source: 'ai-automation',
    writingTone: aiConfig.writingTone || 'Cozy & Conversational',
    focusKeyword: focusKeyword || queueItem?.focusKeyword || aiConfig.focusKeyword || topic,
    language: articleLanguage,
    readTime: `${readTimeMinutes} min read`,
    wordCount: articleWordCount,
    socialCaption: article.socialCaption || '',
    hashtags: article.hashtags || '#Aaramdehi #HomeDecor #CozyHome',
  };

  const key = blogsRef.push().key;
  await blogsRef.child(key).set(blog);
  if (queueItem) {
    await queueRef.child(queueItem.id).update({ status: shouldPublish ? 'published' : 'draft', blogId: key, completedAt: now });
  }
  const targetUrl = `${process.env.FRONTEND_URL || 'https://www.aaramdehi.co.in'}/blog/${slug}`;
  if (shouldPublish) await notifyGoogle(targetUrl).catch((error) => console.warn('Google Indexing notification skipped:', error.message));
  await logsRef.push({ title: article.title, topic, status: 'success', mode: shouldPublish ? 'publish' : 'draft', timestamp: now, blogId: key });
  console.log(`${shouldPublish ? 'Published' : 'Saved draft'} AI blog: ${targetUrl}`);
  return { blogId: key, title: article.title, status: blog.status, mode: publishingMode };
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectExecution) {
  runAutomation().catch((error) => {
    console.error('AI Blogger failed:', error);
    process.exitCode = 1;
  });
}
