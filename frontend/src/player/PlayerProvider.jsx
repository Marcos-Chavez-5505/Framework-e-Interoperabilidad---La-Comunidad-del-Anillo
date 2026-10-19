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
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('seeked', onSeeked);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('seeked', onSeeked);
    };
  }, []);

  useEffect(() => {
    const audio = getAudio();
    const track = queue[currentIndex];
    if (!track?.audio_url) return;

    if (sourceRef.current !== track.audio_url) {
      sourceRef.current = track.audio_url;
      audio.src = track.audio_url;
      audio.load();
      setCurrentTime(0);
      setDuration(0);
    }

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [queue, currentIndex, isPlaying]);

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
