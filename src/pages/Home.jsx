import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVideos } from '../hooks/useSupabase';
import VideoCard from '../components/VideoCard';
import MarbleHero from '../components/MarbleHero';
import { Play, ChevronRight } from 'lucide-react';

const CATEGORIES = ['All', 'Gaming', 'Music', 'Education', 'Tech', 'Sports', 'Vlogs', 'Comedy'];

export default function Home() {
  const { videos, loading } = useVideos();
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? videos
    : videos.filter(v => v.category === activeCategory);

  return (
    <div className="home">

      {/* ── Marble 3D Hero ── */}
      <MarbleHero />

      {/* ── Category Filter ── */}
      <section className="home__categories">
        <div className="category-pills">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-pill ${activeCategory === cat ? 'category-pill--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── Video Grid ── */}
      <section className="home__content container">
        {loading ? (
          <div className="skeleton-grid">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Play size={48} />
            <h3>No videos yet</h3>
            <p>Be the first to upload a video!</p>
            <Link to="/upload" className="btn btn--primary">Upload Video</Link>
          </div>
        ) : (
          <>
            <div className="home__section">
              <div className="home__section-header">
                <h2>🔥 Trending Now</h2>
                <button className="home__see-all">See All <ChevronRight size={16}/></button>
              </div>
              <div className="video-row">
                {filtered.slice(0, 8).map(v => <VideoCard key={v.id} video={v} size="md" />)}
              </div>
            </div>

            {filtered.length > 4 && (
              <div className="home__section">
                <div className="home__section-header">
                  <h2>✨ Recently Added</h2>
                </div>
                <div className="video-grid">
                  {filtered.slice(0, 12).map(v => <VideoCard key={v.id} video={v} size="sm" />)}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
