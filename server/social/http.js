/* eslint-env node */

/** Error carrying the HTTP status and the platform's own error body. */
export class HttpError extends Error {
    constructor(message, { status = 0, body = null, retryable = false } = {}) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
        this.body = body;
        this.retryable = retryable;
    }
}

const isRetryable = (status) => status === 429 || status >= 500;

const readBody = async (res) => {
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
};

/**
 * fetch + JSON with retries on 429/5xx/network errors (1s, 4s, 16s by default).
 * 4xx are never retried: repeating a rejected post only gets the same answer,
 * or worse, a duplicate.
 *
 * Returns { status, headers, body }.
 */
export const request = async (fetchImpl, url, init = {}, opts = {}) => {
    const { retries = 3, baseDelayMs = 1000, sleep = (ms) => new Promise(r => setTimeout(r, ms)), label = url } = opts;
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
        if (attempt > 0) await sleep(baseDelayMs * 4 ** (attempt - 1));
        let res;
        try {
            res = await fetchImpl(url, init);
        } catch (err) {
            lastError = new HttpError(`${label}: ${err.message}`, { retryable: true });
            continue;
        }
        const body = await readBody(res);
        if (res.ok) return { status: res.status, headers: res.headers, body };
        lastError = new HttpError(`${label}: HTTP ${res.status} ${summarize(body)}`, {
            status: res.status, body, retryable: isRetryable(res.status),
        });
        if (!lastError.retryable) break;
    }
    throw lastError;
};

const summarize = (body) => {
    if (!body) return '';
    if (typeof body === 'string') return body.slice(0, 300);
    const msg = body.error?.message || body.message || body.error_description || body.error;
    return typeof msg === 'string' ? msg.slice(0, 300) : JSON.stringify(body).slice(0, 300);
};

/** Download a public file as bytes (images/videos we host ourselves). */
export const download = async (fetchImpl, url) => {
    const res = await fetchImpl(url);
    if (!res.ok) throw new HttpError(`download ${url}: HTTP ${res.status}`, { status: res.status, retryable: isRetryable(res.status) });
    return {
        bytes: Buffer.from(await res.arrayBuffer()),
        contentType: res.headers.get('content-type') || 'application/octet-stream',
    };
};

export const form = (obj) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined && v !== null) params.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
    }
    return params;
};
