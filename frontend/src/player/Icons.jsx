import playSvg from '../assets/own_svgs_icons/play.svg?raw';
import pauseSvg from '../assets/own_svgs_icons/pause.svg?raw';
import previousTrackSvg from '../assets/own_svgs_icons/previous_track.svg?raw';
import nextTrackSvg from '../assets/own_svgs_icons/next_track.svg?raw';
import shuffleSvg from '../assets/own_svgs_icons/shuffle.svg?raw';
import repeatSvg from '../assets/own_svgs_icons/repeat.svg?raw';
import musicNoteSvg from '../assets/own_svgs_icons/music_note.svg?raw';

const toCurrentColor = (raw) =>
  raw
    .replaceAll('fill="#F4F0F9"', 'fill="currentColor"')
    .replaceAll('stroke="#F4F0F9"', 'stroke="currentColor"')
    .replace(/\swidth="[^"]*"/, ' width="100%"')
    .replace(/\sheight="[^"]*"/, ' height="100%"');

const ICONS = {
  play: toCurrentColor(playSvg),
  pause: toCurrentColor(pauseSvg),
  previousTrack: toCurrentColor(previousTrackSvg),
  nextTrack: toCurrentColor(nextTrackSvg),
  shuffle: toCurrentColor(shuffleSvg),
  repeat: toCurrentColor(repeatSvg),
  musicNote: toCurrentColor(musicNoteSvg),
};

export default function PlayerIcon({ name, size = 22, className = '' }) {
  return (
    <span
      className={`d-inline-flex align-items-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS[name] ?? '' }}
    />
  );
}