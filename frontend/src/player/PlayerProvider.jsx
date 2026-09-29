import { useCallback, useEffect, useRef, useState } from 'react';
import { PlayerContext } from './context';

let audioInstance = null;

function getAudio() {
  if (audioInstance == null) {
    audioInstance = new Audio();
  }
  return audioInstance;
}

export default function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const draggingRef = useRef(false);
  const sourceRef = useRef(null);
  const blobCacheRef = useRef({});

  const currentTrack = queue[currentIndex] ?? null;

  useEffect(() => {
    const audio = getAudio();
    const onTimeUpdate = () => {
      if (!draggingRef.current && !audio.seeking) setCurrentTime(audio.currentTime);
    };
    const onLoadedMetadata = () =>
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onSeeked = () => {
      if (!draggingRef.current) setCurrentTime(audio.currentTime);
    };
    const onLoadStart = () => {
      if (sourceRef.current === audio.currentSrc) {
        sourceRef.current = null;
        setCurrentTime(0);
        setDuration(0);
      }
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('seeked', onSeeked);
    audio.addEventListener('loadstart', onLoadStart);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('seeked', onSeeked);
      audio.removeEventListener('loadstart', onLoadStart);
    };
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((i) => {
      if (i < 0 || queue.length === 0) return i;
      if (isShuffle && queue.length > 1) {
        let r = i;
        while (r === i) {
          r = Math.floor(Math.random() * queue.length);
        }
        return r;
      }
      return (i + 1) % queue.length;
    });
  }, [isShuffle, queue.length]);

  const previous = useCallback(() => {
    setCurrentIndex((i) => {
      if (i <= 0 || queue.length === 0) return 0;
      return i - 1;
    });
  }, [queue.length]);

  const onEnded = useCallback(() => {
    const audio = getAudio();
    if (isRepeat) {
      audio.currentTime = 0;
      setCurrentTime(0);
      audio.play().catch(() => {});
    } else {
      next();
    }
  }, [isRepeat, next]);

  useEffect(() => {
    const audio = getAudio();
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [onEnded]);

  const loadTrack = useCallback(() => {
    const track = queue[currentIndex];
    if (!track?.audio_url) return;
    const audio = getAudio();
    const isCurrent = () => queue[currentIndex]?.audio_url === track.audio_url;
    const playSource = (src) => {
      sourceRef.current = src;
      audio.src = src;
      audio.load();
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    };

    const cached = blobCacheRef.current[track.audio_url];
    if (cached) {
      playSource(cached);
      return;
    }

    fetch(track.audio_url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const objUrl = URL.createObjectURL(blob);
        blobCacheRef.current[track.audio_url] = objUrl;
        if (isCurrent()) playSource(objUrl);
      })
      .catch(() => {
        if (isCurrent()) playSource(track.audio_url);
      });
  }, [queue, currentIndex]);

  useEffect(
    () => () => {
      Object.values(blobCacheRef.current).forEach((url) => URL.revokeObjectURL(url));
      blobCacheRef.current = {};
    },
    []
  );

  useEffect(() => {
    loadTrack();
  }, [loadTrack]);

  useEffect(() => {
    const audio = getAudio();
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const playQueue = useCallback((tracks, index = 0) => {
    if (!tracks?.length) return;
    setQueue(tracks);
    setCurrentIndex(index);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const toggleShuffle = useCallback(() => setIsShuffle((s) => !s), []);
  const toggleRepeat = useCallback(() => setIsRepeat((r) => !r), []);

  const seek = useCallback((time) => {
    const audio = getAudio();
    const max = Number.isFinite(audio.duration) ? audio.duration : Number.MAX_SAFE_INTEGER;
    const value = Math.max(0, Math.min(time, max));
    audio.currentTime = value;
    setCurrentTime(value);
  }, []);

  const onSeekStart = useCallback(() => {
    draggingRef.current = true;
  }, []);

  const onSeekEnd = useCallback(() => {
    draggingRef.current = false;
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        queue,
        currentIndex,
        currentTrack,
        isPlaying,
        isShuffle,
        isRepeat,
        currentTime,
        duration,
        playQueue,
        togglePlay,
        next,
        previous,
        toggleShuffle,
        toggleRepeat,
        seek,
        onSeekStart,
        onSeekEnd,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}