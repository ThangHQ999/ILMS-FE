/**
 * Pure TypeScript ISO/IEC 18004 QR Code matrix generator (Versions 1-10, Byte mode, EC Level M).
 * Zero external dependencies. Produces a scannable boolean[][] module matrix (true = dark).
 */

interface VersionSpec {
  version: number;
  totalCodewords: number;
  ecPerBlock: number;
  g1Blocks: number;
  g1Data: number;
  g2Blocks: number;
  g2Data: number;
  alignCenters: number[];
}

// ISO/IEC 18004 Error Correction Level M specs for Versions 1..10
const VERSION_SPECS: VersionSpec[] = [
  { version: 1, totalCodewords: 26, ecPerBlock: 10, g1Blocks: 1, g1Data: 16, g2Blocks: 0, g2Data: 0, alignCenters: [] },
  { version: 2, totalCodewords: 44, ecPerBlock: 16, g1Blocks: 1, g1Data: 28, g2Blocks: 0, g2Data: 0, alignCenters: [6, 18] },
  { version: 3, totalCodewords: 70, ecPerBlock: 26, g1Blocks: 1, g1Data: 44, g2Blocks: 0, g2Data: 0, alignCenters: [6, 22] },
  { version: 4, totalCodewords: 100, ecPerBlock: 18, g1Blocks: 2, g1Data: 32, g2Blocks: 0, g2Data: 0, alignCenters: [6, 26] },
  { version: 5, totalCodewords: 134, ecPerBlock: 24, g1Blocks: 2, g1Data: 43, g2Blocks: 0, g2Data: 0, alignCenters: [6, 30] },
  { version: 6, totalCodewords: 172, ecPerBlock: 16, g1Blocks: 4, g1Data: 27, g2Blocks: 0, g2Data: 0, alignCenters: [6, 34] },
  { version: 7, totalCodewords: 196, ecPerBlock: 18, g1Blocks: 4, g1Data: 31, g2Blocks: 0, g2Data: 0, alignCenters: [6, 22, 38] },
  { version: 8, totalCodewords: 242, ecPerBlock: 22, g1Blocks: 2, g1Data: 38, g2Blocks: 2, g2Data: 39, alignCenters: [6, 24, 42] },
  { version: 9, totalCodewords: 292, ecPerBlock: 22, g1Blocks: 3, g1Data: 36, g2Blocks: 2, g2Data: 37, alignCenters: [6, 26, 46] },
  { version: 10, totalCodewords: 346, ecPerBlock: 26, g1Blocks: 4, g1Data: 43, g2Blocks: 1, g2Data: 44, alignCenters: [6, 28, 50] },
];

// GF(256) lookup tables for primitive polynomial 0x11D
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_EXP[i + 255] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    const factor = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], factor);
    }
    poly = next;
  }
  return poly;
}

function rsComputeEc(data: Uint8Array, ecCount: number): Uint8Array {
  const gen = rsGeneratorPoly(ecCount);
  const work = new Uint8Array(data.length + ecCount);
  work.set(data, 0);
  for (let i = 0; i < data.length; i++) {
    const coef = work[i];
    if (coef !== 0) {
      for (let j = 1; j < gen.length; j++) {
        work[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return work.slice(data.length);
}

function selectVersion(byteLength: number): VersionSpec {
  for (const spec of VERSION_SPECS) {
    const totalDataCodewords = spec.g1Blocks * spec.g1Data + spec.g2Blocks * spec.g2Data;
    const countBits = spec.version <= 9 ? 8 : 16;
    const availableBits = totalDataCodewords * 8 - 4 - countBits;
    if (byteLength * 8 <= availableBits) {
      return spec;
    }
  }
  throw new Error(`QR payload too long (${byteLength} bytes, max 213 bytes).`);
}

function encodeDataCodewords(bytes: Uint8Array, spec: VersionSpec): Uint8Array {
  const totalDataCodewords = spec.g1Blocks * spec.g1Data + spec.g2Blocks * spec.g2Data;
  const bits: number[] = [];
  const pushBits = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) {
      bits.push((value >>> i) & 1);
    }
  };

  // Mode indicator: Byte (0100)
  pushBits(0b0100, 4);
  // Character count indicator
  pushBits(bytes.length, spec.version <= 9 ? 8 : 16);
  // Payload bytes
  for (let i = 0; i < bytes.length; i++) {
    pushBits(bytes[i], 8);
  }
  // Terminator (up to 4 zero bits)
  const maxBits = totalDataCodewords * 8;
  const terminatorLen = Math.min(4, maxBits - bits.length);
  pushBits(0, terminatorLen);
  // Byte boundary padding
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const codewords = new Uint8Array(totalDataCodewords);
  let idx = 0;
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bits[i + j];
    }
    codewords[idx++] = b;
  }

  // Pad codewords alternating 0xEC and 0x11
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (idx < totalDataCodewords) {
    codewords[idx++] = padBytes[padIdx % 2];
    padIdx++;
  }

  return codewords;
}

function buildFinalCodewords(dataCodewords: Uint8Array, spec: VersionSpec): Uint8Array {
  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  let offset = 0;

  for (let i = 0; i < spec.g1Blocks; i++) {
    const block = dataCodewords.slice(offset, offset + spec.g1Data);
    offset += spec.g1Data;
    dataBlocks.push(block);
    ecBlocks.push(rsComputeEc(block, spec.ecPerBlock));
  }
  for (let i = 0; i < spec.g2Blocks; i++) {
    const block = dataCodewords.slice(offset, offset + spec.g2Data);
    offset += spec.g2Data;
    dataBlocks.push(block);
    ecBlocks.push(rsComputeEc(block, spec.ecPerBlock));
  }

  const result = new Uint8Array(spec.totalCodewords);
  let out = 0;

  const maxDataLen = Math.max(spec.g1Data, spec.g2Data);
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of dataBlocks) {
      if (i < block.length) {
        result[out++] = block[i];
      }
    }
  }
  for (let i = 0; i < spec.ecPerBlock; i++) {
    for (const block of ecBlocks) {
      result[out++] = block[i];
    }
  }

  return result;
}

function createMatrix(size: number): { modules: boolean[][]; isFunction: boolean[][] } {
  const modules = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const isFunction = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  return { modules, isFunction };
}

function setFunctionModule(
  modules: boolean[][],
  isFunction: boolean[][],
  row: number,
  col: number,
  dark: boolean
) {
  if (row >= 0 && row < modules.length && col >= 0 && col < modules.length) {
    modules[row][col] = dark;
    isFunction[row][col] = true;
  }
}

function drawFinderPattern(modules: boolean[][], isFunction: boolean[][], topRow: number, leftCol: number) {
  for (let dr = -1; dr <= 7; dr++) {
    for (let dc = -1; dc <= 7; dc++) {
      const r = topRow + dr;
      const c = leftCol + dc;
      if (r < 0 || r >= modules.length || c < 0 || c >= modules.length) continue;
      const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
      const isBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
      const isInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
      setFunctionModule(modules, isFunction, r, c, inOuter && (isBorder || isInner));
    }
  }
}

function drawAlignmentPattern(modules: boolean[][], isFunction: boolean[][], centerR: number, centerC: number) {
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const dist = Math.max(Math.abs(dr), Math.abs(dc));
      setFunctionModule(modules, isFunction, centerR + dr, centerC + dc, dist !== 1);
    }
  }
}

function drawFunctionPatterns(modules: boolean[][], isFunction: boolean[][], spec: VersionSpec) {
  const size = modules.length;

  // 3 Finder patterns + separators
  drawFinderPattern(modules, isFunction, 0, 0);
  drawFinderPattern(modules, isFunction, 0, size - 7);
  drawFinderPattern(modules, isFunction, size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const dark = i % 2 === 0;
    setFunctionModule(modules, isFunction, 6, i, dark);
    setFunctionModule(modules, isFunction, i, 6, dark);
  }

  // Alignment patterns
  const centers = spec.alignCenters;
  for (let i = 0; i < centers.length; i++) {
    for (let j = 0; j < centers.length; j++) {
      const r = centers[i];
      const c = centers[j];
      if (isFunction[r][c]) continue;
      drawAlignmentPattern(modules, isFunction, r, c);
    }
  }

  // Dark module
  setFunctionModule(modules, isFunction, 4 * spec.version + 9, 8, true);

  // Reserve format information areas
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      setFunctionModule(modules, isFunction, 8, i, false);
      setFunctionModule(modules, isFunction, i, 8, false);
    }
  }
  for (let i = 0; i < 8; i++) {
    setFunctionModule(modules, isFunction, 8, size - 1 - i, false);
    if (i < 7) {
      setFunctionModule(modules, isFunction, size - 1 - i, 8, false);
    }
  }

  // Reserve version information areas for version >= 7
  if (spec.version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        setFunctionModule(modules, isFunction, i, size - 11 + j, false);
        setFunctionModule(modules, isFunction, size - 11 + j, i, false);
      }
    }
  }
}

function placeDataBits(modules: boolean[][], isFunction: boolean[][], codewords: Uint8Array) {
  const size = modules.length;
  let bitIndex = 0;
  const totalBits = codewords.length * 8;
  let upward = true;

  for (let rightCol = size - 1; rightCol >= 1; rightCol -= 2) {
    if (rightCol === 6) rightCol = 5;
    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i;
      for (let offset = 0; offset < 2; offset++) {
        const col = rightCol - offset;
        if (!isFunction[row][col]) {
          let dark = false;
          if (bitIndex < totalBits) {
            const byteIdx = bitIndex >>> 3;
            const bitPos = 7 - (bitIndex & 7);
            dark = ((codewords[byteIdx] >>> bitPos) & 1) === 1;
            bitIndex++;
          }
          modules[row][col] = dark;
        }
      }
    }
    upward = !upward;
  }
}

function maskCondition(mask: number, r: number, c: number): boolean {
  switch (mask) {
    case 0: return (r + c) % 2 === 0;
    case 1: return r % 2 === 0;
    case 2: return c % 3 === 0;
    case 3: return (r + c) % 3 === 0;
    case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
    case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
    case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
    default: return false;
  }
}

function applyMask(modules: boolean[][], isFunction: boolean[][], mask: number): boolean[][] {
  const size = modules.length;
  return modules.map((row, r) =>
    row.map((val, c) => (!isFunction[r][c] && maskCondition(mask, r, c) ? !val : val))
  );
}

function computeFormatBits(mask: number): number {
  // EC Level M = 00
  const data = (0b00 << 3) | mask;
  let rem = data << 10;
  const poly = 0b10100110111;
  for (let i = 4; i >= 0; i--) {
    if ((rem >>> (i + 10)) & 1) {
      rem ^= poly << i;
    }
  }
  return ((data << 10) | rem) ^ 0x5412;
}

function writeFormatBits(modules: boolean[][], mask: number) {
  const size = modules.length;
  const bits = computeFormatBits(mask);

  // Around top-left finder
  for (let i = 0; i <= 5; i++) {
    modules[8][i] = ((bits >>> (14 - i)) & 1) === 1;
  }
  modules[8][7] = ((bits >>> 8) & 1) === 1;
  modules[8][8] = ((bits >>> 7) & 1) === 1;
  modules[7][8] = ((bits >>> 6) & 1) === 1;
  for (let i = 0; i <= 5; i++) {
    modules[5 - i][8] = ((bits >>> (5 - i)) & 1) === 1;
  }

  // Top-right & bottom-left
  for (let i = 0; i < 8; i++) {
    modules[8][size - 1 - i] = ((bits >>> i) & 1) === 1;
  }
  for (let i = 0; i < 7; i++) {
    modules[size - 1 - i][8] = ((bits >>> (14 - i)) & 1) === 1;
  }
}

function writeVersionBits(modules: boolean[][], version: number) {
  if (version < 7) return;
  const size = modules.length;
  let rem = version << 12;
  const poly = 0b1111100100101;
  for (let i = 5; i >= 0; i--) {
    if ((rem >>> (i + 12)) & 1) {
      rem ^= poly << i;
    }
  }
  const bits = (version << 12) | rem;
  for (let i = 0; i < 18; i++) {
    const dark = ((bits >>> i) & 1) === 1;
    const row = Math.floor(i / 3);
    const col = size - 11 + (i % 3);
    modules[row][col] = dark;
    modules[col][row] = dark;
  }
}

function computePenalty(modules: boolean[][]): number {
  const size = modules.length;
  let penalty = 0;

  // Rule 1: 5+ consecutive same-color modules in row/col
  for (let r = 0; r < size; r++) {
    let runColor = modules[r][0];
    let runLen = 1;
    for (let c = 1; c < size; c++) {
      if (modules[r][c] === runColor) {
        runLen++;
      } else {
        if (runLen >= 5) penalty += 3 + (runLen - 5);
        runColor = modules[r][c];
        runLen = 1;
      }
    }
    if (runLen >= 5) penalty += 3 + (runLen - 5);
  }
  for (let c = 0; c < size; c++) {
    let runColor = modules[0][c];
    let runLen = 1;
    for (let r = 1; r < size; r++) {
      if (modules[r][c] === runColor) {
        runLen++;
      } else {
        if (runLen >= 5) penalty += 3 + (runLen - 5);
        runColor = modules[r][c];
        runLen = 1;
      }
    }
    if (runLen >= 5) penalty += 3 + (runLen - 5);
  }

  // Rule 2: 2x2 blocks of same color
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const color = modules[r][c];
      if (
        modules[r][c + 1] === color &&
        modules[r + 1][c] === color &&
        modules[r + 1][c + 1] === color
      ) {
        penalty += 3;
      }
    }
  }

  // Rule 3: Finder-like 1:1:3:1:1 patterns
  const matchPattern = (line: boolean[], start: number) => {
    const p1 = [true, false, true, true, true, false, true, false, false, false, false];
    const p2 = [false, false, false, false, true, false, true, true, true, false, true];
    let m1 = true;
    let m2 = true;
    for (let k = 0; k < 11; k++) {
      if (line[start + k] !== p1[k]) m1 = false;
      if (line[start + k] !== p2[k]) m2 = false;
    }
    return m1 || m2;
  };
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - 11; c++) {
      if (matchPattern(modules[r], c)) penalty += 40;
    }
  }
  for (let c = 0; c < size; c++) {
    const colArr = modules.map((row) => row[c]);
    for (let r = 0; r <= size - 11; r++) {
      if (matchPattern(colArr, r)) penalty += 40;
    }
  }

  // Rule 4: Dark module ratio
  let darkCount = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (modules[r][c]) darkCount++;
    }
  }
  const total = size * size;
  const k = Math.floor(Math.abs(darkCount * 20 - total * 10) / total);
  penalty += k * 10;

  return penalty;
}

/**
 * Generates an ISO/IEC 18004 QR Code matrix for the given UTF-8 string.
 * Returns a square 2D boolean array where `true` represents a dark module.
 */
export function generateQrMatrix(text: string): boolean[][] {
  const bytes = new TextEncoder().encode(text);
  const spec = selectVersion(bytes.length);
  const dataCodewords = encodeDataCodewords(bytes, spec);
  const finalCodewords = buildFinalCodewords(dataCodewords, spec);

  const size = spec.version * 4 + 17;
  const { modules, isFunction } = createMatrix(size);

  drawFunctionPatterns(modules, isFunction, spec);
  placeDataBits(modules, isFunction, finalCodewords);

  let bestMask = 0;
  let bestPenalty = Infinity;
  let bestMatrix = modules;

  for (let mask = 0; mask < 8; mask++) {
    const candidate = applyMask(modules, isFunction, mask);
    writeFormatBits(candidate, mask);
    writeVersionBits(candidate, spec.version);
    const penalty = computePenalty(candidate);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMask = mask;
      bestMatrix = candidate;
    }
  }

  writeFormatBits(bestMatrix, bestMask);
  writeVersionBits(bestMatrix, spec.version);
  return bestMatrix;
}
