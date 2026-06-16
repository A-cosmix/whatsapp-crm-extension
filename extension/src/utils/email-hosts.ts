/** Host patterns where the extension injects content scripts */
export const EMAIL_HOST_PATTERNS = [
  'mail.google.com',
  'outlook.live.com',
  'outlook.office.com',
  'outlook.office365.com',
] as const;

export function isEmailHostUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return EMAIL_HOST_PATTERNS.some((pattern) => host === pattern || host.endsWith(`.${pattern}`));
  } catch {
    return EMAIL_HOST_PATTERNS.some((pattern) => url.includes(pattern));
  }
}
