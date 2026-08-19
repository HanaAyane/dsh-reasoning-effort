import fs from 'node:fs';
import zlib from 'node:zlib';

function decodePNG(buf) {
  let pos = 8;
  let width, height;
  const idatChunks = [];
  while (pos < buf.length) {
    const length = buf.readUInt32BE(pos);
    const type = buf.subarray(pos + 4, pos + 8).toString('ascii');
    const data = buf.subarray(pos + 8, pos + 8 + length);
    pos += 12 + length;
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    }
  }
  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const bpp = 4;
  const stride = width * bpp;
  const image = Buffer.alloc(width * height * 4);
  let rawOffset = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[rawOffset++];
    const lineStart = y * stride;
    for (let x = 0; x < stride; x++) {
      const b = raw[rawOffset++];
      let a = 0, b_up = 0, c = 0;
      if (x >= bpp) a = image[lineStart + x - bpp];
      if (y > 0) b_up = image[(y - 1) * stride + x];
      if (x >= bpp && y > 0) c = image[(y - 1) * stride + x - bpp];
      let val = 0;
      if (filter === 0) val = b;
      else if (filter === 1) val = (b + a) & 0xff;
      else if (filter === 2) val = (b + b_up) & 0xff;
      else if (filter === 3) val = (b + Math.floor((a + b_up) / 2)) & 0xff;
      else if (filter === 4) {
        const p = a + b_up - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b_up);
        const pc = Math.abs(p - c);
        let pr = c;
        if (pa <= pb && pa <= pc) pr = a;
        else if (pb <= pc) pr = b_up;
        val = (b + pr) & 0xff;
      }
      image[lineStart + x] = val;
    }
  }
  return { width, height, data: image };
}

function encodePNG(width, height, data) {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  let rawOffset = 0;
  for (let y = 0; y < height; y++) {
    raw[rawOffset++] = 0;
    data.copy(raw, rawOffset, y * stride, (y + 1) * stride);
    rawOffset += stride;
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  function makeChunk(type, chunkData) {
    const len = chunkData.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    chunkData.copy(buf, 8);
    const crc = calcCRC(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c >>> 0;
  }

  function calcCRC(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdrData),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function removeStrayArtifacts(strip) {
  const cellW = 288;
  for (let f = 0; f < 8; f++) {
    const left = f * cellW;
    const right = (f + 1) * cellW;
    const w = 288;
    const visited = new Uint8Array(w * strip.height);
    const comps = [];

    for (let y = 0; y < strip.height; y++) {
      for (let rx = 0; rx < w; rx++) {
        const gx = left + rx;
        const idx = y * w + rx;
        const gidx = y * strip.width + gx;
        if (visited[idx] || strip.data[gidx * 4 + 3] === 0) continue;

        const q = [idx];
        visited[idx] = 1;
        let head = 0;
        while (head < q.length) {
          const curr = q[head++];
          const cy = Math.floor(curr / w);
          const cx = curr % w;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (!dx && !dy) continue;
              const nx = cx + dx, ny = cy + dy;
              if (nx >= 0 && nx < w && ny >= 0 && ny < strip.height) {
                const nidx = ny * w + nx;
                const gnidx = ny * strip.width + (left + nx);
                if (!visited[nidx] && strip.data[gnidx * 4 + 3] > 0) {
                  visited[nidx] = 1;
                  q.push(nidx);
                }
              }
            }
          }
        }
        comps.push({ count: q.length, pixels: q });
      }
    }

    comps.sort((a, b) => b.count - a.count);
    for (let i = 1; i < comps.length; i++) {
      for (const p of comps[i].pixels) {
        const cy = Math.floor(p / w);
        const cx = p % w;
        const gidx = (cy * strip.width + (left + cx)) * 4;
        strip.data[gidx] = 0;
        strip.data[gidx + 1] = 0;
        strip.data[gidx + 2] = 0;
        strip.data[gidx + 3] = 0;
      }
    }
  }
}

const rawSrc = fs.readFileSync('C:/Users/15528/.dsh/attachments/v1/objects/88/8805b6fe7c8b2915635398ec68d11f3d6b6881620c5efb3115c7901d4c8143d5');
const srcImg = decodePNG(rawSrc);

console.log('Qwen Raw Dimensions:', srcImg.width, 'x', srcImg.height);

// 1. Precise 2D Geodesic Multi-Source Segmentation
const seeds = [
  { f: 0, x: 180, y: 316 },
  { f: 1, x: 468, y: 322 },
  { f: 2, x: 755, y: 316 },
  { f: 3, x: 1041, y: 322 },
  { f: 4, x: 1317, y: 327 },
  { f: 5, x: 1586, y: 322 },
  { f: 6, x: 1855, y: 322 },
  { f: 7, x: 2085, y: 324 },
];

const frameMask = new Int8Array(srcImg.width * srcImg.height).fill(-1);
const dist = new Float32Array(srcImg.width * srcImg.height).fill(1e9);
const queue = [];

for (const s of seeds) {
  const idx = s.y * srcImg.width + s.x;
  frameMask[idx] = s.f;
  dist[idx] = 0;
  queue.push(idx);
}

let head = 0;
while (head < queue.length) {
  const curr = queue[head++];
  const cy = Math.floor(curr / srcImg.width);
  const cx = curr % srcImg.width;
  const curDist = dist[curr];
  const curLabel = frameMask[curr];

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = cx + dx, ny = cy + dy;
      if (nx >= 0 && nx < srcImg.width && ny >= 0 && ny < srcImg.height) {
        const nidx = ny * srcImg.width + nx;
        const a = srcImg.data[nidx * 4 + 3];
        if (a > 2) {
          const stepDist = (dx !== 0 && dy !== 0) ? 1.414 : 1.0;
          if (dist[nidx] > curDist + stepDist) {
            dist[nidx] = curDist + stepDist;
            frameMask[nidx] = curLabel;
            queue.push(nidx);
          }
        }
      }
    }
  }
}

// 2. Create 8 isolated sub-images for each frame
const frameImages = [];
for (let f = 0; f < 8; f++) {
  let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
  for (let y = 0; y < srcImg.height; y++) {
    for (let x = 0; x < srcImg.width; x++) {
      const idx = y * srcImg.width + x;
      if (frameMask[idx] === f) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const subData = Buffer.alloc(w * h * 4);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const srcIdx = y * srcImg.width + x;
      if (frameMask[srcIdx] === f) {
        const dstIdx = ((y - minY) * w + (x - minX)) * 4;
        subData[dstIdx] = srcImg.data[srcIdx * 4];
        subData[dstIdx + 1] = srcImg.data[srcIdx * 4 + 1];
        subData[dstIdx + 2] = srcImg.data[srcIdx * 4 + 2];
        subData[dstIdx + 3] = srcImg.data[srcIdx * 4 + 3];
      }
    }
  }

  frameImages.push({
    frameIndex: f,
    minX, maxX, minY, maxY,
    width: w, height: h,
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    feetY: maxY,
    data: subData,
  });
}

// 3. Render onto target strip 2304 x 395
const targetW = 2304;
const targetH = 395;
const targetData = Buffer.alloc(targetW * targetH * 4);

const scale = 0.83;
const targetCenterY = 197.5;
const cellWidth = 288;

for (let f = 0; f < 8; f++) {
  const fi = frameImages[f];
  const cellLeft = f * cellWidth;
  const cellRight = (f + 1) * cellWidth;
  const tcx = cellLeft + 144.0;
  const tcy = targetCenterY;

  for (let ty = 0; ty < targetH; ty++) {
    const syRel = (ty - tcy) / scale;
    const syInSub = (fi.cy - fi.minY) + syRel;

    if (syInSub < 0 || syInSub >= fi.height - 1) continue;
    const sy0 = Math.floor(syInSub);
    const sy1 = sy0 + 1;
    const fy = syInSub - sy0;

    for (let tx = cellLeft; tx < cellRight; tx++) {
      const sxRel = (tx - tcx) / scale;
      const sxInSub = (fi.cx - fi.minX) + sxRel;

      if (sxInSub < 0 || sxInSub >= fi.width - 1) continue;
      const sx0 = Math.floor(sxInSub);
      const sx1 = sx0 + 1;
      const fx = sxInSub - sx0;

      const i00 = (sy0 * fi.width + sx0) * 4;
      const i10 = (sy0 * fi.width + sx1) * 4;
      const i01 = (sy1 * fi.width + sx0) * 4;
      const i11 = (sy1 * fi.width + sx1) * 4;

      const a00 = fi.data[i00 + 3];
      const a10 = fi.data[i10 + 3];
      const a01 = fi.data[i01 + 3];
      const a11 = fi.data[i11 + 3];

      const topA = a00 * (1 - fx) + a10 * fx;
      const botA = a01 * (1 - fx) + a11 * fx;
      const alpha = Math.round(topA * (1 - fy) + botA * fy);

      if (alpha <= 2) continue;

      const outIdx = (ty * targetW + tx) * 4;

      for (let c = 0; c < 3; c++) {
        const topC = (fi.data[i00 + c] * a00) * (1 - fx) + (fi.data[i10 + c] * a10) * fx;
        const botC = (fi.data[i01 + c] * a01) * (1 - fx) + (fi.data[i11 + c] * a11) * fx;
        const colorPremul = topC * (1 - fy) + botC * fy;
        targetData[outIdx + c] = Math.min(255, Math.max(0, Math.round(colorPremul / (topA * (1 - fy) + botA * fy || 1))));
      }
      targetData[outIdx + 3] = Math.min(255, Math.max(0, alpha));
    }
  }
}

// 4. Post-filter stray islands
const resultImg = { width: targetW, height: targetH, data: targetData };
removeStrayArtifacts(resultImg);

console.log('=== Validation of Generated Qwen Target Strip ===');
for (let f = 0; f < 8; f++) {
  const left = f * cellWidth;
  const right = (f + 1) * cellWidth;
  let minX = 9999, maxX = -1, minY = 9999, maxY = -1, count = 0;
  let edgeBleed = false;

  for (let y = 0; y < targetH; y++) {
    for (let x = left; x < right; x++) {
      const a = resultImg.data[(y * targetW + x) * 4 + 3];
      if (a > 10) {
        count++;
        const relX = x - left;
        if (relX < minX) minX = relX;
        if (relX > maxX) maxX = relX;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      const relX = x - left;
      if (a > 0 && (relX < 7 || relX > 280)) {
        edgeBleed = true;
      }
    }
  }

  const marginL = minX;
  const marginR = 287 - maxX;
  const marginT = minY;
  const marginB = 394 - maxY;
  console.log(`Frame ${f}: X in cell=[${minX}, ${maxX}] (w=${maxX - minX + 1}), Y=[${minY}, ${maxY}] (h=${maxY - minY + 1}) | Margins: L=${marginL}px, R=${marginR}px, T=${marginT}px, B=${marginB}px | EdgeBleed: ${edgeBleed}`);
}

const encoded = encodePNG(targetW, targetH, resultImg.data);
fs.writeFileSync('C:/Users/15528/.dsh/plugins/dsh-reasoning-effort/assets/qwen-runner-strip.png', encoded);
console.log('Successfully saved C:/Users/15528/.dsh/plugins/dsh-reasoning-effort/assets/qwen-runner-strip.png (' + encoded.length + ' bytes)');
