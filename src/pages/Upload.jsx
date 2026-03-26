import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { insertVideo } from '../hooks/useSupabase';
import { Upload as UploadIcon, Film, Image, Tag, AlignLeft, CheckCircle, X, CloudUpload, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const CATEGORIES = ['Gaming', 'Music', 'Education', 'Tech', 'Sports', 'Vlogs', 'Comedy', 'Other'];

async function uploadToCloudinary(file, resourceType = 'video', onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status === 200) {
          resolve(response);
        } else {
          const errMsg = response?.error?.message || `HTTP ${xhr.status}: Upload failed`;
          console.error('Cloudinary error:', response);
          reject(new Error(errMsg));
        }
      } catch {
        reject(new Error(`HTTP ${xhr.status}: Upload failed`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error — check your internet connection'));
    xhr.send(formData);
  });
}

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    is_community: false,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) {
      toast.error('Video must be less than 500MB');
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleThumbChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) { toast.error('Please select a video file'); return; }
    if (!form.title.trim()) { toast.error('Please enter a title'); return; }

    setUploading(true);
    toast.loading('Uploading video...', { id: 'upload' });

    try {
      const videoData = await uploadToCloudinary(videoFile, 'video', setVideoProgress);
      const videoUrl = videoData.secure_url;

      let thumbnailUrl = null;
      if (thumbFile) {
        toast.loading('Uploading thumbnail...', { id: 'upload' });
        const thumbData = await uploadToCloudinary(thumbFile, 'image', setThumbProgress);
        thumbnailUrl = thumbData.secure_url;
      }

      const { error } = await insertVideo({
        title: form.title,
        description: form.description,
        category: form.category || 'Other',
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        user_id: user.id,
        is_community: form.is_community,
      });

      if (error) throw error;

      toast.success('Video published!', { id: 'upload' });
      setDone(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error(err);
      toast.error('Upload failed: ' + err.message, { id: 'upload' });
    } finally {
      setUploading(false);
    }
  };

  if (done) {
    return (
      <div className="upload-success">
        <div className="upload-success__icon"><CheckCircle size={64}/></div>
        <h2>Video Published!</h2>
        <p>Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="upload container">
      <div className="upload__header">
        <h1><CloudUpload size={32}/> Upload Video</h1>
        <p>Share your content with the world</p>
      </div>

      <form className="upload__form" onSubmit={handleSubmit}>
        <div className="upload__grid">
          {/* Left: Dropzones */}
          <div className="upload__dropzones">
            <div
              className={`dropzone ${videoFile ? 'dropzone--filled' : ''}`}
              onClick={() => videoInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleVideoChange({ target: { files: e.dataTransfer.files } }); }}
            >
              {videoPreview ? (
                <>
                  <video src={videoPreview} className="dropzone__preview" controls />
                  <button
                    type="button"
                    className="dropzone__remove"
                    onClick={e => { e.stopPropagation(); setVideoFile(null); setVideoPreview(null); }}
                  ><X size={16}/></button>
                  <p className="dropzone__filename">{videoFile.name}</p>
                </>
              ) : (
                <>
                  <Film size={40} className="dropzone__icon" />
                  <p className="dropzone__label">Click or drag to upload video</p>
                  <p className="dropzone__sub">MP4, MOV, MKV, WebM — Max 500MB</p>
                </>
              )}
              <input ref={videoInputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleVideoChange} />
            </div>

            {uploading && videoProgress > 0 && (
              <div className="upload__progress">
                <div className="upload__progress-bar" style={{ width: `${videoProgress}%` }}/>
                <span>{videoProgress}%</span>
              </div>
            )}

            <div
              className="dropzone dropzone--thumb"
              onClick={() => thumbInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleThumbChange({ target: { files: e.dataTransfer.files } }); }}
            >
              {thumbPreview ? (
                <>
                  <img src={thumbPreview} className="dropzone__preview" alt="thumb" />
                  <button
                    type="button"
                    className="dropzone__remove"
                    onClick={e => { e.stopPropagation(); setThumbFile(null); setThumbPreview(null); }}
                  ><X size={16}/></button>
                </>
              ) : (
                <>
                  <Image size={28} className="dropzone__icon" />
                  <p className="dropzone__label">Thumbnail (optional)</p>
                  <p className="dropzone__sub">JPG, PNG, WebP</p>
                </>
              )}
              <input ref={thumbInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleThumbChange} />
            </div>
          </div>

          {/* Right: Form Fields */}
          <div className="upload__fields">
            <div className="form-group">
              <label className="form-label"><Film size={15}/> Title *</label>
              <input
                className="form-input"
                placeholder="Enter a compelling title..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label"><AlignLeft size={15}/> Description</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Tell viewers about your video..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={5}
                maxLength={2000}
              />
            </div>

            {/* ── Custom Dropdown (replaces broken native <select>) ── */}
            <div className="form-group">
              <label className="form-label"><Tag size={15}/> Category</label>
              <div className="custom-select" ref={dropdownRef}>
                <button
                  type="button"
                  className={`custom-select__trigger ${dropdownOpen ? 'custom-select__trigger--open' : ''}`}
                  onClick={() => setDropdownOpen(o => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                >
                  <span className={form.category ? '' : 'custom-select__placeholder'}>
                    {form.category || 'Select category...'}
                  </span>
                  <ChevronDown
                    size={16}
                    className="custom-select__chevron"
                    style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>

                {dropdownOpen && (
                  <ul className="custom-select__list" role="listbox">
                    <li
                      className="custom-select__option custom-select__option--placeholder"
                      role="option"
                      onClick={() => { setForm(f => ({ ...f, category: '' })); setDropdownOpen(false); }}
                    >
                      Select category...
                    </li>
                    {CATEGORIES.map(cat => (
                      <li
                        key={cat}
                        className={`custom-select__option ${form.category === cat ? 'custom-select__option--active' : ''}`}
                        role="option"
                        aria-selected={form.category === cat}
                        onClick={() => { setForm(f => ({ ...f, category: cat })); setDropdownOpen(false); }}
                      >
                        {cat}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Community Toggle */}
            <div
              className={`community-toggle ${form.is_community ? 'community-toggle--on' : ''}`}
              onClick={() => setForm(f => ({ ...f, is_community: !f.is_community }))}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setForm(f => ({ ...f, is_community: !f.is_community }))}
            >
              <div className="community-toggle__info">
                <p className="community-toggle__title">🌐 Share to Community</p>
                <p className="community-toggle__sub">
                  {form.is_community
                    ? 'This video will appear on the Community page — visible to everyone, no login needed.'
                    : 'Enable to feature this video in the Community section.'}
                </p>
              </div>
              <div className={`toggle-switch ${form.is_community ? 'toggle-switch--on' : ''}`}>
                <div className="toggle-switch__knob" />
              </div>
            </div>

            <button
              className="btn btn--primary btn--lg upload__submit"
              type="submit"
              disabled={uploading}
            >
              {uploading ? (
                <><span className="spinner" /> Uploading...</>
              ) : (
                <><UploadIcon size={18}/> Publish Video</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
