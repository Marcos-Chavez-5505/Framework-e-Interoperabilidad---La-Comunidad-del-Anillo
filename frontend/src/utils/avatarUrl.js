const DICEBEAR_VERSION = '10.x';
const DICEBEAR_STYLE = 'thumbs';
const DICEBEAR_BASE = `https://api.dicebear.com/${DICEBEAR_VERSION}/${DICEBEAR_STYLE}/svg`;

const FALLBACK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
  '<rect width="64" height="64" fill="#3a3040"/>' +
  '<circle cx="32" cy="25" r="12" fill="#a89bb0"/>' +
  '<path d="M10 62c0-13 10-21 22-21s22 8 22 21z" fill="#a89bb0"/>' +
  '</svg>';

export const FALLBACK_AVATAR = `data:image/svg+xml,${encodeURIComponent(FALLBACK_SVG)}`;

export function avatarUrl(user) {
  const custom = typeof user?.avatar === 'string' ? user.avatar.trim() : '';
  if (custom) return custom;

  const seed = user?.id != null ? String(user.id) : String(user?.username ?? 'anonimo');
  return `${DICEBEAR_BASE}?seed=${encodeURIComponent(seed)}`;
}

export function onAvatarError(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = FALLBACK_AVATAR;
}
