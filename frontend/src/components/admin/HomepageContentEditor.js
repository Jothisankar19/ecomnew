import React, { useState, useEffect } from 'react';
import {
  FiSave, FiEdit3, FiPlus, FiTrash2, FiStar, FiMaximize2, FiMessageCircle, FiFilm, FiGrid,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import MediaDropZone from './MediaDropZone';

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm';

const emptyTestimonial = () => ({
  name: '',
  city: '',
  product: '',
  rating: 5,
  text: '',
  avatar: '',
  photo: { url: '', public_id: '' },
  isActive: true,
});

const DEFAULT_TESTIMONIALS_SECTION = {
  tag: 'Customer Love',
  title: 'What Our Customers Say',
  description: '',
};

const StarRatingInput = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="p-0.5 rounded transition-colors hover:scale-110"
        aria-label={`${star} stars`}
      >
        <FiStar
          size={20}
          className={star <= value ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
        />
      </button>
    ))}
    <span className="text-xs text-gray-500 ml-2">{value} / 5</span>
  </div>
);

const SectionPanel = ({ icon: Icon, title, subtitle, children, onSave, saving, saveLabel }) => (
  <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50/80 to-white overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-start justify-between gap-3 bg-white/80">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-yellow-50 border border-yellow-100 flex items-center justify-center">
          <Icon size={20} className="text-yellow-600" />
        </div>
        <div>
          <h4 className="text-gray-800 font-bold">{title}</h4>
          <p className="text-gray-400 text-xs">{subtitle}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-70 shadow-sm"
      >
        {saving ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <FiSave size={15} />
        )}
        {saveLabel}
      </button>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const HomepageContentEditor = () => {
  const [tab, setTab] = useState('sizeGuide');

  const [sizeGuideConfig, setSizeGuideConfig] = useState({
    tag: 'Size Guide',
    title: 'Find Your Perfect Fit',
    description: 'All our kurtis are available in XS to XXXL and Free Size',
    note: '* Measurements are in inches · Sizes may vary slightly by style · Standard Indian Fitting',
    image: { url: '', public_id: '' },
  });
  const [sizes, setSizes] = useState([
    { size: 'XS', chest: '32"', waist: '26"', hip: '34"', length: '44"' },
    { size: 'S', chest: '34"', waist: '28"', hip: '36"', length: '44"' },
    { size: 'M', chest: '36"', waist: '30"', hip: '38"', length: '46"' },
    { size: 'L', chest: '38"', waist: '32"', hip: '40"', length: '46"' },
    { size: 'XL', chest: '40"', waist: '34"', hip: '42"', length: '48"' },
  ]);

  const [videoSectionConfig, setVideoSectionConfig] = useState({
    badge: 'Featured Video',
    title: 'A Glimpse Of Our Craft',
    description: '',
    videoUrl: '',
    video: { url: '', public_id: '' },
  });

  const [testimonialsSection, setTestimonialsSection] = useState(DEFAULT_TESTIMONIALS_SECTION);
  const [testimonials, setTestimonials] = useState([emptyTestimonial(), emptyTestimonial()]);

  const [sizeGuideLoading, setSizeGuideLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [sizeGuideImageUploading, setSizeGuideImageUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [testimonialPhotoUploading, setTestimonialPhotoUploading] = useState(null);

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => {
        if (!data.success || !data.settings) return;
        const s = data.settings;
        setSizeGuideConfig({
          tag: s.sizeGuide?.tag ?? 'Size Guide',
          title: s.sizeGuide?.title ?? 'Find Your Perfect Fit',
          description: s.sizeGuide?.description ?? '',
          note: s.sizeGuide?.note ?? '',
          image: s.sizeGuide?.image ?? { url: '', public_id: '' },
        });
        if (Array.isArray(s.sizeGuide?.sizes) && s.sizeGuide.sizes.length) {
          setSizes(s.sizeGuide.sizes);
        }
        setVideoSectionConfig({
          badge: s.videoSection?.badge ?? 'Featured Video',
          title: s.videoSection?.title ?? 'A Glimpse Of Our Craft',
          description: s.videoSection?.description ?? '',
          videoUrl: s.videoSection?.videoUrl ?? '',
          video: s.videoSection?.video ?? { url: '', public_id: '' },
        });
        setTestimonialsSection({
          tag: s.testimonialsSection?.tag ?? DEFAULT_TESTIMONIALS_SECTION.tag,
          title: s.testimonialsSection?.title ?? DEFAULT_TESTIMONIALS_SECTION.title,
          description: s.testimonialsSection?.description ?? '',
        });
        const saved = Array.isArray(s.testimonials) ? s.testimonials : [];
        setTestimonials(saved.length ? saved.map((t) => ({ ...emptyTestimonial(), ...t, photo: t.photo || { url: '', public_id: '' } })) : [emptyTestimonial()]);
      })
      .catch(() => toast.error('Failed to load homepage content.'));
  }, []);

  const uploadFile = async (file, folder) => {
    const fd = new FormData();
    fd.append('files', file);
    fd.append('folder', folder);
    const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data.files[0];
  };

  const getFilteredSizes = () =>
    (sizes || []).filter(
      (s) =>
        String(s.size || '').trim() ||
        String(s.chest || '').trim() ||
        String(s.waist || '').trim() ||
        String(s.hip || '').trim() ||
        String(s.length || '').trim()
    );

  const handleSizeGuideSave = async () => {
    try {
      setSizeGuideLoading(true);
      const payload = { ...sizeGuideConfig, sizes: getFilteredSizes() };
      const res = await api.put('/settings', { sizeGuide: payload });
      if (res.data.success) {
        toast.success('Size guide saved!');
        if (res.data.settings?.sizeGuide) {
          setSizeGuideConfig((p) => ({ ...p, ...res.data.settings.sizeGuide }));
          if (res.data.settings.sizeGuide.sizes) setSizes(res.data.settings.sizeGuide.sizes);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save size guide.');
    } finally {
      setSizeGuideLoading(false);
    }
  };

  const handleVideoSave = async () => {
    try {
      setVideoLoading(true);
      const res = await api.put('/settings', { videoSection: videoSectionConfig });
      if (res.data.success) {
        toast.success('Video section saved!');
        if (res.data.settings?.videoSection) setVideoSectionConfig((p) => ({ ...p, ...res.data.settings.videoSection }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save video section.');
    } finally {
      setVideoLoading(false);
    }
  };

  const getFilteredTestimonials = () =>
    testimonials.filter((t) => String(t.name || '').trim() && String(t.text || '').trim());

  const handleTestimonialsSave = async () => {
    const filtered = getFilteredTestimonials();
    if (!filtered.length) {
      return toast.error('Add at least one testimonial with a name and quote.');
    }
    try {
      setTestimonialsLoading(true);
      const res = await api.put('/settings', {
        testimonialsSection,
        testimonials: filtered.map((t) => ({
          ...t,
          avatar: (t.avatar || t.name?.charAt(0) || '?').toString().slice(0, 1).toUpperCase(),
          rating: Math.min(5, Math.max(1, Number(t.rating) || 5)),
          isActive: t.isActive !== false,
        })),
      });
      if (res.data.success) {
        toast.success('Testimonials saved!');
        if (res.data.settings?.testimonials) {
          setTestimonials(res.data.settings.testimonials.map((t) => ({ ...emptyTestimonial(), ...t })));
        }
        if (res.data.settings?.testimonialsSection) {
          setTestimonialsSection(res.data.settings.testimonialsSection);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save testimonials.');
    } finally {
      setTestimonialsLoading(false);
    }
  };

  const handleSizeGuideImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSizeGuideImageUploading(true);
    try {
      const uploaded = await uploadFile(file, 'ethnic-elegance/size-guide');
      setSizeGuideConfig((p) => ({ ...p, image: { url: uploaded.url, public_id: uploaded.public_id } }));
      toast.success('Diagram image uploaded!');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setSizeGuideImageUploading(false);
    }
  };

  const handleVideoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoUploading(true);
    try {
      const uploaded = await uploadFile(file, 'ethnic-elegance/videos');
      setVideoSectionConfig((p) => ({ ...p, video: { url: uploaded.url, public_id: uploaded.public_id } }));
      toast.success('Video uploaded!');
    } catch {
      toast.error('Video upload failed');
    } finally {
      setVideoUploading(false);
    }
  };

  const handleTestimonialPhoto = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTestimonialPhotoUploading(index);
    try {
      const uploaded = await uploadFile(file, 'ethnic-elegance/testimonials');
      setTestimonials((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], photo: { url: uploaded.url, public_id: uploaded.public_id } };
        if (!next[index].avatar && next[index].name) {
          next[index].avatar = next[index].name.charAt(0).toUpperCase();
        }
        return next;
      });
      toast.success('Customer photo uploaded!');
    } catch {
      toast.error('Photo upload failed');
    } finally {
      setTestimonialPhotoUploading(null);
    }
  };

  const updateTestimonial = (index, field, value) => {
    setTestimonials((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'name' && value && !next[index].avatar) {
        next[index].avatar = value.charAt(0).toUpperCase();
      }
      return next;
    });
  };

  const tabs = [
    { id: 'sizeGuide', label: 'Size Guide', icon: FiMaximize2 },
    { id: 'video', label: 'Video Section', icon: FiFilm },
    { id: 'testimonials', label: 'Testimonials', icon: FiMessageCircle },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
          <FiEdit3 size={18} className="text-yellow-600" />
        </div>
        <div>
          <h3 className="text-gray-800 font-bold">Homepage Content</h3>
          <p className="text-gray-400 text-xs">Size guide, craft video, and customer testimonials — each section saves separately</p>
        </div>
      </div>

      <div className="px-5 pt-4 border-b border-gray-100">
        <div className="flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: TabIcon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === id
                  ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/25'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <TabIcon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {tab === 'sizeGuide' && (
          <SectionPanel
            icon={FiMaximize2}
            title="Size Guide Section"
            subtitle="Heading, diagram image, and measurement table on the homepage"
            onSave={handleSizeGuideSave}
            saving={sizeGuideLoading}
            saveLabel="Save Size Guide"
          >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Section copy</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge / Tag</label>
                  <input type="text" value={sizeGuideConfig.tag} onChange={(e) => setSizeGuideConfig({ ...sizeGuideConfig, tag: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                  <input type="text" value={sizeGuideConfig.title} onChange={(e) => setSizeGuideConfig({ ...sizeGuideConfig, title: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} value={sizeGuideConfig.description} onChange={(e) => setSizeGuideConfig({ ...sizeGuideConfig, description: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Footer note</label>
                  <textarea rows={2} value={sizeGuideConfig.note} onChange={(e) => setSizeGuideConfig({ ...sizeGuideConfig, note: e.target.value })} className={inputCls} />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">How-to-measure diagram</p>
                <MediaDropZone
                  accept="image/*"
                  mediaType="image"
                  currentUrl={sizeGuideConfig.image?.url}
                  uploading={sizeGuideImageUploading}
                  onFileSelect={handleSizeGuideImage}
                  onClear={() => setSizeGuideConfig((p) => ({ ...p, image: { url: '', public_id: '' } }))}
                  hint="WEBP, JPG or PNG · Portrait diagram works best"
                />
                {sizeGuideConfig.image?.url && (
                  <div className="mt-3 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 max-w-[200px]">
                    <img src={sizeGuideConfig.image.url} alt="Preview" className="w-full h-auto" />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FiGrid className="text-yellow-600" size={18} />
                  <div>
                    <p className="font-semibold text-gray-800">Size chart rows</p>
                    <p className="text-xs text-gray-400">Chest, waist, hip & length per size</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSizes((p) => [...p, { size: '', chest: '', waist: '', hip: '', length: '' }])}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium"
                >
                  <FiPlus size={14} /> Add row
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Size', 'Chest', 'Waist', 'Hip', 'Length', ''].map((h) => (
                        <th key={h} className="text-left px-3 py-2.5 font-semibold text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map((row, index) => (
                      <tr key={index} className="border-t border-gray-50">
                        {['size', 'chest', 'waist', 'hip', 'length'].map((field) => (
                          <td key={field} className="px-2 py-2">
                            <input
                              type="text"
                              value={row[field]}
                              onChange={(e) => {
                                setSizes((prev) => {
                                  const next = [...prev];
                                  next[index] = { ...next[index], [field]: e.target.value };
                                  return next;
                                });
                              }}
                              className="w-full min-w-[72px] px-2 py-1.5 rounded-lg border border-gray-200 text-sm"
                            />
                          </td>
                        ))}
                        <td className="px-2 py-2 text-center">
                          <button type="button" onClick={() => setSizes((p) => p.filter((_, i) => i !== index))} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionPanel>
        )}

        {tab === 'video' && (
          <SectionPanel
            icon={FiFilm}
            title="Video Section"
            subtitle="Featured craft video with badge, title and description"
            onSave={handleVideoSave}
            saving={videoLoading}
            saveLabel="Save Video Section"
          >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Section copy</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                  <input type="text" value={videoSectionConfig.badge} onChange={(e) => setVideoSectionConfig({ ...videoSectionConfig, badge: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={videoSectionConfig.title} onChange={(e) => setVideoSectionConfig({ ...videoSectionConfig, title: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={5} value={videoSectionConfig.description} onChange={(e) => setVideoSectionConfig({ ...videoSectionConfig, description: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">External video URL (optional)</label>
                  <input
                    type="url"
                    value={videoSectionConfig.videoUrl}
                    onChange={(e) => setVideoSectionConfig({ ...videoSectionConfig, videoUrl: e.target.value })}
                    className={inputCls}
                    placeholder="https://… or leave empty to use uploaded file"
                  />
                  <p className="text-xs text-gray-400 mt-1">Uploaded file takes priority over URL.</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Video file</p>
                <MediaDropZone
                  accept="video/*"
                  mediaType="video"
                  currentUrl={videoSectionConfig.video?.url}
                  uploading={videoUploading}
                  onFileSelect={handleVideoFile}
                  onClear={() => setVideoSectionConfig((p) => ({ ...p, video: { url: '', public_id: '' } }))}
                  hint="MP4, WebM · Recommended under 50MB for fast loading"
                />
              </div>
            </div>
          </SectionPanel>
        )}

        {tab === 'testimonials' && (
          <SectionPanel
            icon={FiMessageCircle}
            title="Testimonials"
            subtitle="Add unlimited customer reviews with photos and star ratings"
            onSave={handleTestimonialsSave}
            saving={testimonialsLoading}
            saveLabel="Save Testimonials"
          >
            <div className="mb-6 p-4 rounded-xl bg-yellow-50/50 border border-yellow-100 space-y-3">
              <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider">Section header (homepage)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tag</label>
                  <input type="text" value={testimonialsSection.tag} onChange={(e) => setTestimonialsSection({ ...testimonialsSection, tag: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                  <input type="text" value={testimonialsSection.title} onChange={(e) => setTestimonialsSection({ ...testimonialsSection, title: e.target.value })} className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle (optional)</label>
                  <input type="text" value={testimonialsSection.description} onChange={(e) => setTestimonialsSection({ ...testimonialsSection, description: e.target.value })} className={inputCls} placeholder="Short line under the title" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700">{testimonials.length} review{testimonials.length !== 1 ? 's' : ''}</p>
              <button
                type="button"
                onClick={() => setTestimonials((p) => [...p, emptyTestimonial()])}
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-semibold"
              >
                <FiPlus size={16} /> Add testimonial
              </button>
            </div>

            <div className="space-y-5">
              {testimonials.map((t, index) => (
                <div
                  key={index}
                  className={`rounded-2xl border p-5 transition-colors ${
                    t.isActive === false ? 'border-gray-200 bg-gray-50/80 opacity-75' : 'border-yellow-100 bg-white shadow-sm'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="font-bold text-gray-800">Review #{index + 1}</p>
                      <p className="text-xs text-gray-400">{t.name || 'New customer'} · {t.city || 'No city'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={t.isActive !== false}
                          onChange={(e) => updateTestimonial(index, 'isActive', e.target.checked)}
                          className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                        />
                        Show on site
                      </label>
                      {testimonials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setTestimonials((p) => p.filter((_, i) => i !== index))}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Remove"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-1">
                      <MediaDropZone
                        label="Customer photo"
                        accept="image/*"
                        mediaType="image"
                        currentUrl={t.photo?.url}
                        uploading={testimonialPhotoUploading === index}
                        onFileSelect={(e) => handleTestimonialPhoto(index, e)}
                        onClear={() => updateTestimonial(index, 'photo', { url: '', public_id: '' })}
                        hint="Square or portrait · Optional"
                      />
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Customer name *</label>
                        <input type="text" value={t.name} onChange={(e) => updateTestimonial(index, 'name', e.target.value)} className={inputCls} placeholder="Priya Sharma" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                        <input type="text" value={t.city} onChange={(e) => updateTestimonial(index, 'city', e.target.value)} className={inputCls} placeholder="Chennai" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Product purchased</label>
                        <input type="text" value={t.product} onChange={(e) => updateTestimonial(index, 'product', e.target.value)} className={inputCls} placeholder="Floral Anarkali Kurti" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Avatar letter</label>
                        <input
                          type="text"
                          maxLength={1}
                          value={t.avatar}
                          onChange={(e) => updateTestimonial(index, 'avatar', e.target.value.toUpperCase())}
                          className={inputCls}
                          placeholder="P"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Review quote *</label>
                        <textarea rows={3} value={t.text} onChange={(e) => updateTestimonial(index, 'text', e.target.value)} className={inputCls} placeholder="What did the customer say?" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Star rating</label>
                        <StarRatingInput value={t.rating} onChange={(v) => updateTestimonial(index, 'rating', v)} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionPanel>
        )}

        <p className="text-xs text-gray-400 mt-4 text-center">
          Each tab has its own save button. The storefront refreshes within about a minute after saving.
        </p>
      </div>
    </div>
  );
};

export default HomepageContentEditor;
