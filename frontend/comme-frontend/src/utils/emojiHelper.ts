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
// gemoji itself already ships every official Unicode shortcode (~1870 emoji / ~1900 names),
// so this list is deliberately the "human slang" layer on top of that: words people actually
// type in a chat app (Discord/Slack-style) that AREN'T already an official shortcode.
// Every value below was resolved against the live gemoji dataset, so the character is always
// a real, correctly-encoded emoji — nothing here is hand-typed unicode.
const EXTRA_ALIASES: Record<string, string> = {
    // --- original core set ---
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

    // --- EMOTIONS (feelings people search by mood word, not by official shortcode) ---
    blue: '😢', down: '😞', gloomy: '😞', miserable: '😭', heartbroken: '💔', brokenhearted: '💔',
    devastated: '😭', hurt: '😔', weepy: '😭', tearful: '😢', upset: '😞', glad: '🙂', joyful: '😃',
    joyous: '😃', cheerful: '😄', elated: '🤩', ecstatic: '🤩', thrilled: '🤩', delighted: '😊',
    pleased: '😌', content: '☺️', satisfied: '😌', pumped: '💪', hyped: '🤩', stoked: '🤩',
    excited: '🤩', angry: '😡', furious: '😡', pissed: '😤', irritated: '😒', annoyed: '😒',
    frustrated: '😤', enraged: '😡', livid: '😡', salty: '😒', triggered: '😡', heated: '😡',
    crush: '😍', infatuated: '😍', smitten: '😍', romantic: '😘', affection: '💕', scared: '😱',
    afraid: '😨', terrified: '😱', frightened: '😨', spooked: '👻', nervous: '😬', anxious: '😬',
    worried: '😟', uneasy: '😖', jittery: '😰', surprised: '😮', shocked: '😲', stunned: '😳',
    amazed: '🤩', speechless: '🤐', gobsmacked: '🤯', floored: '🤯', confused: '😕', puzzled: '🤔',
    baffled: '😵', perplexed: '😕', bewildered: '😵', lost: '😟', clueless: '🤷', bored: '😑',
    tired: '😫', sleepy: '😪', exhausted: '😩', drained: '😩', weary: '😩', fatigued: '😫',
    drowsy: '😪', disgusted: '🤢', grossed: '🤢', nauseated: '🤢', icky: '🤢', yuck: '🤢', ew: '🤢',
    embarrassed: '😳', ashamed: '😳', awkward: '😬', cringy: '😬', mortified: '😳', flustered: '😳',
    blushing: '😊', proud: '😌', confident: '😎', smug: '😏', cocky: '😏', arrogant: '😏',
    jealous: '😒', envious: '😒', bitter: '😒', lonely: '😔', isolated: '😔', alone: '😔',
    hopeful: '🙏', optimistic: '🙂', wishful: '🙏', grateful: '🙏', thankful: '🙏', blessed: '🙏',
    appreciative: '🙏', relieved: '😌', calm: '☺️', relaxed: '☺️', chill: '☺️', peaceful: '☺️',
    zen: '☺️', serene: '☺️', curious: '🤔', intrigued: '🤔', interested: '👀', sick: '🤒', ill: '🤒',
    unwell: '🤢', queasy: '🤢', drunk: '🥴', tipsy: '🥴', wasted: '🥴', hammered: '🥴', cold: '🥶',
    freezing: '🥶', chilly: '🥶', hot: '🥵', sweaty: '😓', overheated: '🥵', boiling: '🥵',

    // --- SLANG (internet/Discord-speak reactions) ---
    lmfao: '🤣', omg: '😲', wtf: '😖', smh: '😒', tbh: '💬', idk: '🤷', ikr: '💯', fr: '💯',
    deadass: '😑', based: '😎', cringe: '😬', cap: '🤥', no_cap: '✋', sus: '👀', poggers: '🤩',
    pog: '🤩', sadge: '😔', copium: '😩', ratio: '📉', mid: '😐', goated: '🐐', bussin: '😋',
    drip: '😎', slay: '💅', vibe: '🎶', mood: '🤔', same: '💯', facts: '💯', real: '💯', ded: '💀',
    dying: '😂', yeet: '🚀', oof: '😬', yikes: '😬', simp: '😍', stan: '😍', extra: '🤩',
    lowkey: '🤫', highkey: '📢', savage: '😏', big_yikes: '😬', touch_grass: '🌿', say_less: '👌',
    bet: '👌', hits_different: '🤯', main_character: '🤩', npc: '🤖', gg: '🏆', glhf: '🍀', ez: '😎',
    noob: '👶', pwned: '💀', rekt: '💀', clutch: '💪', afk: '💤', brb: '🏃', gtg: '🏃', ttyl: '👋',
    nvm: '🤷', btw: '💬', fyi: '💬', imo: '💬', imho: '💬', irl: '🌎', ftw: '🙌', sup: '👋',
    yo: '👋', bruh: '😑', welp: '🤷', meh: '😑', eh: '🤷', ugh: '😒', uwu: '😊', owo: '😳',
    cheugy: '😒',

    // --- GESTURES / BODY LANGUAGE ---
    nod: '👍', headshake: '👎', highfive: '🙌', fistbump: '👊', eyeroll: '🙄', side_eye: '👀',
    stare: '👀', glare: '😒', blink: '😉', yawn: '🥱', stretch: '🤸', flex: '💪', point: '👉',
    pointing: '👉', snap: '✋', applause: '👏', namaste: '🙏', fingers_crossed: '🤞', rock_on: '🤘',
    hang_loose: '🤙', salute: '🫡', facedesk: '🤦', bow: '🙇', kneel: '🧎',

    // --- ANIMALS (casual/onomatopoeia names) ---
    puppy: '🐶', kitty: '🐱', kitten: '🐱', bunny: '🐰', doggo: '🐶', birdie: '🐦', ducky: '🦆',
    piggy: '🐷', froggy: '🐸', dino: '🦖', dinosaur: '🦖', ladybug: '🐞', snek: '🐍', moo: '🐮',
    baa: '🐑', quack: '🦆', meow: '🐱', woof: '🐶', ribbit: '🐸', oink: '🐷', neigh: '🐴',

    // --- FOOD & DRINK (casual names) ---
    burger: '🍔', fries: '🍟', soda: '🥤', boba: '🧋', chocolate: '🍫', noodles: '🍜', avo: '🥑',
    honey: '🍯', milk: '🥛', cheers: '🥂', hangry: '😡', snack: '🍿', dessert: '🍰', bbq: '🍖',
    brunch: '🍳', latte: '☕', espresso: '☕', smoothie: '🥤',

    // --- WEATHER / NATURE (casual names) ---
    sunny: '☀️', rainy: '🌧️', snowy: '❄️', stormy: '⛈️', windy: '🌬️', foggy: '🌫️', starry: '✨',
    galaxy: '🌌', space: '🚀', ocean: '🌊', beach: '🏖️', forest: '🌲', flower: '🌸', plant: '🌱',
    tree: '🌳', lucky: '🍀',

    // --- OBJECTS / TECH (casual names) ---
    phone: '📱', laptop: '💻', pc: '💻', console: '🎮', controller: '🕹️', mic: '🎤', clock: '⏰',
    time: '⌛', money: '💸', cash: '💰', rich: '💰', present: '🎁', knife: '🔪', sword: '⚔️',
    paint: '🎨', medal: '🥇', diamond: '💎', bag: '👜', hat: '🎩', shoe: '👟', shirt: '👕',
    wallet: '💵', headphone: '🎧', battery_low: '🔋', wifi: '📶', link: '🔗',

    // --- TRAVEL / PLACES (casual names) ---
    plane: '✈️', ship: '🚢', bike: '🚲', home: '🏠', city: '🏙️', island: '🏝️', roadtrip: '🚗',
    vacation: '🏖️', camping: '⛺', hiking: '🥾',

    // --- SPORTS / ACTIVITIES (casual names) ---
    swim: '🏊', run: '🏃', dance: '💃', chess: '♟️', cards: '🎴', workout: '🏋️', yoga: '🧘',
    gaming: '🎮', esports: '🏆',

    // --- the "no one uses these, but why not" pile ---
    shit: '💩', poop: '💩', crap: '💩', holy_shit: '💩', bullshit: '💩',
    potato: '🥔', avocadotoast: '🥑', spork: '🍴', doorknob: '🚪', lint: '🧵', shrugging: '🤷',
    whatever: '🤷', crickets: '🦗', dust: '💨', emptiness: '🌑', voidstare: '😶', blank: '⬜',
    nothingness: '⬛', pointless: '🤷', random: '🎲', chaos: '💥', banana_peel: '🍌',
    rubber_duck: '🦆',
};

// Common text emoticons -> emoji
// Covers the classic Western ASCII "smiley zoo" (all the eyes/nose/mouth combos people
// actually type) plus a handful of popular kaomoji, so text emoticons auto-convert the
// way they do in Discord/Slack/iMessage.
export const EMOTICON_MAP: Record<string, string> = {
    // --- original core set ---
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

    // --- happy / smile variants ---
    ':]': '🙂', ':-]': '🙂', '=)': '🙂', '=]': '🙂', '(:': '🙂', '(-:': '🙂', 'c:': '🙂', 'C:': '🙂',

    // --- big grin / laughing variants ---
    '=D': '😃', '8D': '😆', 'xD': '😆', ':d': '😃', ':-d': '😃', ':))': '😃', ':-))': '😃',

    // --- sad / crying variants ---
    ':[': '😞', ':-[': '😞', '=(': '😞', '=[': '😞', '):': '😞', ')-:': '😞', ']:': '😞',
    ']-:': '😞', ':((': '😭', ':-((': '😭', ';(': '😢', ';-(': '😢', ':,(': '😢',

    // --- wink variants ---
    ';]': '😉', ';-]': '😉', '^_~': '😉', '^.~': '😉',

    // --- tongue-out variants ---
    '=P': '😛', '=p': '😛', ':b': '😛', ':-b': '😛', ':B': '😛',

    // --- skeptical / unsure variants ---
    ':/': '😕', ':-/': '😕', ':\\': '😕', ':-\\': '😕', '=/': '😕', '=\\': '😕',

    // --- neutral / straight face variants ---
    ':|': '😐', ':-|': '😐', '=|': '😐',

    // --- shock / surprise variants ---
    ':-o': '😮', '=O': '😮', '=o': '😮', '8o': '😯', '8-o': '😯',

    // --- angel / devil variants ---
    'O:)': '😇', 'O:-)': '😇', '0:)': '😇', '0:-)': '😇', '>:)': '😈', '>:-)': '😈', '3:)': '😈',
    '3:-)': '😈',

    // --- angry variants ---
    '>:-(': '😠', 'D:': '😧', 'D-:': '😧',

    // --- cool / sunglasses variants ---
    '8-)': '😎', 'B)': '😎', 'B-)': '😎',

    // --- hard crying variants ---
    'T_T': '😭', 'T.T': '😭', ';_;': '😭', 'Q_Q': '😭',

    // --- dizzy / confused variants ---
    '%)': '😵', '%-)': '😵', 'o.O': '😵', 'O.o': '😵',

    // --- misc (kiss, blush, sealed lips, sick, deadpan) ---
    ':^*': '😘', ':">': '😊', ':$': '😳', ':X': '🤐', ':-X': '🤐', ':x': '🤐', ':-#': '🤐',
    '+_+': '😵', '-_-': '😑', '-_-zzz': '😴',

    // --- popular kaomoji ---
    '¯\\_(ツ)_/¯': '🤷', 'ಠ_ಠ': '😒', '( ͡° ͜ʖ ͡°)': '😏', '(╯°□°)╯︵ ┻━┻': '😡', '┬─┬ ノ( ゜-゜ノ)': '☺️',
    '(¬‿¬)': '😏', '(o^▽^o)': '😊', '(≧◡≦)': '😃',
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
 * Automatically replace completed :shortcode: in text on closing colon, plus emoticons followed by space
 */
export function autoReplaceShortcodes(text: string): { text: string; hasReplaced: boolean } {
    let hasReplaced = false;

    // 1. Match :name:
    let replacedText = text.replace(/(^|\s):([a-zA-Z0-9_+-]+):/g, (match, prefix, name) => {
        const found = EMOJI_BY_NAME[name.toLowerCase()];
        if (found) {
            hasReplaced = true;
            return prefix + found + ' ';
        }
        return match;
    });

    // 2. Match trailing emoticon (e.g. user typed ":) " or "<3 " or "¯\_(ツ)_/¯")
    for (const [emoticon, emoji] of Object.entries(EMOTICON_MAP)) {
        const escaped = emoticon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'g');
        if (regex.test(replacedText)) {
            replacedText = replacedText.replace(regex, `$1${emoji}$2`);
            hasReplaced = true;
        }
    }

    return { text: replacedText, hasReplaced };
}