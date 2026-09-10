export interface RecentSpotlightItem {
    id: string;
    title: string;
    description?: string;
    path?: string;
    timestamp: number;
    iconKey?: string;
    external?: boolean;
}

const STORAGE_KEY = 'comme_spotlight_recents';
const MAX_RECENTS = 6;

export const getRecentSpotlightItems = (): RecentSpotlightItem[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        return [];
    } catch {
        return [];
    }
};

export const saveRecentSpotlightItem = (item: Omit<RecentSpotlightItem, 'timestamp'>) => {
    try {
        const current = getRecentSpotlightItems();
        const filtered = current.filter(i => i.id !== item.id && (!item.path || i.path !== item.path));
        const newItem: RecentSpotlightItem = {
            ...item,
            timestamp: Date.now(),
        };
        const updated = [newItem, ...filtered].slice(0, MAX_RECENTS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('spotlight-recents-updated'));
    } catch {
        // Ignore storage errors
    }
};

export const removeRecentSpotlightItem = (id: string) => {
    try {
        const current = getRecentSpotlightItems();
        const updated = current.filter(i => i.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('spotlight-recents-updated'));
    } catch {
        // Ignore
    }
};

export const clearRecentSpotlightItems = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent('spotlight-recents-updated'));
    } catch {
        // Ignore
    }
};

export const formatRelativeTime = (timestamp: number): string => {
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
};
