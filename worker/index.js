// خادم صغير أمام ملفات الموقع: يمرّر طلبات الغرف الصوتية إلى Cloudflare Realtime (SFU)
// المفاتيح السرية تبقى هنا فقط: REALTIME_APP_ID و REALTIME_APP_TOKEN (Secrets في إعدادات الـ Worker)
// كل طلب يحتاج رمز دخول Firebase صالحًا لنفس مشروع المنصة.

const FIREBASE_PROJECT_ID = 'alert-cinema-wh5g6';
const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const RTC_BASE = 'https://rtc.live.cloudflare.com/v1/apps/';

let jwksCache = { keys: null, exp: 0 };

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

function b64urlBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const b64urlJson = (s) => JSON.parse(new TextDecoder().decode(b64urlBytes(s)));

async function getKeys(fetchImpl) {
  if (jwksCache.keys && Date.now() < jwksCache.exp) return jwksCache.keys;
  const r = await fetchImpl(JWKS_URL);
  if (!r.ok) throw new Error('jwks');
  const j = await r.json();
  const m = /max-age=(\d+)/.exec(r.headers.get('cache-control') || '');
  jwksCache = { keys: j.keys || [], exp: Date.now() + (m ? Number(m[1]) * 1000 : 3600_000) };
  return jwksCache.keys;
}

export async function verifyIdToken(token, fetchImpl = fetch, projectId = FIREBASE_PROJECT_ID) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('format');
  const header = b64urlJson(parts[0]);
  const payload = b64urlJson(parts[1]);
  if (header.alg !== 'RS256' || !header.kid) throw new Error('alg');
  const now = Math.floor(Date.now() / 1000);
  if (!(payload.exp > now) || payload.iat > now + 300) throw new Error('expired');
  if (payload.aud !== projectId || payload.iss !== 'https://securetoken.google.com/' + projectId) throw new Error('aud');
  if (!payload.sub || typeof payload.sub !== 'string') throw new Error('sub');
  const keys = await getKeys(fetchImpl);
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('kid');
  const key = await crypto.subtle.importKey(
    'jwk',
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const ok = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    b64urlBytes(parts[2]),
    new TextEncoder().encode(parts[0] + '.' + parts[1])
  );
  if (!ok) throw new Error('signature');
  return payload;
}

const OPS = {
  new: { method: 'POST', path: () => 'sessions/new', needsSession: false },
  tracks: { method: 'POST', path: (s) => `sessions/${s}/tracks/new`, needsSession: true },
  renegotiate: { method: 'PUT', path: (s) => `sessions/${s}/renegotiate`, needsSession: true },
  close: { method: 'PUT', path: (s) => `sessions/${s}/tracks/close`, needsSession: true },
};

export async function handleRtc(request, env, fetchImpl = fetch) {
  const url = new URL(request.url);
  const configured = !!(env.REALTIME_APP_ID && env.REALTIME_APP_TOKEN);

  if (url.pathname === '/api/rtc/status') return json({ configured });
  if (url.pathname !== '/api/rtc' || request.method !== 'POST') return json({ error: 'not_found' }, 404);
  if (!configured) return json({ error: 'not_configured' }, 503);

  // نفس الموقع فقط
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return json({ error: 'origin' }, 403);

  const auth = request.headers.get('authorization') || '';
  try {
    await verifyIdToken(auth.replace(/^Bearer\s+/i, ''), fetchImpl);
  } catch {
    return json({ error: 'unauthorized' }, 401);
  }

  let body;
  try {
    const text = await request.text();
    if (text.length > 200_000) return json({ error: 'too_large' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: 'bad_json' }, 400);
  }
  const op = OPS[body && body.op];
  if (!op) return json({ error: 'bad_op' }, 400);
  const sid = body.sessionId;
  if (op.needsSession && !(typeof sid === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(sid))) {
    return json({ error: 'bad_session' }, 400);
  }

  const res = await fetchImpl(RTC_BASE + encodeURIComponent(env.REALTIME_APP_ID) + '/' + op.path(sid), {
    method: op.method,
    headers: { authorization: 'Bearer ' + env.REALTIME_APP_TOKEN, 'content-type': 'application/json' },
    body: body.op === 'new' ? undefined : JSON.stringify(body.body || {}),
  });
  const out = await res.text();
  return new Response(out || '{}', {
    status: res.status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/rtc' || url.pathname.startsWith('/api/rtc/')) {
      try {
        return await handleRtc(request, env);
      } catch (e) {
        return json({ error: 'server_error' }, 500);
      }
    }
    return env.ASSETS.fetch(request);
  },
};
