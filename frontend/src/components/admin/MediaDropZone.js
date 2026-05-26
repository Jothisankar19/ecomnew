import React, { useRef, useState } from 'react';
import { FiUpload, FiLoader, FiImage, FiVideo, FiX } from 'react-icons/fi';

const MediaDropZone = ({
  label,
  hint,
  accept = 'image/*',
  mediaType = 'image',
  currentUrl,
  uploading = false,
  onFileSelect,
  onClear,
  className = '',
}) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const pickFile = (file) => {
    if (!file || uploading) return;
    onFileSelect({ target: { files: [file] } });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const Icon = mediaType === 'video' ? FiVideo : FiImage;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      )}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!uploading) inputRef.current?.click();
          }
        }}
        onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
          uploading
            ? 'border-yellow-300 bg-yellow-50/80 cursor-wait'
            : dragOver
              ? 'border-yellow-500 bg-yellow-50 scale-[1.01]'
              : 'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50/40'
        }`}
      >
        {currentUrl && mediaType === 'image' && (
          <div className="absolute inset-0">
            <img src={currentUrl} alt="" className="w-full h-full object-cover opacity-30" />
          </div>
        )}
        {currentUrl && mediaType === 'video' && (
          <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
            <video src={currentUrl} className="max-h-32 w-full object-contain" muted playsInline />
          </div>
        )}

        <div className={`relative z-10 flex flex-col items-center justify-center gap-2 px-4 py-8 ${currentUrl ? 'min-h-[120px]' : 'min-h-[140px]'}`}>
          {uploading ? (
            <>
              <FiLoader className="text-yellow-600 animate-spin" size={28} />
              <p className="text-sm font-medium text-yellow-700">Uploading…</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                <Icon className="text-yellow-600" size={22} />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {currentUrl ? 'Drop or click to replace' : 'Drag & drop here'}
              </p>
              <p className="text-xs text-gray-500">or click to browse files</p>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={uploading}
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
      </div>

      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}

      {currentUrl && onClear && !uploading && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
        >
          <FiX size={14} /> Remove file
        </button>
      )}
    </div>
  );
};

export default MediaDropZone;
