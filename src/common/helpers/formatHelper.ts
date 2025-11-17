/**
 * View helpers: formatting and small HTML snippets used in EJS templates.
 * Keep helpers pure and lightweight. For heavy operations (file export, IO)
 * use server-side utils/services instead.
 */

export function formatDate(
  input: string | Date | number | undefined,
  locale = 'en-US',
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!input) return '';
  const date = input instanceof Date ? input : new Date(input as any);
  try {
    return new Intl.DateTimeFormat(
      locale,
      options || { year: 'numeric', month: 'short', day: 'numeric' },
    ).format(date);
  } catch {
    return date.toLocaleString();
  }
}

export function truncate(
  text: string | undefined,
  length = 140,
  suffix = '…',
): string {
  if (!text) return '';
  const s = String(text);
  if (s.length <= length) return s;
  return s.slice(0, length).trimEnd() + suffix;
}

export function formatNumber(
  value: number | string | undefined,
  locale = 'en-US',
  options?: Intl.NumberFormatOptions,
): string {
  if (value === undefined || value === null || value === '') return '';
  const num =
    typeof value === 'number'
      ? value
      : Number(String(value).replace(/[^0-9.-]+/g, ''));
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat(locale, options || {}).format(num);
}

// renderBadge returns a small HTML snippet (unescaped) for quick status display
export function renderBadge(status: string, label?: string): string {
  const s = (status || '').toLowerCase();
  const text = label || status || '';
  let color = '#6b7280'; // default gray
  if (s === 'active' || s === 'online' || s === 'published') color = '#16a34a';
  else if (s === 'draft' || s === 'inactive') color = '#f59e0b';
  else if (s === 'error' || s === 'failed') color = '#dc2626';

  // inline styles keep helpers self-contained; templates can override via classes
  return `<span class="helper-badge" style="display:inline-block;padding:0.18rem 0.5rem;border-radius:999px;background:${color};color:#fff;font-size:0.8rem;font-weight:600;">${escapeHtml(text)}</span>`;
}

export function imageUrl(path: string | undefined): string {
  if (!path) return '';
  // if already an absolute URL or starts with /, return as-is
  if (/^(https?:)?\/\//.test(path) || path.startsWith('/')) return path;
  // otherwise assume under /images or /icons in public
  return '/' + path.replace(/^\/+/, '');
}

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
