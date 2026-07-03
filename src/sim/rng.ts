// Deterministic hashing so the world is stable for a given seed:
// the same chunk always generates the same roads.

export function hash2(x: number, y: number, salt: number): number {
  let h = (salt ^ Math.imul(x, 374761393) ^ Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
