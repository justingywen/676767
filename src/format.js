// 1 台斤 = 600 公克 = 16 兩。先取到 0.1 兩，再拆分，避免顯示 16 兩。
export function formatFishWeight(grams) {
  const tenths = Math.round(grams / 37.5 * 10);
  const catties = Math.floor(tenths / 160);
  const taels = (tenths % 160) / 10;
  return catties > 0 ? `${catties} 台斤 ${taels} 兩` : `${taels} 兩`;
}
