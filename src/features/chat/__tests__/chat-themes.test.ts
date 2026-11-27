import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  CHAT_EMOJI_CATEGORIES,
  searchChatEmojis,
} from '../constants/chat-emojis';
import {
  CHAT_THEMES,
  CHAT_THEME_ORDER,
  resolveChatTheme,
  type ChatThemeKey,
} from '../constants/chat-themes';

const EXPECTED_BE_KEYS: ChatThemeKey[] = [
  'DEFAULT',
  'OCEAN',
  'FOREST',
  'LOVE',
  'SUNSET',
  'MIDNIGHT',
];

test('CHAT_THEME_ORDER matches all 6 backend enum keys without duplicates', () => {
  assert.equal(CHAT_THEME_ORDER.length, 6);
  assert.deepEqual([...CHAT_THEME_ORDER].sort(), [...EXPECTED_BE_KEYS].sort());
});

test('resolveChatTheme handles case-insensitivity and falls back safely to DEFAULT', () => {
  assert.equal(resolveChatTheme('ocean').key, 'OCEAN');
  assert.equal(resolveChatTheme('Forest').key, 'FOREST');
  assert.equal(resolveChatTheme(null).key, 'DEFAULT');
  assert.equal(resolveChatTheme(undefined).key, 'DEFAULT');
  assert.equal(resolveChatTheme('UNKNOWN_KEY').key, 'DEFAULT');
});

test('all 5 artistic themes provide existing wallpaper assets and complete theme tokens', () => {
  const artisticKeys = EXPECTED_BE_KEYS.filter((k) => k !== 'DEFAULT');
  assert.equal(CHAT_THEMES.DEFAULT.wallpaperUrl, null);

  for (const key of artisticKeys) {
    const theme = CHAT_THEMES[key];
    assert.ok(theme.wallpaperUrl, `${key} should define wallpaperUrl`);
    assert.match(theme.wallpaperUrl!, /^\/images\/chat-themes\/.+\.png$/);

    const diskPath = path.join(process.cwd(), 'public', theme.wallpaperUrl!);
    assert.ok(fs.existsSync(diskPath), `Missing wallpaper file: ${diskPath}`);
    assert.ok(fs.statSync(diskPath).size > 0, `Empty wallpaper file: ${diskPath}`);
  }

  for (const key of EXPECTED_BE_KEYS) {
    const theme = CHAT_THEMES[key];
    assert.ok(theme.surfaceBgClass.length > 0);
    assert.ok(theme.headerClass.length > 0);
    assert.ok(theme.composerBarClass.length > 0);
    assert.ok(theme.myBubbleClass.length > 0);
    assert.ok(theme.peerBubbleClass.length > 0);
    assert.ok(theme.dateDividerClass.length > 0);
    assert.ok(theme.previewCancelBtnClass.length > 0);
    assert.ok(theme.previewConfirmBtnClass.length > 0);
    assert.ok(theme.aiBubbleClass.length > 0);
    assert.ok(theme.aiHeaderClass.length > 0);
    assert.ok(theme.aiAvatarClass.length > 0);
    assert.ok(theme.aiDotClass.length > 0);
    assert.ok(theme.aiSourceChipClass.length > 0);
    assert.ok(theme.highlightRingClass.length > 0);
  }
});

test('CHAT_EMOJI_CATEGORIES defines 8 non-empty categories and searchChatEmojis supports vi/en queries', () => {
  assert.equal(CHAT_EMOJI_CATEGORIES.length, 8);
  for (const cat of CHAT_EMOJI_CATEGORIES) {
    assert.ok(cat.items.length >= 16, `${cat.id} should contain at least 16 emojis`);
  }

  const smileResults = searchChatEmojis('cuoi');
  assert.ok(smileResults.some((e) => e.emoji === '😂'));

  const accentedResults = searchChatEmojis('cười');
  assert.ok(accentedResults.some((e) => e.emoji === '😂'));

  const heartResults = searchChatEmojis('trái tim');
  assert.ok(heartResults.some((e) => e.emoji === '❤️'));

  const fireResults = searchChatEmojis('fire');
  assert.ok(fireResults.some((e) => e.emoji === '🔥'));

  assert.deepEqual(searchChatEmojis('   '), []);
});
