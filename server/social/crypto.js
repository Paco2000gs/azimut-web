/* eslint-env node */
import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Tokens at rest: AES-256-GCM with a fresh 12-byte IV per value.
 * Stored as base64(iv | authTag | ciphertext) so one text column holds it all.
 */

const keyFrom = (b64) => {
    const key = Buffer.from(b64 || '', 'base64');
    if (key.length !== 32) {
        throw new Error('SOCIAL_TOKEN_ENC_KEY must be 32 bytes encoded in base64');
    }
    return key;
};

export const encrypt = (plaintext, keyB64) => {
    if (plaintext == null) return null;
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', keyFrom(keyB64), iv);
    const data = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64');
};

export const decrypt = (payload, keyB64) => {
    if (!payload) return null;
    const raw = Buffer.from(payload, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', keyFrom(keyB64), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8');
};

/** Constant-time string comparison (shared secrets, signatures). */
export const safeEqual = (a, b) => {
    const x = Buffer.from(String(a || ''));
    const y = Buffer.from(String(b || ''));
    return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
};

const b64url = (buf) => Buffer.from(buf).toString('base64url');

/**
 * OAuth `state`: a signed, short-lived token so the callback can trust which
 * network and which admin started the flow, without a server-side session.
 */
export const signState = (data, secret, ttlSeconds = 600, now = Date.now()) => {
    if (!secret) throw new Error('OAUTH_STATE_SECRET is not configured');
    const body = b64url(JSON.stringify({ ...data, exp: Math.floor(now / 1000) + ttlSeconds, n: b64url(randomBytes(8)) }));
    const sig = b64url(createHmac('sha256', secret).update(body).digest());
    return `${body}.${sig}`;
};

export const verifyState = (state, secret, now = Date.now()) => {
    const [body, sig] = String(state || '').split('.');
    if (!body || !sig || !secret) return null;
    const expected = b64url(createHmac('sha256', secret).update(body).digest());
    if (!safeEqual(sig, expected)) return null;
    try {
        const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
        if (!data.exp || data.exp < Math.floor(now / 1000)) return null;
        return data;
    } catch {
        return null;
    }
};
