import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useVideo, useComments, useVideos } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import VideoPlayer from '../components/VideoPlayer';
import VideoCard from '../components/VideoCard';
import { Download, Share2, ThumbsUp, Send, Clock, Eye, Flag } from 'lucide-react';
import toast from 'react-hot-toast';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Watch() {
  const { id } = useParams();
  const { user } = useAuth();
  const { video, loading } = useVideo(id);
  const { comments, addComment } = useComments(id);
  const { videos } = useVideos(video?.category || null);
  const [activeTab, setActiveTab] = useState('description');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const upNext = videos.filter(v => v.id !== id).slice(0, 6);

  const handleDownload = () => {
    if (!video?.video_url) return;
    const url = video.video_url.includes('cloudinary')
      ? video.video_url.replace('/upload/', '/upload/fl_attachment/')
      : video.video_url;
    const a = document.createElement('a');
    a.href = url;
    a.download = video.title || 'video';
    a.click();
    toast.success('Download started!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Sign in to comment'); return; }
    if (!comment.trim()) return;
    setSubmitting(true);
    const { error } = await addComment(comment.trim(), user.id);
    if (error) toast.error('Failed to post comment');
    else setComment('');
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="watch-skeleton container">
        <div className="skeleton skeleton--video" />
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--text" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="empty-state container" style={{paddingTop: '8rem'}}>
        <h2>Video not found</h2>
        <Link to="/" className="btn btn--primary">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="watch container">
      {/* Main Player Area */}
      <div className="watch__main">
        {/* Video Player */}
        <VideoPlayer src={video.video_url} poster={video.thumbnail_url} />

        {/* Video Header */}
        <div className="watch__header">
          <div className="watch__title-row">
            <h1 className="watch__title">{video.title}</h1>
            {video.category && <span className="video-card__badge">{video.category}</span>}
          </div>
          <div className="watch__meta-row">
            <div className="watch__channel-info">
              <div className="watch__avatar">
                {video.profiles?.avatar_url
                  ? <img src={video.profiles.avatar_url} alt="" />
                  : <span>{video.profiles?.username?.charAt(0).toUpperCase()}</span>
                }
              </div>
              <div>
                <p className="watch__channel-name">{video.profiles?.username}</p>
                <p className="watch__date">{timeAgo(video.created_at)}</p>
              </div>
            </div>
            <div className="watch__actions">
              <span className="watch__stat"><Eye size={16}/> {video.view_count || 0}</span>
              <button className="btn btn--glass" onClick={handleShare}>
                <Share2 size={16}/> Share
              </button>
              <button className="btn btn--primary" onClick={handleDownload}>
                <Download size={16}/> Download
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="watch__tabs">
          <button
            className={`watch__tab ${activeTab === 'description' ? 'watch__tab--active' : ''}`}
            onClick={() => setActiveTab('description')}
          >Description</button>
          <button
            className={`watch__tab ${activeTab === 'comments' ? 'watch__tab--active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >Comments ({comments.length})</button>
        </div>

        {/* Tab Content */}
        <div className="watch__tab-content">
          {activeTab === 'description' ? (
            <div className="watch__description">
              <p>{video.description || 'No description provided.'}</p>
            </div>
          ) : (
            <div className="watch__comments">
              {user && (
                <form className="comment-form" onSubmit={handleComment}>
                  <div className="comment-form__avatar">
                    <span>U</span>
                  </div>
                  <div className="comment-form__input-wrap">
                    <input
                      className="comment-form__input"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                    />
                    <button className="btn btn--primary btn--sm" disabled={submitting || !comment.trim()}>
                      <Send size={14}/> Post
                    </button>
                  </div>
                </form>
              )}
              {!user && (
                <p className="watch__signin-prompt">
                  <Link to="/login">Sign in</Link> to leave a comment.
                </p>
              )}
              <div className="comments-list">
                {comments.map(c => (
                  <div key={c.id} className="comment">
                    <div className="comment__avatar">
                      {c.profiles?.avatar_url
                        ? <img src={c.profiles.avatar_url} alt="" />
                        : <span>{c.profiles?.username?.charAt(0).toUpperCase() || '?'}</span>
                      }
                    </div>
                    <div className="comment__body">
                      <div className="comment__header">
                        <span className="comment__username">{c.profiles?.username}</span>
                        <span className="comment__time"><Clock size={11}/> {timeAgo(c.created_at)}</span>
                      </div>
                      <p className="comment__text">{c.content}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="watch__no-comments">No comments yet. Be the first!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar: Up Next */}
      <aside className="watch__sidebar">
        <h3 className="watch__sidebar-title">Up Next</h3>
        <div className="watch__up-next">
          {upNext.length === 0 ? (
            <p className="watch__no-comments">No more videos</p>
          ) : (
            upNext.map(v => <VideoCard key={v.id} video={v} size="sm" />)
          )}
        </div>
      </aside>
    </div>
  );
}
