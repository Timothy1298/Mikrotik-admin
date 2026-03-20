type QrModule = boolean | null;

const PAD0 = 0xec;
const PAD1 = 0x11;
const VERSION = 8;
const ERROR_CORRECTION_LEVEL = 1; // L
const RS_BLOCKS = [
  { totalCount: 121, dataCount: 97 },
  { totalCount: 121, dataCount: 97 },
];
const G15 = 0b10100110111;
const G18 = 0b1111100100101;
const G15_MASK = 0b101010000010010;

const QRMath = (() => {
  const expTable = new Array<number>(256);
  const logTable = new Array<number>(256);

  for (let i = 0; i < 8; i += 1) expTable[i] = 1 << i;
  for (let i = 8; i < 256; i += 1) {
    expTable[i] = expTable[i - 4] ^ expTable[i - 5] ^ expTable[i - 6] ^ expTable[i - 8];
  }
  for (let i = 0; i < 255; i += 1) {
    logTable[expTable[i]] = i;
  }

  return {
    glog(n: number) {
      if (n < 1) throw new Error(`glog(${n})`);
      return logTable[n];
    },
    gexp(n: number) {
      let value = n;
      while (value < 0) value += 255;
      while (value >= 256) value -= 255;
      return expTable[value];
    },
  };
})();

class BitBuffer {
  buffer: number[] = [];

  length = 0;

  put(num: number, length: number) {
    for (let i = 0; i < length; i += 1) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  putBit(bit: boolean) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) this.buffer.push(0);
    if (bit) this.buffer[bufIndex] |= 0x80 >>> this.length % 8;
    this.length += 1;
  }
}

class QrPolynomial {
  num: number[];

  constructor(num: number[], shift = 0) {
    let offset = 0;
    while (offset < num.length && num[offset] === 0) offset += 1;
    this.num = new Array(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i += 1) {
      this.num[i] = num[i + offset];
    }
    for (let i = num.length - offset; i < this.num.length; i += 1) {
      this.num[i] = 0;
    }
  }

  get(index: number) {
    return this.num[index];
  }

  getLength() {
    return this.num.length;
  }

  multiply(other: QrPolynomial) {
    const num = new Array(this.getLength() + other.getLength() - 1).fill(0);
    for (let i = 0; i < this.getLength(); i += 1) {
      for (let j = 0; j < other.getLength(); j += 1) {
        num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(other.get(j)));
      }
    }
    return new QrPolynomial(num);
  }

  mod(other: QrPolynomial): QrPolynomial {
    if (this.getLength() - other.getLength() < 0) return this;

    const ratio = QRMath.glog(this.get(0)) - QRMath.glog(other.get(0));
    const num = this.num.slice();

    for (let i = 0; i < other.getLength(); i += 1) {
      num[i] ^= QRMath.gexp(QRMath.glog(other.get(i)) + ratio);
    }

    return new QrPolynomial(num).mod(other);
  }
}

function getBchDigit(data: number) {
  let digit = 0;
  let value = data;
  while (value !== 0) {
    digit += 1;
    value >>>= 1;
  }
  return digit;
}

function getBchTypeInfo(data: number) {
  let d = data << 10;
  while (getBchDigit(d) - getBchDigit(G15) >= 0) {
    d ^= G15 << (getBchDigit(d) - getBchDigit(G15));
  }
  return ((data << 10) | d) ^ G15_MASK;
}

function getBchTypeNumber(data: number) {
  let d = data << 12;
  while (getBchDigit(d) - getBchDigit(G18) >= 0) {
    d ^= G18 << (getBchDigit(d) - getBchDigit(G18));
  }
  return (data << 12) | d;
}

function getErrorCorrectPolynomial(errorCorrectLength: number) {
  let a = new QrPolynomial([1]);
  for (let i = 0; i < errorCorrectLength; i += 1) {
    a = a.multiply(new QrPolynomial([1, QRMath.gexp(i)]));
  }
  return a;
}

function getMask(maskPattern: number, row: number, col: number) {
  switch (maskPattern) {
    case 0: return (row + col) % 2 === 0;
    case 1: return row % 2 === 0;
    case 2: return col % 3 === 0;
    case 3: return (row + col) % 3 === 0;
    case 4: return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
    case 5: return ((row * col) % 2) + ((row * col) % 3) === 0;
    case 6: return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
    case 7: return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
    default: throw new Error(`bad maskPattern:${maskPattern}`);
  }
}

function getLostPoint(modules: boolean[][]) {
  const moduleCount = modules.length;
  let lostPoint = 0;

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      const dark = modules[row][col];
      let sameCount = 0;

      for (let r = -1; r <= 1; r += 1) {
        if (row + r < 0 || moduleCount <= row + r) continue;
        for (let c = -1; c <= 1; c += 1) {
          if (col + c < 0 || moduleCount <= col + c) continue;
          if (r === 0 && c === 0) continue;
          if (dark === modules[row + r][col + c]) sameCount += 1;
        }
      }
      if (sameCount > 5) lostPoint += 3 + sameCount - 5;
    }
  }

  for (let row = 0; row < moduleCount - 1; row += 1) {
    for (let col = 0; col < moduleCount - 1; col += 1) {
      const count =
        (modules[row][col] ? 1 : 0) +
        (modules[row + 1][col] ? 1 : 0) +
        (modules[row][col + 1] ? 1 : 0) +
        (modules[row + 1][col + 1] ? 1 : 0);
      if (count === 0 || count === 4) lostPoint += 3;
    }
  }

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount - 6; col += 1) {
      if (
        modules[row][col] &&
        !modules[row][col + 1] &&
        modules[row][col + 2] &&
        modules[row][col + 3] &&
        modules[row][col + 4] &&
        !modules[row][col + 5] &&
        modules[row][col + 6]
      ) {
        lostPoint += 40;
      }
    }
  }

  for (let col = 0; col < moduleCount; col += 1) {
    for (let row = 0; row < moduleCount - 6; row += 1) {
      if (
        modules[row][col] &&
        !modules[row + 1][col] &&
        modules[row + 2][col] &&
        modules[row + 3][col] &&
        modules[row + 4][col] &&
        !modules[row + 5][col] &&
        modules[row + 6][col]
      ) {
        lostPoint += 40;
      }
    }
  }

  let darkCount = 0;
  for (let col = 0; col < moduleCount; col += 1) {
    for (let row = 0; row < moduleCount; row += 1) {
      if (modules[row][col]) darkCount += 1;
    }
  }

  const ratio = Math.abs((100 * darkCount) / moduleCount / moduleCount - 50) / 5;
  lostPoint += ratio * 10;

  return lostPoint;
}

function setupPositionProbePattern(modules: QrModule[][], row: number, col: number) {
  for (let r = -1; r <= 7; r += 1) {
    if (row + r <= -1 || modules.length <= row + r) continue;
    for (let c = -1; c <= 7; c += 1) {
      if (col + c <= -1 || modules.length <= col + c) continue;
      if (
        (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
        (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
        (2 <= r && r <= 4 && 2 <= c && c <= 4)
      ) {
        modules[row + r][col + c] = true;
      } else {
        modules[row + r][col + c] = false;
      }
    }
  }
}

function setupTimingPattern(modules: QrModule[][]) {
  for (let r = 8; r < modules.length - 8; r += 1) {
    if (modules[r][6] !== null) continue;
    modules[r][6] = r % 2 === 0;
  }
  for (let c = 8; c < modules.length - 8; c += 1) {
    if (modules[6][c] !== null) continue;
    modules[6][c] = c % 2 === 0;
  }
}

function getPatternPosition(version: number) {
  if (version === 8) return [6, 24, 42];
  throw new Error(`Unsupported QR version ${version}`);
}

function setupPositionAdjustPattern(modules: QrModule[][], version: number) {
  const pos = getPatternPosition(version);
  for (let i = 0; i < pos.length; i += 1) {
    for (let j = 0; j < pos.length; j += 1) {
      const row = pos[i];
      const col = pos[j];
      if (modules[row][col] !== null) continue;

      for (let r = -2; r <= 2; r += 1) {
        for (let c = -2; c <= 2; c += 1) {
          if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
            modules[row + r][col + c] = true;
          } else {
            modules[row + r][col + c] = false;
          }
        }
      }
    }
  }
}

function setupTypeNumber(modules: QrModule[][], version: number) {
  const bits = getBchTypeNumber(version);

  for (let i = 0; i < 18; i += 1) {
    const mod = !(((bits >> i) & 1) === 1);
    modules[Math.floor(i / 3)][(i % 3) + modules.length - 8 - 3] = mod;
  }

  for (let i = 0; i < 18; i += 1) {
    const mod = !(((bits >> i) & 1) === 1);
    modules[(i % 3) + modules.length - 8 - 3][Math.floor(i / 3)] = mod;
  }
}

function setupTypeInfo(modules: QrModule[][], maskPattern: number) {
  const data = (ERROR_CORRECTION_LEVEL << 3) | maskPattern;
  const bits = getBchTypeInfo(data);

  for (let i = 0; i < 15; i += 1) {
    const mod = !(((bits >> i) & 1) === 1);
    if (i < 6) modules[i][8] = mod;
    else if (i < 8) modules[i + 1][8] = mod;
    else modules[modules.length - 15 + i][8] = mod;
  }

  for (let i = 0; i < 15; i += 1) {
    const mod = !(((bits >> i) & 1) === 1);
    if (i < 8) modules[8][modules.length - i - 1] = mod;
    else if (i < 9) modules[8][15 - i - 1 + 1] = mod;
    else modules[8][15 - i - 1] = mod;
  }

  modules[modules.length - 8][8] = true;
}

function createData(data: string) {
  const buffer = new BitBuffer();
  const bytes = new TextEncoder().encode(data);
  const totalDataCount = RS_BLOCKS.reduce((sum, block) => sum + block.dataCount, 0);

  buffer.put(4, 4);
  buffer.put(bytes.length, 8);
  for (const byte of bytes) buffer.put(byte, 8);

  if (buffer.length + 4 <= totalDataCount * 8) {
    buffer.put(0, 4);
  }

  while (buffer.length % 8 !== 0) {
    buffer.putBit(false);
  }

  while (buffer.buffer.length < totalDataCount) {
    buffer.put(PAD0, 8);
    if (buffer.buffer.length >= totalDataCount) break;
    buffer.put(PAD1, 8);
  }

  return createBytes(buffer.buffer);
}

function createBytes(buffer: number[]) {
  let offset = 0;
  let maxDcCount = 0;
  let maxEcCount = 0;
  const dcdata: number[][] = [];
  const ecdata: number[][] = [];

  for (let r = 0; r < RS_BLOCKS.length; r += 1) {
    const dcCount = RS_BLOCKS[r].dataCount;
    const ecCount = RS_BLOCKS[r].totalCount - dcCount;
    maxDcCount = Math.max(maxDcCount, dcCount);
    maxEcCount = Math.max(maxEcCount, ecCount);

    dcdata[r] = new Array(dcCount);
    for (let i = 0; i < dcdata[r].length; i += 1) {
      dcdata[r][i] = buffer[i + offset];
    }
    offset += dcCount;

    const rsPoly = getErrorCorrectPolynomial(ecCount);
    const rawPoly = new QrPolynomial(dcdata[r], rsPoly.getLength() - 1);
    const modPoly = rawPoly.mod(rsPoly);

    ecdata[r] = new Array(rsPoly.getLength() - 1);
    for (let i = 0; i < ecdata[r].length; i += 1) {
      const modIndex = i + modPoly.getLength() - ecdata[r].length;
      ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
    }
  }

  const totalCodeCount = RS_BLOCKS.reduce((sum, block) => sum + block.totalCount, 0);
  const data = new Array<number>(totalCodeCount);
  let index = 0;

  for (let i = 0; i < maxDcCount; i += 1) {
    for (let r = 0; r < RS_BLOCKS.length; r += 1) {
      if (i < dcdata[r].length) data[index++] = dcdata[r][i];
    }
  }

  for (let i = 0; i < maxEcCount; i += 1) {
    for (let r = 0; r < RS_BLOCKS.length; r += 1) {
      if (i < ecdata[r].length) data[index++] = ecdata[r][i];
    }
  }

  return data;
}

function mapData(modules: QrModule[][], data: number[], maskPattern: number) {
  let inc = -1;
  let row = modules.length - 1;
  let bitIndex = 7;
  let byteIndex = 0;

  for (let col = modules.length - 1; col > 0; col -= 2) {
    if (col === 6) col -= 1;

    while (true) {
      for (let c = 0; c < 2; c += 1) {
        if (modules[row][col - c] === null) {
          let dark = false;
          if (byteIndex < data.length) {
            dark = (((data[byteIndex] >>> bitIndex) & 1) === 1);
          }
          const mask = getMask(maskPattern, row, col - c);
          if (mask) dark = !dark;
          modules[row][col - c] = dark;
          bitIndex -= 1;
          if (bitIndex === -1) {
            byteIndex += 1;
            bitIndex = 7;
          }
        }
      }

      row += inc;
      if (row < 0 || modules.length <= row) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
  }
}

function makeMatrix(data: string, maskPattern: number) {
  const moduleCount = VERSION * 4 + 17;
  const modules: QrModule[][] = Array.from({ length: moduleCount }, () => Array.from({ length: moduleCount }, () => null));

  setupPositionProbePattern(modules, 0, 0);
  setupPositionProbePattern(modules, moduleCount - 7, 0);
  setupPositionProbePattern(modules, 0, moduleCount - 7);
  setupPositionAdjustPattern(modules, VERSION);
  setupTimingPattern(modules);
  setupTypeInfo(modules, maskPattern);
  setupTypeNumber(modules, VERSION);

  const bytes = createData(data);
  mapData(modules, bytes, maskPattern);

  return modules as boolean[][];
}

function getBestMaskPattern(data: string) {
  let minLostPoint = 0;
  let pattern = 0;

  for (let i = 0; i < 8; i += 1) {
    const modules = makeMatrix(data, i);
    const lostPoint = getLostPoint(modules);
    if (i === 0 || minLostPoint > lostPoint) {
      minLostPoint = lostPoint;
      pattern = i;
    }
  }

  return pattern;
}

export function generateQrSvgDataUrl(data: string, options?: { cellSize?: number; margin?: number; darkColor?: string; lightColor?: string }) {
  const cellSize = options?.cellSize ?? 5;
  const margin = options?.margin ?? 4;
  const darkColor = options?.darkColor ?? "#f8fafc";
  const lightColor = options?.lightColor ?? "transparent";

  const maskPattern = getBestMaskPattern(data);
  const modules = makeMatrix(data, maskPattern);
  const moduleCount = modules.length;
  const size = (moduleCount + margin * 2) * cellSize;
  const rects: string[] = [];

  if (lightColor !== "transparent") {
    rects.push(`<rect width="${size}" height="${size}" fill="${lightColor}" />`);
  }

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (!modules[row][col]) continue;
      rects.push(
        `<rect x="${(col + margin) * cellSize}" y="${(row + margin) * cellSize}" width="${cellSize}" height="${cellSize}" fill="${darkColor}" />`,
      );
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${rects.join("")}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
