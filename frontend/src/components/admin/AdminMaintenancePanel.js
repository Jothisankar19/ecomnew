import React, { useState, useEffect } from 'react';
import { FiTool, FiSave, FiAlertTriangle, FiEye, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import {
  MAINTENANCE_TEMPLATES,
  DEFAULT_MAINTENANCE_TEMPLATE,
  MaintenanceTemplateView,
} from '../maintenance/maintenanceTemplates';

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 text-sm';

const defaultConfig = () => ({
  enabled: false,
  template: DEFAULT_MAINTENANCE_TEMPLATE,
  title: "We'll Be Back Soon",
  message: 'Our store is undergoing scheduled updates. Thank you for your patience.',
  estimatedReturn: '',
});

const AdminMaintenancePanel = () => {
  const [config, setConfig] = useState(defaultConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => {
        if (data.settings?.maintenanceMode) {
          const m = data.settings.maintenanceMode;
          setConfig({
            enabled: !!m.enabled,
            template: m.template || DEFAULT_MAINTENANCE_TEMPLATE,
            title: m.title || defaultConfig().title,
            message: m.message || defaultConfig().message,
            estimatedReturn: m.estimatedReturn || '',
          });
        }
      })
      .catch(() => toast.error('Failed to load maintenance settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/settings', { maintenanceMode: config });
      if (res.data.success) {
        toast.success(
          config.enabled
            ? 'Maintenance on — visitors only see your template page'
            : 'Maintenance settings saved'
        );
        if (res.data.settings?.maintenanceMode) {
          const m = res.data.settings.maintenanceMode;
          setConfig({
            enabled: !!m.enabled,
            template: m.template || DEFAULT_MAINTENANCE_TEMPLATE,
            title: m.title || '',
            message: m.message || '',
            estimatedReturn: m.estimatedReturn || '',
          });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="h-32 bg-gray-50 rounded-2xl animate-pulse" />;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
      <div className="px-5 py-4 border-b border-gray-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.enabled ? 'bg-orange-100' : 'bg-gray-100'}`}>
            <FiTool size={18} className={config.enabled ? 'text-orange-600' : 'text-gray-500'} />
          </div>
          <div>
            <h3 className="text-gray-800 font-bold">Website Maintenance</h3>
            <p className="text-gray-400 text-xs">
              Pick a template, customize text, then turn maintenance on — the full store is hidden from visitors
            </p>
          </div>
        </div>
        <label className="inline-flex items-center gap-3 cursor-pointer">
          <span className={`text-sm font-bold ${config.enabled ? 'text-orange-600' : 'text-gray-500'}`}>
            {config.enabled ? 'Maintenance ON' : 'Store Live'}
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-orange-500 transition-colors" />
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-6" />
          </div>
        </label>
      </div>

      {config.enabled && (
        <div className="mx-5 mt-4 flex items-start gap-2 p-3 rounded-xl bg-orange-50 border border-orange-100 text-sm text-orange-800">
          <FiAlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
          Customers cannot open any shop page (home, products, cart, login, etc.). Only this maintenance template is shown. Admin stays at /admin.
        </div>
      )}

      <div className="p-5 border-b border-gray-50">
        <p className="text-sm font-semibold text-gray-700 mb-3">Choose page template</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {MAINTENANCE_TEMPLATES.map((t) => {
            const selected = config.template === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setConfig({ ...config, template: t.id })}
                className={`relative text-left rounded-xl border-2 overflow-hidden transition-all ${
                  selected ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`h-16 bg-gradient-to-br ${t.preview}`} />
                <div className="p-2.5">
                  <p className="text-xs font-bold text-gray-800 leading-tight">{t.name}</p>
                  {selected && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                      <FiCheck size={12} className="text-white" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {MAINTENANCE_TEMPLATES.find((t) => t.id === config.template)?.description}
        </p>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 border-b border-gray-50">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page title</label>
            <input type="text" value={config.title} onChange={(e) => setConfig({ ...config, title: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected return (optional)</label>
            <input
              type="text"
              value={config.estimatedReturn}
              onChange={(e) => setConfig({ ...config, estimatedReturn: e.target.value })}
              className={inputCls}
              placeholder="e.g. Tonight 8 PM or 25 May 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message to visitors</label>
            <textarea
              rows={3}
              value={config.message}
              onChange={(e) => setConfig({ ...config, message: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FiEye size={14} />
            Live preview
          </p>
          <div className="h-64 md:h-80">
            <MaintenanceTemplateView config={config} preview />
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold text-sm disabled:opacity-70"
        >
          <FiSave size={16} />
          {saving ? 'Saving…' : 'Save & apply template'}
        </button>
      </div>
    </div>
  );
};

export default AdminMaintenancePanel;
