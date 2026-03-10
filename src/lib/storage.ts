import { Bookmark } from '@/types';

const BOOKMARKS_KEY = 'daker_bookmarks';
const THEME_KEY = 'daker_theme';

export function getBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(BOOKMARKS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addBookmark(slug: string): Bookmark[] {
  const bookmarks = getBookmarks();
  if (!bookmarks.find((b) => b.slug === slug)) {
    bookmarks.push({ slug, addedAt: new Date().toISOString() });
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }
  return bookmarks;
}

export function removeBookmark(slug: string): Bookmark[] {
  const bookmarks = getBookmarks().filter((b) => b.slug !== slug);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  return bookmarks;
}

export function isBookmarked(slug: string): boolean {
  return getBookmarks().some((b) => b.slug === slug);
}

export function getTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
}

export function setTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem(THEME_KEY, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function toggleTheme(): 'light' | 'dark' {
  const current = getTheme();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
  return next;
}
