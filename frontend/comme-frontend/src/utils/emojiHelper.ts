import { gemoji } from 'gemoji';

export interface EmojiSuggestion {
    emoji: string;
    name: string;
    description: string;
    category?: string;
}

// Pre-build index for instant O(1) lookup: name -> emoji
export const EMOJI_BY_NAME: Record<string, string> = {};

// Extra common aliases
const EXTRA_ALIASES: Record<string, string> = {
    sad: '😢',
    happy: '😊',
    cry: '😭',
    love: '❤️',
    dead: '💀',
    cool: '😎',
    wink: '😉',
    shrug: '🤷',
    check: '✅',
    cross: '❌',
    yay: '🎉',
    party: '🥳',
    clap: '👏',
    sweat: '😅',
    thinking: '🤔',
    hug: '🤗',
    star_eyes: '🤩',
    mind_blown: '🤯',
    rofl: '🤣',
    lmao: '🤣',
    lol: '😂',
};

// Common text emoticons -> emoji
export const EMOTICON_MAP: Record<string, string> = {
    '<3': '❤️',
    '</3': '💔',
    ':)': '😊',
    ':-)': '😊',
    ':(': '🙁',
    ':-(': '🙁',
    ':D': '😃',
    ':-D': '😃',
    ';)': '😉',
    ';-)': '😉',
    ':P': '😛',
    ':-P': '😛',
    ':p': '😛',
    ':-p': '😛',
    ':o': '😮',
    ':O': '😮',
    ':-O': '😮',
    'XD': '😆',
    'xd': '😆',
    ':*': '😘',
    ':-*': '😘',
    ":'(": '😢',
    ":')": '🥹',
    '>:(': '😠',
};

// Populate EMOJI_BY_NAME from gemoji
for (const item of gemoji) {
    for (const name of item.names) {
        EMOJI_BY_NAME[name.toLowerCase()] = item.emoji;
    }
}

// Add extra aliases
for (const [alias, emoji] of Object.entries(EXTRA_ALIASES)) {
    if (!EMOJI_BY_NAME[alias]) {
        EMOJI_BY_NAME[alias] = emoji;
    }
}

/**
 * Search gemoji for matching emoji shortcodes
 */
export function searchEmojiSuggestions(query: string, limit: number = 8): EmojiSuggestion[] {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return [];

    const exact: EmojiSuggestion[] = [];
    const prefix: EmojiSuggestion[] = [];
    const contains: EmojiSuggestion[] = [];
    const seen = new Set<string>();

    // Check extra aliases first
    for (const [alias, emoji] of Object.entries(EXTRA_ALIASES)) {
        if (alias.startsWith(cleanQuery)) {
            seen.add(emoji);
            prefix.push({
                emoji,
                name: alias,
                description: alias,
            });
        }
    }

    for (const item of gemoji) {
        if (seen.has(item.emoji)) continue;

        const primaryName = item.names[0] || '';
        const exactMatch = item.names.some((n) => n.toLowerCase() === cleanQuery);
        const prefixMatch = item.names.find((n) => n.toLowerCase().startsWith(cleanQuery));
        const tagMatch = item.tags.find((t) => t.toLowerCase().startsWith(cleanQuery) || t.toLowerCase().includes(cleanQuery));
        const descMatch = item.description.toLowerCase().includes(cleanQuery);

        if (exactMatch) {
            seen.add(item.emoji);
            exact.push({
                emoji: item.emoji,
                name: cleanQuery,
                description: item.description,
                category: item.category,
            });
        } else if (prefixMatch) {
            seen.add(item.emoji);
            prefix.push({
                emoji: item.emoji,
                name: prefixMatch,
                description: item.description,
                category: item.category,
            });
        } else if (tagMatch || descMatch) {
            seen.add(item.emoji);
            contains.push({
                emoji: item.emoji,
                name: tagMatch || primaryName,
                description: item.description,
                category: item.category,
            });
        }

        if (exact.length + prefix.length + contains.length >= limit * 2) break;
    }

    return [...exact, ...prefix, ...contains].slice(0, limit);
}

/**
 * Automatically replace completed :shortcode: in text on closing colon
 */
export function autoReplaceShortcodes(text: string): { text: string; hasReplaced: boolean } {
    let hasReplaced = false;

    // Match :name:
    const replacedText = text.replace(/(^|\s):([a-zA-Z0-9_+-]+):/g, (match, prefix, name) => {
        const found = EMOJI_BY_NAME[name.toLowerCase()];
        if (found) {
            hasReplaced = true;
            return prefix + found + ' ';
        }
        return match;
    });

    return { text: replacedText, hasReplaced };
}
