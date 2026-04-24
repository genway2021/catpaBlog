import { encodeBase64Url, decodeBase64Url } from 'hono/utils/base64';

interface Header {
  alg: string;
  typ: string;
}

interface Payload {
  id: number;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
  return encodeBase64Url(binString);
}

function base64UrlDecode(str: string): string {
  const binString = decodeBase64Url(str);
  return new TextDecoder().decode(
    Uint8Array.from(binString, (byte) => byte.codePointAt(0)!)
  );
}

function sign(data: string, secret: string): string {
  const key = new TextEncoder().encode(secret);
  const message = new TextEncoder().encode(data);

  let hash = 0;
  const combined = message.toString() + secret;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return hash.toString(16).padStart(16, '0');
}

export function signToken(payload: Payload, secret: string): string {
  const header: Header = { alg: 'HS256', typ: 'JWT' };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));

  const signature = sign(`${headerEncoded}.${payloadEncoded}`, secret);
  const signatureEncoded = base64UrlEncode(signature);

  return `${headerEncoded}.${payloadEncoded}.${signatureEncoded}`;
}

export function verify(token: string, secret: string): Payload | null {
  const parts = token.split('.');

  if (parts.length !== 3) {
    return null;
  }

  const [headerEncoded, payloadEncoded, signatureEncoded] = parts;

  const expectedSignature = sign(`${headerEncoded}.${payloadEncoded}`, secret);
  const actualSignature = base64UrlDecode(signatureEncoded);

  if (expectedSignature !== actualSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as Payload;

    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
