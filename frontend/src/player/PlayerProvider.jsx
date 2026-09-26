import { useCallback, useEffect, useState } from 'react';
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

  const currentTrack = queue[currentIndex] ?? null;

  useEffect(() => {
    const audio = getAudio();
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () =>
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onLoadStart = () => {
      setCurrentTime(0);
      setDuration(0);
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('loadstart', onLoadStart);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
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
    audio.src = track.audio_url;
    audio.load();
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {});
  }, [queue, currentIndex]);

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
    audio.currentTime = time;
    setCurrentTime(time);
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
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}