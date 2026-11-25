/* eslint-env node */
import { LIMITS } from '../limits.js';
import { composeText } from '../text.js';
import { request, form } from '../http.js';
import { validateCommon } from './common.js';

const graph = (config) => `https://graph.facebook.com/${config.meta.graphVersion}`;

/**
 * Instagram Business carousel via the Instagram API with Facebook Login
 * (Page token): one container per image (is_carousel_item), a CAROUSEL
 * container, wait until FINISHED, then media_publish.
 * https://developers.facebook.com/docs/instagram-platform/content-publishing
 */
export const instagram = {
    network: 'instagram',
    limits: LIMITS.instagram,

    validate(draft) {
        return validateCommon('instagram', draft);
    },

    buildPayload(draft, account, config) {
        const ig = account?.account_id || '<IG_USER_ID>';
        const caption = composeText('instagram', draft);
        const single = draft.media.length === 1;
        return {
            network: 'instagram',
            containers: single
                ? [{ method: 'POST', url: `${graph(config)}/${ig}/media`, body: { image_url: draft.media[0].url, caption } }]
                : [
                    ...draft.media.map(img => ({ method: 'POST', url: `${graph(config)}/${ig}/media`, body: { image_url: img.url, is_carousel_item: true } })),
                    { method: 'POST', url: `${graph(config)}/${ig}/media`, body: { media_type: 'CAROUSEL', children: '<ids>', caption } },
                ],
            publish: { method: 'POST', url: `${graph(config)}/${ig}/media_publish`, body: { creation_id: '<container>' } },
        };
    },

    async publish(draft, account, { fetch: fetchImpl, config, sleep = (ms) => new Promise(r => setTimeout(r, ms)) }) {
        const base = graph(config);
        const ig = account.account_id;
        const token = account.access_token;
        const caption = composeText('instagram', draft);
        const post = (url, body, label, retries) => request(fetchImpl, url, { method: 'POST', body: form({ ...body, access_token: token }) }, { sleep, label, retries });

        let containerId;
        if (draft.media.length === 1) {
            containerId = (await post(`${base}/${ig}/media`, { image_url: draft.media[0].url, caption }, 'instagram media')).body?.id;
        } else {
            const children = [];
            for (const img of draft.media) {
                const res = await post(`${base}/${ig}/media`, { image_url: img.url, is_carousel_item: 'true' }, 'instagram carousel item');
                children.push(res.body?.id);
            }
            containerId = (await post(`${base}/${ig}/media`, { media_type: 'CAROUSEL', children: children.join(','), caption }, 'instagram carousel')).body?.id;
        }
        if (!containerId) throw new Error('Instagram no devolvió el id del contenedor');

        // Containers are processed asynchronously; publishing before FINISHED fails.
        for (let i = 0; i < 20; i++) {
            const res = await request(fetchImpl, `${base}/${containerId}?fields=status_code&access_token=${encodeURIComponent(token)}`, {}, { sleep, label: 'instagram status' });
            const code = res.body?.status_code;
            if (code === 'FINISHED') break;
            if (code === 'ERROR' || code === 'EXPIRED') throw new Error(`Instagram: el contenedor quedó en ${code}`);
            if (i === 19) throw new Error('Instagram: el contenedor no terminó de procesarse a tiempo');
            await sleep(3000);
        }

        const published = await post(`${base}/${ig}/media_publish`, { creation_id: containerId }, 'instagram media_publish', 0);
        const id = published.body?.id;
        if (!id) throw new Error('Instagram media_publish no devolvió id');
        let permalink = null;
        try {
            const res = await request(fetchImpl, `${base}/${id}?fields=permalink&access_token=${encodeURIComponent(token)}`, {}, { sleep, label: 'instagram permalink', retries: 1 });
            permalink = res.body?.permalink || null;
        } catch {
            // The post is live; a missing permalink is cosmetic.
        }
        return { externalId: id, externalUrl: permalink, payload: { caption, containerId, items: draft.media.length } };
    },
};
