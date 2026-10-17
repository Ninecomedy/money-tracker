export const INTERNAL_DOMAIN = 'money-tracker.invalid';

export function normalizeUsername(value) {
  const username = String(value).trim().toLowerCase();
  if (!/^[a-z0-9_]{3,32}$/.test(username)) {
    throw new Error('Username ต้องมี 3–32 ตัว ใช้ตัวอักษรอังกฤษ ตัวเลข และ _ เท่านั้น');
  }
  return username;
}

export function usernameEmail(value) {
  return `${normalizeUsername(value)}@${INTERNAL_DOMAIN}`;
}

export function accountName(user) {
  const suffix = `@${INTERNAL_DOMAIN}`;
  if (user.email?.endsWith(suffix)) return user.email.slice(0, -suffix.length);
  return user.displayName || 'บัญชีเดิม';
}
