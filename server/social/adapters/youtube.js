/* eslint-env node */
import { LIMITS } from '../limits.js';
import { composeText } from '../text.js';
import { request, download, form, HttpError } from '../http.js';
import { validateCommon } from './common.js';

const UPLOAD = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet%2Cstatus';
// 22 = People & Blogs. Editorial choice; YouTube has no real-estate category.
const CATEGORY_ID = '22';

const videoResource = (draft, privacyStatus, { short = false } = {}) => ({
    snippet: {
        title: short ? draft.title.slice(0, 100) : draft.title,
        description: composeText('youtube', draft),
        tags: draft.hashtags,
        categoryId: CATEGORY_ID,
        defaultLanguage: 'es',
    },
    status: {
        privacyStatus,
        selfDeclaredMadeForKids: false,
        containsSyntheticMedia: false,
    },
});

/** Exchange the stored refresh token for a 1-hour access token. */
export const refreshGoogleToken = async (fetchImpl, config, refreshToken, sleep) => {
    const res = await request(fetchImpl, 'https://oauth2.googleapis.com/token', {
        method: 'POST',
        body: form({
            client_id: config.google.clientId,
            client_secret: config.google.clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
    }, { sleep, label: 'google token refresh' });
    if (!res.body?.access_token) throw new Error('Google no devolvió access_token');
    return res.body.access_token;
};

/** Resumable upload: POST the metadata, then PUT the bytes to the session URI. */
const upload = async (fetchImpl, token, videoUrl, resource, sleep) => {
    const file = await download(fetchImpl, videoUrl);
    const session = await request(fetchImpl, UPLOAD, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Upload-Content-Length': String(file.bytes.length),
            'X-Upload-Content-Type': 'video/mp4',
        },
        body: JSON.stringify(resource),
    }, { sleep, label: 'youtube upload session' });
    const location = session.headers.get('location');
    if (!location) throw new Error('YouTube no devolvió la URI de subida (Location)');
    const res = await request(fetchImpl, location, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'video/mp4', 'Content-Length': String(file.bytes.length) },
        body: file.bytes,
    }, { sleep, label: 'youtube upload', retries: 0 });
    if (!res.body?.id) throw new Error('YouTube no devolvió el id del vídeo');
    return res.body;
};

/**
 * Two uploads per property: the 16:9 video and the 9:16 Short. If the second
 * one fails, the first one's id travels on the error (`partial`) so a retry
 * resumes instead of uploading a duplicate.
 */
export const youtube = {
    network: 'youtube',
    limits: LIMITS.youtube,

    validate(draft) {
        return validateCommon('youtube', draft);
    },

    buildPayload(draft, account, config) {
        const privacy = config.google.youtubePrivacy;
        return {
            network: 'youtube',
            uploads: [
                { kind: 'video', source: draft.video?.video_url, request: { method: 'POST', url: UPLOAD, body: videoResource(draft, privacy) } },
                { kind: 'short', source: draft.video?.short_url, request: { method: 'POST', url: UPLOAD, body: videoResource(draft, privacy, { short: true }) } },
            ],
        };
    },

    async publish(draft, account, { fetch: fetchImpl, config, sleep }) {
        const token = await refreshGoogleToken(fetchImpl, config, account.refresh_token, sleep);
        const privacy = config.google.youtubePrivacy;
        const extra = { ...(draft.external_extra || {}) };

        let main = draft.external_id ? { id: draft.external_id, status: { privacyStatus: extra.privacy } } : null;
        if (!main) {
            main = await upload(fetchImpl, token, draft.video.video_url, videoResource(draft, privacy), sleep);
            extra.privacy = main.status?.privacyStatus;
        }

        try {
            if (!extra.short_id) {
                const short = await upload(fetchImpl, token, draft.video.short_url, videoResource(draft, privacy, { short: true }), sleep);
                extra.short_id = short.id;
                extra.short_url = `https://www.youtube.com/shorts/${short.id}`;
                extra.short_privacy = short.status?.privacyStatus;
            }
        } catch (err) {
            const wrapped = new HttpError(`Vídeo subido, pero el Short falló: ${err.message}`, { status: err.status, body: err.body });
            wrapped.partial = { externalId: main.id, externalUrl: `https://www.youtube.com/watch?v=${main.id}`, extra };
            throw wrapped;
        }

        // An unverified Google app may have its uploads forced to private.
        // Report it instead of claiming a public video that nobody can see.
        const forced = [extra.privacy, extra.short_privacy].some(p => p && p !== privacy);
        if (forced) extra.warning = `YouTube dejó el vídeo como "${extra.privacy}" / Short "${extra.short_privacy}" (pedido: "${privacy}"). Posible restricción por app de Google no verificada.`;

        return {
            externalId: main.id,
            externalUrl: `https://www.youtube.com/watch?v=${main.id}`,
            extra,
            payload: { video: videoResource(draft, privacy), short: videoResource(draft, privacy, { short: true }) },
        };
    },
};
