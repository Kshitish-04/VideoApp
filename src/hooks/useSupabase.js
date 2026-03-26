import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ── Videos ──────────────────────────────────────────────────────────────────

export function useVideos(category = null) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('videos')
      .select('*, profiles(username, avatar_url)')
      .order('created_at', { ascending: false });
    if (category) query = query.eq('category', category);
    const { data } = await query;
    setVideos(data || []);
    setLoading(false);
  }, [category]);

  useEffect(() => { fetch(); }, [fetch]);
  return { videos, loading, refetch: fetch };
}

// Fetch only community-flagged videos (accessible without login)
export function useCommunityVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('videos')
      .select('*, profiles(username, avatar_url)')
      .eq('is_community', true)
      .order('created_at', { ascending: false });
    setVideos(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { videos, loading, refetch: fetch };
}

export function useVideo(id) {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from('videos')
        .select('*, profiles(username, avatar_url)')
        .eq('id', id)
        .single();
      setVideo(data);
      setLoading(false);
      // increment view count
      await supabase.rpc('increment_view_count', { video_id: id }).catch(() => {});
    })();
  }, [id]);

  return { video, loading };
}

export function useUserVideos(userId) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setVideos(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { videos, loading, refetch: fetch };
}

export async function deleteVideo(videoId) {
  const { error } = await supabase.from('videos').delete().eq('id', videoId);
  return { error };
}

export async function insertVideo(videoData) {
  const { data, error } = await supabase.from('videos').insert(videoData).select().single();
  return { data, error };
}

// ── Comments ─────────────────────────────────────────────────────────────────

export function useComments(videoId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!videoId) return;
    setLoading(true);
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, avatar_url)')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false });
    setComments(data || []);
    setLoading(false);
  }, [videoId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addComment(content, userId) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ video_id: videoId, user_id: userId, content })
      .select()
      .single();
    if (!error && data) {
      // Fetch with profile join separately so missing profile doesn't break it
      const { data: full } = await supabase
        .from('comments')
        .select('*, profiles(username, avatar_url)')
        .eq('id', data.id)
        .single();
      setComments(prev => [full || data, ...prev]);
    }
    return { error };
  }

  return { comments, loading, addComment, refetch: fetch };
}

// ── Community Posts ──────────────────────────────────────────────────────────

export function useCommunityPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('community_posts')
      .select('*, profiles(username, avatar_url)')
      .order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function addPost(content, userId) {
    const { data, error } = await supabase
      .from('community_posts')
      .insert({ content, user_id: userId })
      .select()
      .single();
    if (error) return { error };
    // Fetch with profile join separately so missing profile doesn't break insert
    const { data: full } = await supabase
      .from('community_posts')
      .select('*, profiles(username, avatar_url)')
      .eq('id', data.id)
      .single();
    setPosts(prev => [full || data, ...prev]);
    return { error: null };
  }

  async function likePost(postId, currentLikes) {
    await supabase
      .from('community_posts')
      .update({ likes_count: currentLikes + 1 })
      .eq('id', postId);
    setPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, likes_count: currentLikes + 1 } : p)
    );
  }

  return { posts, loading, addPost, likePost, refetch: fetch };
}

// ── Search ───────────────────────────────────────────────────────────────────

export async function searchVideos(query) {
  const { data } = await supabase
    .from('videos')
    .select('*, profiles(username, avatar_url)')
    .ilike('title', `%${query}%`)
    .order('created_at', { ascending: false });
  return data || [];
}
