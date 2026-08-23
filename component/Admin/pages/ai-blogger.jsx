import React, { useEffect, useState } from 'react';
import { Bot, Save, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminGetAllSettingsAPI, createSettingAPI, updateSettingAPI } from '../../../src/api/authAndAdminApi';

const SETTING_KEYS = {
  geminiApiKey: 'AI_BLOGGER_GEMINI_API_KEY',
  unsplashApiKey: 'AI_BLOGGER_UNSPLASH_API_KEY',
  selectedModel: 'AI_BLOGGER_MODEL',
  enabled: 'AI_BLOGGER_ENABLED',
};

const defaultValues = { geminiApiKey: '', unsplashApiKey: '', selectedModel: 'gemini-2.5-flash', enabled: 'false' };

export default function AiBloggerPage() {
  const [values, setValues] = useState(defaultValues);
  const [existing, setExisting] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const response = await adminGetAllSettingsAPI();
      if (response.success) {
        const settings = Object.fromEntries((response.data || []).map((item) => [item.key, item]));
        setExisting(settings);
        setValues({
          geminiApiKey: settings[SETTING_KEYS.geminiApiKey]?.value || '',
          unsplashApiKey: settings[SETTING_KEYS.unsplashApiKey]?.value || '',
          selectedModel: settings[SETTING_KEYS.selectedModel]?.value || defaultValues.selectedModel,
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
    return createSettingAPI({ key, value, category: 'ai-blogger', isEditable: true });
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
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
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
    </div>
  );
}
