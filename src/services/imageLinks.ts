// يحوّل رابط مشاركة صورة من Google Drive إلى رابط صورة يُعرض مباشرة في الموقع
// (روابط Drive العادية تفتح صفحة، لا صورة). بقية الروابط تبقى كما هي.
export const imgSrc = (url?: string): string => {
  const u = String(url || '').trim();
  if (!u) return '';
  const m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/) || u.match(/docs\.google\.com\/uc\?.*id=([\w-]{10,})/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1200` : u;
};
