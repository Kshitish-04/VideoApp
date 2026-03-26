import { Link } from 'react-router-dom';
import { Play, Eye, Clock } from 'lucide-react';
import { useRef } from 'react';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function VideoCard({ video, size = 'md' }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -10;
    const rotateY = ((x - cx) / cx) * 10;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
    // Move the inner shine
    const shine = card.querySelector('.video-card__shine');
    if (shine) {
      shine.style.opacity = '1';
      shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.1) 0%, transparent 65%)`;
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    const shine = card.querySelector('.video-card__shine');
    if (shine) shine.style.opacity = '0';
  };

  return (
    <Link
      to={`/watch/${video.id}`}
      className={`video-card video-card--${size}`}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Shine overlay for 3D light effect */}
      <div className="video-card__shine" />

      <div className="video-card__thumb-wrap">
        {video.thumbnail_url
          ? <img src={video.thumbnail_url} alt={video.title} className="video-card__thumb" loading="lazy" />
          : <div className="video-card__thumb video-card__thumb--placeholder">
              <Play size={32} />
            </div>
        }
        <div className="video-card__overlay">
          <div className="video-card__play-btn"><Play size={20} fill="white"/></div>
        </div>
        {video.category && <span className="video-card__badge">{video.category}</span>}
      </div>
      <div className="video-card__info">
        <div className="video-card__avatar">
          {video.profiles?.avatar_url
            ? <img src={video.profiles.avatar_url} alt="" />
            : <span>{video.profiles?.username?.charAt(0).toUpperCase() || '?'}</span>
          }
        </div>
        <div className="video-card__meta">
          <h3 className="video-card__title">{video.title}</h3>
          <p className="video-card__channel">{video.profiles?.username || 'Anonymous'}</p>
          <div className="video-card__stats">
            <span><Eye size={12} /> {video.view_count ?? 0}</span>
            <span>•</span>
            <span><Clock size={12} /> {timeAgo(video.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
