import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

/**
 * Convert a Cloudinary MP4 URL to an HLS (.m3u8) streaming URL.
 * e.g. https://res.cloudinary.com/db9bs07ak/video/upload/v123/foo.mp4
 *   → https://res.cloudinary.com/db9bs07ak/video/upload/sp_auto/v123/foo.m3u8
 */
function toCloudinaryHLS(url) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  // Already HLS
  if (url.includes('.m3u8')) return url;
  // Insert sp_auto transformation and swap extension
  return url
    .replace('/video/upload/', '/video/upload/sp_auto/')
    .replace(/\.(mp4|mov|mkv|webm|avi)(\?.*)?$/, '.m3u8');
}

export default function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Destroy any existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    video.removeAttribute('src');
    video.load();

    // Prefer Cloudinary HLS streaming for Cloudinary-hosted videos
    const hlsSrc = toCloudinaryHLS(src);
    const isHLS = hlsSrc.includes('.m3u8');

    if (isHLS && Hls.isSupported()) {
      hlsRef.current = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30,
      });
      hlsRef.current.loadSource(hlsSrc);
      hlsRef.current.attachMedia(video);
      hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          // HLS failed — fall back to direct MP4
          console.warn('HLS failed, falling back to direct MP4:', data);
          if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
          video.src = src;
          video.load();
        }
      });
    } else if (isHLS && video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS — Safari
      video.src = hlsSrc;
      video.load();
    } else {
      // Direct MP4 fallback
      video.src = src;
      video.load();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        className="video-player__video"
        poster={poster}
        controls
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
      />
    </div>
  );
}
