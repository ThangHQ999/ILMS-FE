import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT_DIR = path.resolve(__dirname, '../../../..');
const VI_PATH = path.join(ROOT_DIR, 'src/messages/vi.json');
const EN_PATH = path.join(ROOT_DIR, 'src/messages/en.json');

const VIETNAMESE_ACCENTED_REGEX =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;

function collectLeafEntries(
  obj: unknown,
  prefix = ''
): Map<string, string> {
  const result = new Map<string, string>();
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return result;
  }
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      result.set(fullKey, value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [nestedKey, nestedVal] of collectLeafEntries(value, fullKey)) {
        result.set(nestedKey, nestedVal);
      }
    }
  }
  return result;
}

function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\{([a-zA-Z0-9_]+)\}/g) ?? [];
  return [...new Set(matches)].sort();
}

function listFilesRecursive(dir: string, extension: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(fullPath, extension));
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(fullPath);
    }
  }
  return files;
}

function stripComments(source: string): string {
  // Remove block comments and single-line comments so code comments do not trigger false positives.
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

test('chat namespace in vi.json and en.json is 100% key-symmetric with matching placeholders', () => {
  const viJson = JSON.parse(fs.readFileSync(VI_PATH, 'utf8')) as { chat?: unknown };
  const enJson = JSON.parse(fs.readFileSync(EN_PATH, 'utf8')) as { chat?: unknown };

  assert.ok(viJson.chat, 'vi.json must define "chat" namespace');
  assert.ok(enJson.chat, 'en.json must define "chat" namespace');

  const viLeaves = collectLeafEntries(viJson.chat);
  const enLeaves = collectLeafEntries(enJson.chat);

  const missingInEn = [...viLeaves.keys()].filter((k) => !enLeaves.has(k));
  const missingInVi = [...enLeaves.keys()].filter((k) => !viLeaves.has(k));

  assert.deepEqual(missingInEn, [], `Keys present in vi.json but missing in en.json: ${missingInEn.join(', ')}`);
  assert.deepEqual(missingInVi, [], `Keys present in en.json but missing in vi.json: ${missingInVi.join(', ')}`);

  for (const [key, viVal] of viLeaves.entries()) {
    const enVal = enLeaves.get(key)!;
    assert.ok(viVal.trim().length > 0, `vi.json chat.${key} must be non-empty`);
    assert.ok(enVal.trim().length > 0, `en.json chat.${key} must be non-empty`);
    assert.deepEqual(
      extractPlaceholders(enVal),
      extractPlaceholders(viVal),
      `Placeholder mismatch for chat.${key}`
    );
  }
});

test('chat UI components, route error boundary, hooks, and schemas have zero hardcoded accented Vietnamese strings', () => {
  const targetFiles = [
    ...listFilesRecursive(path.join(ROOT_DIR, 'src/features/chat/components'), '.tsx'),
    ...listFilesRecursive(path.join(ROOT_DIR, 'src/app/chat'), '.tsx'),
    ...listFilesRecursive(path.join(ROOT_DIR, 'src/features/chat/hooks'), '.ts'),
    ...listFilesRecursive(path.join(ROOT_DIR, 'src/features/chat/schemas'), '.ts'),
    path.join(ROOT_DIR, 'src/features/chat/constants/chat-slash-commands.ts'),
  ];

  const violations: string[] = [];

  for (const filePath of targetFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const codeOnly = stripComments(content);
    const lines = codeOnly.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (VIETNAMESE_ACCENTED_REGEX.test(line)) {
        const rel = path.relative(ROOT_DIR, filePath);
        violations.push(`${rel}:${index + 1}: ${line.trim()}`);
      }
    });
  }

  assert.deepEqual(
    violations,
    [],
    `Found leftover hardcoded Vietnamese UI strings:\n${violations.join('\n')}`
  );

  const bannerSource = stripComments(
    fs.readFileSync(
      path.join(ROOT_DIR, 'src/features/classes/components/detail/ClassDetailBanner.tsx'),
      'utf8'
    )
  );
  assert.ok(
    bannerSource.includes("tChat('classChannelBtn')") &&
      !bannerSource.includes('Kênh chat lớp'),
    'ClassDetailBanner.tsx must use tChat("classChannelBtn") instead of hardcoded Vietnamese'
  );
});
