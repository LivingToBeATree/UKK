import { useEffect } from 'react';

export const APP_NAME = 'Comme';
export const TITLE_SEPARATOR = '—';
export const DEFAULT_TAGLINE = 'Digital Commission & Creator Platform';

/**
 * Converts a URL slug or identifier into Title Case text.
 * e.g., "cyberpunk-cityscape-art" -> "Cyberpunk Cityscape Art"
 * e.g., "42" -> "#42"
 */
export function slugToTitle(slug?: string): string {
    if (!slug) return '';
    const decoded = decodeURIComponent(slug).trim();

    // If pure number, format as item number
    if (/^\d+$/.test(decoded)) {
        return `#${decoded}`;
    }

    return decoded
        .replace(/[-_]+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Formats a given page or entity title with the standard "Comme — ..." branding.
 */
export function formatDocumentTitle(pageOrSlug?: string, raw = false): string {
    if (!pageOrSlug || pageOrSlug.trim() === '') {
        return `${APP_NAME} ${TITLE_SEPARATOR} ${DEFAULT_TAGLINE}`;
    }

    const trimmed = pageOrSlug.trim();

    if (raw || trimmed.startsWith(`${APP_NAME} `)) {
        return trimmed;
    }

    return `${APP_NAME} ${TITLE_SEPARATOR} ${trimmed}`;
}

/**
 * Directly updates document.title in the browser.
 */
export function setDocumentTitle(pageOrSlug?: string, raw = false): void {
    if (typeof document !== 'undefined') {
        document.title = formatDocumentTitle(pageOrSlug, raw);
    }
}

/**
 * React hook to synchronize document.title with component lifecycle.
 */
export function useDocumentTitle(title?: string | null, options?: { raw?: boolean }): void {
    useEffect(() => {
        if (title) {
            setDocumentTitle(title, options?.raw);
        }
    }, [title, options?.raw]);
}
