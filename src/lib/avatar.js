export function getAvatarUrl(user) {
  if (!user) return null;
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`avatar_${user.toLowerCase()}`) || null;
    }
  } catch (e) {
    return null;
  }
  return null;
}

export function setAvatarUrl(user, url) {
  if (!user) return;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`avatar_${user.toLowerCase()}`, url);
    }
  } catch (e) {}
}
