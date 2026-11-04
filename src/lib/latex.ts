/**
 * Preprocesses markdown content to normalize LaTeX math expressions for remark-math:
 * 1. Preserves text inside code blocks (```...```) and inline code (`...`) untouched.
 * 2. Normalizes LaTeX display math: \[ ... \] and \\[ ... \\] -> $$ ... $$
 * 3. Normalizes LaTeX inline math: \( ... \) and \\( ... \\) -> $ ... $
 * 4. Wraps standalone LaTeX environments (\begin{equation}...\end{equation}, \begin{align}...\end{align}, etc.) in $$ ... $$
 */
export function preprocessLatex(content: string): string {
  if (!content) return '';

  // Split content by code blocks and inline code to leave them untouched
  const parts = content.split(/(```[\s\S]*?```|`[^`\n]+`)/g);

  const envs = [
    'equation',
    'equation\\*',
    'align',
    'align\\*',
    'aligned',
    'alignat',
    'alignat\\*',
    'gather',
    'gather\\*',
    'matrix',
    'pmatrix',
    'bmatrix',
    'Bmatrix',
    'vmatrix',
    'Vmatrix',
    'cases',
    'split',
  ].join('|');

  const envRegex = new RegExp(
    `(?<!\\$)(?:\\\\begin\\{(${envs})\\}[\\s\\S]*?\\\\end\\{\\1\\})(?!\\$)`,
    'g'
  );

  return parts
    .map((part, index) => {
      // Odd indices are code blocks or inline code -> leave as-is
      if (index % 2 === 1) {
        return part;
      }

      let text = part;

      // 1. Double escaped: \\[ ... \\] and \\( ... \\)
      text = text.replace(/\\\\\[([\s\S]*?)\\\\\]/g, (_, math: string) => `$$\n${math.trim()}\n$$`);
      text = text.replace(/\\\\\(([\s\S]*?)\\\\\)/g, (_, math: string) => `$${math.trim()}$`);

      // 2. Standard display math: \[ ... \] -> $$ ... $$
      text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, math: string) => `$$\n${math.trim()}\n$$`);

      // 3. Standard inline math: \( ... \) -> $ ... $
      text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, math: string) => `$${math.trim()}$`);

      // 4. Wrap standalone LaTeX environments
      text = text.replace(envRegex, (match: string) => `$$\n${match.trim()}\n$$`);

      return text;
    })
    .join('');
}

