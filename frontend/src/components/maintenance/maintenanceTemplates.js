import React from 'react';
import { FiTool, FiClock, FiHeart, FiSun, FiMoon, FiFeather } from 'react-icons/fi';

export const MAINTENANCE_TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic Cream',
    description: 'Warm cream & gold — matches Kurti Elegance default branding',
    preview: 'from-[#FAF6EE] to-yellow-50',
  },
  {
    id: 'elegant',
    name: 'Elegant Boutique',
    description: 'Deep charcoal with gold accents, premium feel',
    preview: 'from-gray-900 to-gray-800',
  },
  {
    id: 'festive',
    name: 'Festive Maroon',
    description: 'Rich maroon & amber for sales or festival downtime',
    preview: 'from-[#4a0e0e] to-[#7c2d12]',
  },
  {
    id: 'minimal',
    name: 'Clean Minimal',
    description: 'Simple white layout, focused message',
    preview: 'from-white to-gray-50',
  },
  {
    id: 'night',
    name: 'Soft Night',
    description: 'Calm indigo gradient, easy on the eyes',
    preview: 'from-indigo-950 to-slate-900',
  },
];

const ReturnBadge = ({ estimatedReturn, className = '' }) => {
  if (!estimatedReturn) return null;
  return (
    <p className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full ${className}`}>
      <FiClock size={16} />
      Expected back: {estimatedReturn}
    </p>
  );
};

const BrandFooter = ({ light }) => (
  <p className={`text-xs mt-10 ${light ? 'text-white/40' : 'text-gray-400'}`}>
    Kurti Elegance · Maintenance mode
  </p>
);

const templates = {
  classic: ({ title, message, estimatedReturn }) => (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF6EE] via-white to-yellow-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-yellow-100 flex items-center justify-center shadow-lg shadow-yellow-200/50">
          <FiTool size={36} className="text-yellow-600" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-800 mb-4">{title}</h1>
        <p className="text-gray-500 leading-relaxed mb-6">{message}</p>
        <ReturnBadge estimatedReturn={estimatedReturn} className="text-yellow-700 bg-yellow-50 border border-yellow-200" />
        <BrandFooter />
      </div>
    </div>
  ),

  elegant: ({ title, message, estimatedReturn }) => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center border border-yellow-500/20 rounded-3xl p-10 md:p-14 bg-white/5 backdrop-blur-sm shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-yellow-500/60 flex items-center justify-center">
          <FiFeather size={28} className="text-yellow-400" />
        </div>
        <p className="text-yellow-500/80 text-xs tracking-[0.3em] uppercase mb-3">Kurti Elegance</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">{title}</h1>
        <p className="text-gray-300 leading-relaxed mb-6">{message}</p>
        <ReturnBadge estimatedReturn={estimatedReturn} className="text-yellow-200 bg-yellow-500/10 border border-yellow-500/30" />
        <BrandFooter light />
      </div>
    </div>
  ),

  festive: ({ title, message, estimatedReturn }) => (
    <div className="min-h-screen bg-gradient-to-br from-[#3d0c0c] via-[#5c1818] to-[#8b3a1a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,#fbbf24_0%,transparent_50%)]" />
      <div className="max-w-lg w-full text-center relative z-10">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
          <FiSun size={36} className="text-amber-300" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-amber-50 mb-4">{title}</h1>
        <p className="text-amber-100/80 leading-relaxed mb-6">{message}</p>
        <ReturnBadge estimatedReturn={estimatedReturn} className="text-amber-100 bg-amber-500/20 border border-amber-400/40" />
        <BrandFooter light />
      </div>
    </div>
  ),

  minimal: ({ title, message, estimatedReturn }) => (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center border-t-4 border-gray-900 pt-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">{title}</h1>
        <p className="text-gray-600 leading-relaxed mb-8 text-sm md:text-base">{message}</p>
        <ReturnBadge estimatedReturn={estimatedReturn} className="text-gray-700 bg-gray-100 border border-gray-200" />
        <BrandFooter />
      </div>
    </div>
  ),

  night: ({ title, message, estimatedReturn }) => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
          <FiMoon size={36} className="text-indigo-300" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">{title}</h1>
        <p className="text-indigo-200/80 leading-relaxed mb-6">{message}</p>
        <ReturnBadge estimatedReturn={estimatedReturn} className="text-indigo-100 bg-indigo-500/20 border border-indigo-400/30" />
        <p className="text-xs text-indigo-400/60 mt-10 flex items-center justify-center gap-1">
          <FiHeart size={12} /> Kurti Elegance
        </p>
      </div>
    </div>
  ),
};

export const DEFAULT_MAINTENANCE_TEMPLATE = 'classic';

export const MaintenanceTemplateView = ({ config, preview = false }) => {
  const templateId = config?.template || DEFAULT_MAINTENANCE_TEMPLATE;
  const Renderer = templates[templateId] || templates.classic;
  const title = config?.title || "We'll Be Back Soon";
  const message = config?.message || 'Our store is undergoing scheduled updates. Thank you for your patience.';
  const estimatedReturn = config?.estimatedReturn;

  if (preview) {
    return (
      <div className="relative w-full h-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
        <div className="absolute inset-0 origin-top-left scale-[0.38] w-[263%] h-[263%] pointer-events-none">
          <Renderer title={title} message={message} estimatedReturn={estimatedReturn} />
        </div>
      </div>
    );
  }

  return <Renderer title={title} message={message} estimatedReturn={estimatedReturn} />;
};
