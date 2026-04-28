const BV_REGEX = /BV[a-zA-Z0-9]{10}/;
const BILIBILI_URL_REGEX = /bilibili\.com\/video\/(BV[a-zA-Z0-9]{10})/;

export function extractBvid(input: string): string | null {
  const trimmed = input.trim();

  const urlMatch = trimmed.match(BILIBILI_URL_REGEX);
  if (urlMatch) return urlMatch[1];

  const bvMatch = trimmed.match(BV_REGEX);
  if (bvMatch) return bvMatch[0];

  return null;
}

export function isValidBvid(bvid: string): boolean {
  return BV_REGEX.test(bvid);
}
