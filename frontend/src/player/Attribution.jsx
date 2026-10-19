export default function TrackAttribution({ track, className = '' }) {
  if (!track?.jamendo_id && !track?.share_url) return null;

  const license = track.license_url ? (
    <a href={track.license_url} target="_blank" rel="noopener noreferrer">
      Licencia
    </a>
  ) : track.share_url ? (
    <a href={track.share_url} target="_blank" rel="noopener noreferrer">
      Ver licencia en Jamendo
    </a>
  ) : null;

  return (
    <span className={`text-secondary small text-truncate ${className}`.trim()}>
      Música:{' '}
      <a href="https://www.jamendo.com" target="_blank" rel="noopener noreferrer">
        Jamendo
      </a>
      {license ? <> · {license}</> : null}
    </span>
  );
}
