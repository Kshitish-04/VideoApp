import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommunityPosts, useCommunityVideos } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { Heart, MessageSquare, TrendingUp, Send, Users, Flame, Play, Film } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import toast from 'react-hot-toast';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TRENDING = [
  { tag: '#LuminaStream', count: '12.4k posts' },
  { tag: '#TechTalks', count: '8.2k posts' },
  { tag: '#GamingLife', count: '5.9k posts' },
  { tag: '#MusicVibes', count: '4.7k posts' },
  { tag: '#LearnToday', count: '3.3k posts' },
];

export default function Community() {
  const { user, profile } = useAuth();
  const { posts, loading: postsLoading, addPost, likePost } = useCommunityPosts();
  const { videos: communityVideos, loading: videosLoading } = useCommunityVideos();
  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likedIds, setLikedIds] = useState(new Set());

  const handlePost = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Sign in to post'); return; }
    if (!inputText.trim()) return;
    setSubmitting(true);
    const { error } = await addPost(inputText.trim(), user.id);
    if (error) toast.error('Failed to post');
    else setInputText('');
    setSubmitting(false);
  };

  const handleLike = async (post) => {
    if (!user) { toast.error('Sign in to like'); return; }
    if (likedIds.has(post.id)) return;
    setLikedIds(prev => new Set([...prev, post.id]));
    await likePost(post.id, post.likes_count);
  };

  return (
    <div className="community container">
      <div className="community__layout">
        {/* Main Feed */}
        <main className="community__feed">
          {/* Page Header */}
          <div className="community__header">
            <div className="community__header-icon"><Users size={28}/></div>
            <div>
              <h1>Community</h1>
              <p>Connect, share, and discover videos from creators worldwide.</p>
            </div>
          </div>

          {/* Community Videos Section */}
          <div className="community__videos-section">
            <div className="community__section-header">
              <h2><Play size={18}/> Community Videos</h2>
              <span className="community__section-badge">Open to everyone</span>
            </div>

            {videosLoading ? (
              <div className="community__video-row">
                {[...Array(3)].map((_, i) => <div key={i} className="skeleton skeleton--card"/>)}
              </div>
            ) : communityVideos.length === 0 ? (
              <div className="community__no-videos">
                <Film size={32}/>
                <p>No community videos yet.</p>
                {user && (
                  <Link to="/upload" className="btn btn--ghost btn--sm">
                    Upload &amp; share to community →
                  </Link>
                )}
              </div>
            ) : (
              <div className="community__video-row">
                {communityVideos.map(v => <VideoCard key={v.id} video={v} size="md"/>)}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="community__divider">
            <span>Discussions</span>
          </div>

          {/* Create Post */}
          {user ? (
            <form className="create-post" onSubmit={handlePost}>
              <div className="create-post__avatar">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="" />
                  : <span>{profile?.username?.charAt(0).toUpperCase() || 'U'}</span>
                }
              </div>
              <div className="create-post__body">
                <textarea
                  className="create-post__input"
                  placeholder={`What's on your mind, ${profile?.username || 'creator'}?`}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <div className="create-post__footer">
                  <span className="create-post__char">{inputText.length}/500</span>
                  <button className="btn btn--primary" type="submit" disabled={submitting || !inputText.trim()}>
                    {submitting ? <span className="spinner"/> : <Send size={15}/>}
                    Post
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="community__signin-banner">
              <p>Join the conversation — <a href="/login">Sign in</a> or <a href="/register">Get Started</a></p>
            </div>
          )}

          {/* Posts Feed */}
          <div className="posts-feed">
            {postsLoading ? (
              [...Array(4)].map((_, i) => <div key={i} className="skeleton skeleton--post"/>)
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <MessageSquare size={48}/>
                <h3>No posts yet</h3>
                <p>Be the first to start a discussion!</p>
              </div>
            ) : (
              posts.map(post => (
                <article key={post.id} className="post-card">
                  <div className="post-card__header">
                    <div className="post-card__avatar">
                      {post.profiles?.avatar_url
                        ? <img src={post.profiles.avatar_url} alt="" />
                        : <span>{post.profiles?.username?.charAt(0).toUpperCase() || '?'}</span>
                      }
                    </div>
                    <div>
                      <p className="post-card__username">{post.profiles?.username || 'Anonymous'}</p>
                      <p className="post-card__time">{timeAgo(post.created_at)}</p>
                    </div>
                  </div>
                  <p className="post-card__content">{post.content}</p>
                  <div className="post-card__footer">
                    <button
                      className={`post-card__action ${likedIds.has(post.id) ? 'post-card__action--liked' : ''}`}
                      onClick={() => handleLike(post)}
                    >
                      <Heart size={16} fill={likedIds.has(post.id) ? 'currentColor' : 'none'}/>
                      <span>{post.likes_count}</span>
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="community__sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-card__title"><Flame size={18}/> Trending</h3>
            <div className="sidebar-card__trends">
              {TRENDING.map((t, i) => (
                <div key={t.tag} className="trend-item">
                  <span className="trend-item__rank">#{i + 1}</span>
                  <div>
                    <p className="trend-item__tag">{t.tag}</p>
                    <p className="trend-item__count">{t.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-card__title"><TrendingUp size={18}/> Stats</h3>
            <div className="sidebar-card__stats">
              <div className="sidebar-stat">
                <span className="sidebar-stat__value">{communityVideos.length}</span>
                <span className="sidebar-stat__label">Community Videos</span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat__value">{posts.length}</span>
                <span className="sidebar-stat__label">Discussions</span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat__value">
                  {posts.reduce((s, p) => s + (p.likes_count || 0), 0)}
                </span>
                <span className="sidebar-stat__label">Total Likes</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
