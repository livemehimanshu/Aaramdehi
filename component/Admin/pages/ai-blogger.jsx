import React, { useEffect, useState } from 'react';
import { Bot, Save, ShieldCheck, WandSparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminGetAllSettingsAPI, createSettingAPI, updateSettingAPI, generateAutoBlogAPI, getAiBlogQueueAPI, createAiBlogQueueAPI, deleteAiBlogQueueAPI } from '../../../src/api/authAndAdminApi';

const SETTING_KEYS = {
  geminiApiKey: 'AI_BLOGGER_GEMINI_API_KEY',
  unsplashApiKey: 'AI_BLOGGER_UNSPLASH_API_KEY',
  selectedModel: 'AI_BLOGGER_MODEL',
  enabled: 'AI_BLOGGER_ENABLED',
};

const defaultValues = { geminiApiKey: '', unsplashApiKey: '', selectedModel: 'gemini-3.6-flash', enabled: 'false' };

export default function AiBloggerPage() {
  const [values, setValues] = useState(defaultValues);
  const [existing, setExisting] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [queue, setQueue] = useState([]);
  const [scheduledTopic, setScheduledTopic] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const [response, queueResponse] = await Promise.all([adminGetAllSettingsAPI(), getAiBlogQueueAPI()]);
      if (queueResponse.success) setQueue(queueResponse.data || []);
      if (response.success) {
        const settings = Object.fromEntries((response.data || []).map((item) => [item.key, item]));
        setExisting(settings);
        setValues({
          geminiApiKey: settings[SETTING_KEYS.geminiApiKey]?.value || '',
          unsplashApiKey: settings[SETTING_KEYS.unsplashApiKey]?.value || '',
          selectedModel: settings[SETTING_KEYS.selectedModel]?.value === 'gemini-2.5-flash'
            ? defaultValues.selectedModel
            : settings[SETTING_KEYS.selectedModel]?.value || defaultValues.selectedModel,
          enabled: settings[SETTING_KEYS.enabled]?.value === true || settings[SETTING_KEYS.enabled]?.value === 'true' ? 'true' : 'false',
        });
      } else {
        toast.error(response.message || 'Unable to load AI blogger settings');
      }
      setLoading(false);
    };
    loadSettings();
  }, []);

  const saveSetting = async (key, value) => {
    const current = existing[key];
    if (current) return updateSettingAPI(key, value);

    // Prefer update first so a stale settings list cannot cause duplicate-key 400s.
    const updated = await updateSettingAPI(key, value);
    if (updated?.success || !/not found/i.test(updated?.message || '')) return updated;

    const created = await createSettingAPI({ key, value, category: 'ai-blogger', isEditable: true });
    if (created?.success && created.data) {
      setExisting((currentSettings) => ({ ...currentSettings, [key]: created.data }));
    }
    return created;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!values.geminiApiKey.trim()) return toast.error('Gemini API key is required');
    setSaving(true);
    try {
      const results = await Promise.all(Object.entries(SETTING_KEYS).map(([field, key]) => saveSetting(key, values[field])));
      const failed = results.find((result) => !result?.success);
      if (failed) throw new Error(failed.message || 'Unable to save settings');
      toast.success('AI Blogger settings saved');
    } catch (error) {
      toast.error(error.message || 'Unable to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return toast.error('Enter a topic for the article');
    setGenerating(true);
    try {
      const response = await generateAutoBlogAPI(topic.trim());
      if (!response.success) throw new Error(response.message || 'AI blog generation failed');
      toast.success('AI blog generated and published successfully');
      setTopic('');
    } catch (error) {
      toast.error(error.message || 'AI blog generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSchedule = async (event) => {
    event.preventDefault();
    if (!scheduledTopic.trim() || !scheduledAt) return toast.error('Enter a topic and publish date/time');
    if (new Date(scheduledAt).getTime() <= Date.now()) return toast.error('Choose a future publish time');
    setScheduling(true);
    try {
      const response = await createAiBlogQueueAPI(scheduledTopic.trim(), new Date(scheduledAt).toISOString());
      if (!response.success) throw new Error(response.message || 'Unable to schedule topic');
      setQueue((current) => [...current, response.data].sort((a, b) => new Date(a.publishAt) - new Date(b.publishAt)));
      setScheduledTopic('');
      setScheduledAt('');
      toast.success('Topic scheduled successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Unable to schedule topic');
    } finally {
      setScheduling(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      const response = await deleteAiBlogQueueAPI(id);
      if (!response.success) throw new Error(response.message || 'Unable to delete schedule');
      setQueue((current) => current.filter((item) => item._id !== id));
      toast.success('Scheduled topic deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Unable to delete schedule');
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Loading AI Blogger settings...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-black text-white"><Bot className="text-emerald-400" /> AI Blogger</h1>
        <p className="mt-2 text-sm text-slate-400">Configure automated article generation. Keys are stored in the protected server settings collection.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-white/10 bg-[#161B28] p-6 shadow-xl">
        <div className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-slate-300">
          <ShieldCheck className="mt-0.5 shrink-0 text-emerald-400" size={18} />
          <span>Google service-account credentials are intentionally kept in GitHub Actions secrets, never in this form.</span>
        </div>
        <label className="block text-sm font-semibold text-slate-300">Gemini API key
          <input required type="password" value={values.geminiApiKey} onChange={(event) => setValues({ ...values, geminiApiKey: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0F1219] px-4 py-3 text-white outline-none focus:border-emerald-400" placeholder="AIza..." />
        </label>
        <label className="block text-sm font-semibold text-slate-300">Unsplash API key (optional)
          <input type="password" value={values.unsplashApiKey} onChange={(event) => setValues({ ...values, unsplashApiKey: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0F1219] px-4 py-3 text-white outline-none focus:border-emerald-400" placeholder="Optional cover-image provider key" />
        </label>
        <label className="block text-sm font-semibold text-slate-300">Gemini model
          <select value={values.selectedModel} onChange={(event) => setValues({ ...values, selectedModel: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0F1219] px-4 py-3 text-white outline-none focus:border-emerald-400">
            <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          </select>
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-300">
          <input type="checkbox" checked={values.enabled === 'true'} onChange={(event) => setValues({ ...values, enabled: event.target.checked ? 'true' : 'false' })} className="h-4 w-4 accent-emerald-400" />
          Enable scheduled auto-publishing
        </label>
        <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-[#0F1219] disabled:opacity-60"><Save size={18} />{saving ? 'Saving...' : 'Save AI Settings'}</button>
      </form>
      <section className="space-y-4 rounded-2xl border border-white/10 bg-[#161B28] p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white">Generate An Article Now</h2>
          <p className="mt-1 text-sm text-slate-400">Enter a topic. Gemini will create the SEO article, fetch a cover image, publish it, and notify Google when configured.</p>
        </div>
        <textarea value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={500} rows={4} placeholder="Example: How to choose the perfect pillow for side sleepers" className="w-full resize-y rounded-xl border border-white/10 bg-[#0F1219] px-4 py-3 text-white outline-none focus:border-emerald-400" />
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">{topic.length}/500</span>
          <button type="button" onClick={handleGenerate} disabled={generating} className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 font-bold text-white disabled:opacity-60"><WandSparkles size={18} />{generating ? 'Generating...' : 'Generate & Publish Now'}</button>
        </div>
      </section>
      <section className="space-y-5 rounded-2xl border border-white/10 bg-[#161B28] p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white">Schedule Multiple Topics</h2>
          <p className="mt-1 text-sm text-slate-400">Add topics to the queue. The scheduled GitHub Action publishes due topics automatically.</p>
        </div>
        <form onSubmit={handleSchedule} className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input value={scheduledTopic} onChange={(event) => setScheduledTopic(event.target.value)} maxLength={500} placeholder="Article topic" className="rounded-xl border border-white/10 bg-[#0F1219] px-4 py-3 text-white outline-none focus:border-emerald-400" />
          <input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="rounded-xl border border-white/10 bg-[#0F1219] px-4 py-3 text-white outline-none focus:border-emerald-400" />
          <button type="submit" disabled={scheduling} className="rounded-xl bg-emerald-500 px-5 py-3 font-bold text-[#0F1219] disabled:opacity-60">{scheduling ? 'Scheduling...' : 'Add To Queue'}</button>
        </form>
        <div className="space-y-2">
          {queue.length === 0 ? <p className="text-sm text-slate-500">No scheduled topics yet.</p> : queue.map((item) => (
            <div key={item._id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0F1219] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0"><p className="break-words font-semibold text-white">{item.topic}</p><p className="mt-1 text-xs text-slate-500">{item.status} · {new Date(item.publishAt).toLocaleString('en-IN')}</p></div>
              {item.status === 'Scheduled' && <button type="button" onClick={() => handleDeleteSchedule(item._id)} className="self-start rounded-lg border border-rose-400/30 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-400/10 sm:self-auto">Delete</button>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
