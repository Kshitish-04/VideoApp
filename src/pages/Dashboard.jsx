import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserVideos, deleteVideo } from '../hooks/useSupabase';
import { Trash2, Eye, Film, BarChart2, Upload, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { videos, loading, refetch } = useUserVideos(user?.id);

  const totalViews = videos.reduce((sum, v) => sum + (v.view_count || 0), 0);

  const handleDelete = async (videoId, videoUrl) => {
    if (!confirm('Delete this video permanently?')) return;
    const toastId = toast.loading('Deleting...');

    // 1. Delete from Supabase
    const { error } = await deleteVideo(videoId);
    if (error) {
      toast.error('Failed to delete', { id: toastId });
      return;
    }

    // 2. Attempt Cloudinary deletion via public_id extraction
    try {
      if (videoUrl && videoUrl.includes('cloudinary')) {
        const parts = videoUrl.split('/');
        const filename = parts[parts.length - 1];
        const publicId = filename.replace(/\.[^.]+$/, '');
        // Note: client-side Cloudinary deletion requires a signed request.
        // This calls our Supabase Edge Function to handle it securely.
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-video`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await import('../lib/supabase')).supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
          },
          body: JSON.stringify({ public_id: publicId }),
        });
      }
    } catch (err) {
      console.warn('Cloudinary deletion attempted (may require Edge Function):', err.message);
    }

    toast.success('Video deleted!', { id: toastId });
    refetch();
  };

  return (
    <div className="dashboard container">
      {/* Header */}
      <div className="dashboard__header">
        <div className="dashboard__user">
          <div className="dashboard__avatar">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" />
              : <span>{profile?.username?.charAt(0).toUpperCase() || 'U'}</span>
            }
          </div>
          <div>
            <h1>Creator Studio</h1>
            <p className="dashboard__username">@{profile?.username}</p>
          </div>
        </div>
        <Link to="/upload" className="btn btn--primary">
          <Upload size={16}/> Upload New
        </Link>
      </div>

      {/* Stats */}
      <div className="dashboard__stats">
        <div className="stat-card">
          <Film size={24} className="stat-card__icon"/>
          <div>
            <p className="stat-card__value">{videos.length}</p>
            <p className="stat-card__label">Total Videos</p>
          </div>
        </div>
        <div className="stat-card">
          <Eye size={24} className="stat-card__icon"/>
          <div>
            <p className="stat-card__value">{totalViews.toLocaleString()}</p>
            <p className="stat-card__label">Total Views</p>
          </div>
        </div>
        <div className="stat-card">
          <BarChart2 size={24} className="stat-card__icon"/>
          <div>
            <p className="stat-card__value">
              {videos.length > 0 ? Math.round(totalViews / videos.length) : 0}
            </p>
            <p className="stat-card__label">Avg. Views</p>
          </div>
        </div>
      </div>

      {/* Video List */}
      <div className="dashboard__uploads">
        <h2>Your Videos</h2>
        {loading ? (
          <div className="skeleton-list">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton skeleton--row"/>)}
          </div>
        ) : videos.length === 0 ? (
          <div className="empty-state">
            <Film size={48}/>
            <h3>No uploads yet</h3>
            <p>Start creating and sharing your content!</p>
            <Link to="/upload" className="btn btn--primary">Upload Video</Link>
          </div>
        ) : (
          <div className="dashboard__table-wrap">
            <table className="dashboard__table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Views</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map(v => (
                  <tr key={v.id} className="dashboard__table-row">
                    <td>
                      <div className="dashboard__thumb">
                        {v.thumbnail_url
                          ? <img src={v.thumbnail_url} alt={v.title} />
                          : <div className="dashboard__thumb-placeholder"><Film size={20}/></div>
                        }
                      </div>
                    </td>
                    <td>
                      <p className="dashboard__video-title">{v.title}</p>
                      <p className="dashboard__video-desc">{v.description?.slice(0, 60)}{v.description?.length > 60 ? '...' : ''}</p>
                    </td>
                    <td><span className="video-card__badge">{v.category}</span></td>
                    <td>
                      <span className="dashboard__views"><Eye size={14}/> {v.view_count || 0}</span>
                    </td>
                    <td>{timeAgo(v.created_at)}</td>
                    <td>
                      <div className="dashboard__actions">
                        <Link to={`/watch/${v.id}`} className="btn btn--ghost btn--sm" title="Watch">
                          <ExternalLink size={15}/>
                        </Link>
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => handleDelete(v.id, v.video_url)}
                          title="Delete"
                        >
                          <Trash2 size={15}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
