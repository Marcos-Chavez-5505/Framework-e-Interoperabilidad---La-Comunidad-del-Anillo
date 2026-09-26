import { usePlayer } from './usePlayer';
import { formatDuration } from './context';
import PlayerIcon from './Icons';

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    isShuffle,
    isRepeat,
    currentTime,
    duration,
    togglePlay,
    next,
    previous,
    toggleShuffle,
    toggleRepeat,
    seek,
  } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div className="player-fixed-bottom p-2">
      <div className="card shadow-sm">
        <div className="card-body py-2 px-3 d-flex flex-column flex-lg-row align-items-center gap-2">
          <div className="d-flex align-items-center gap-2 flex-grow-1 min-w-0">
            {currentTrack.cover ? (
              <img
                src={currentTrack.cover}
                alt={''}
                className="rounded"
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                className="rounded bg-primary text-white d-flex align-items-center justify-content-center"
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  flexShrink: 0,
                }}
              >
                <PlayerIcon name="musicNote" size={20} />
              </div>
            )}
            <div className="min-w-0">
              <div className="fw-semibold text-truncate">{currentTrack.title}</div>
              <div className="small text-secondary text-truncate">
                {currentTrack.artist?.name ?? 'Desconocido'}
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-1">
            <button
              type="button"
              className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center ${isRepeat ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={toggleRepeat}
              aria-label="Repetir"
            >
              <PlayerIcon name="repeat" />
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
              onClick={previous}
              aria-label="Anterior"
            >
              <PlayerIcon name="previousTrack" />
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-circle d-flex align-items-center justify-content-center"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              style={{ width: '2.5rem', height: '2.5rem' }}
            >
              <PlayerIcon name={isPlaying ? 'pause' : 'play'} />
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
              onClick={next}
              aria-label="Siguiente"
            >
              <PlayerIcon name="nextTrack" />
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center ${isShuffle ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={toggleShuffle}
              aria-label="Aleatorio"
            >
              <PlayerIcon name="shuffle" />
            </button>
          </div>

          <div className="d-flex align-items-center gap-2 w-100 w-lg-auto">
            <span className="small text-secondary text-nowrap">
              {formatDuration(currentTime)}
            </span>
            <input
              type="range"
              className="form-range"
              min="0"
              max={Number.isFinite(duration) ? duration : 0}
              step="0.1"
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              style={{ minWidth: '120px' }}
            />
            <span className="small text-secondary text-nowrap">
              {formatDuration(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}