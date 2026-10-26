/* eslint-env node */
import { LIMITS } from '../limits.js';
import { composeText } from '../text.js';
import { request, form } from '../http.js';
import { validateCommon } from './common.js';

const graph = (config) => `https://graph.facebook.com/${config.meta.graphVersion}`;

/**
 * Facebook Page multi-photo post: each photo uploaded with published=false,
 * then one /feed post that attaches them all.
 * https://developers.facebook.com/docs/graph-api/reference/page/photos/
 */
export const facebook = {
    network: 'facebook',
    limits: LIMITS.facebook,

    validate(draft) {
        return validateCommon('facebook', draft);
    },

    buildPayload(draft, account, config) {
        const page = account?.account_id || '<PAGE_ID>';
        return {
            network: 'facebook',
            photos: draft.media.map(img => ({
                method: 'POST', url: `${graph(config)}/${page}/photos`, body: { url: img.url, published: false },
            })),
            post: {
                method: 'POST',
                url: `${graph(config)}/${page}/feed`,
                body: { message: composeText('facebook', draft), attached_media: draft.media.map((_, i) => ({ media_fbid: `<foto-${i + 1}>` })) },
            },
        };
    },

    async publish(draft, account, { fetch: fetchImpl, config, sleep }) {
        const base = `${graph(config)}/${account.account_id}`;
        const token = account.access_token;

        const photoIds = [];
        for (const img of draft.media) {
            const res = await request(fetchImpl, `${base}/photos`, {
                method: 'POST', body: form({ url: img.url, published: 'false', access_token: token }),
            }, { sleep, label: 'facebook photos' });
            if (!res.body?.id) throw new Error('Facebook /photos no devolvió id');
            photoIds.push(res.body.id);
        }

        const message = composeText('facebook', draft);
        const params = form({ message, access_token: token });
        photoIds.forEach((id, i) => params.append(`attached_media[${i}]`, JSON.stringify({ media_fbid: id })));
        const res = await request(fetchImpl, `${base}/feed`, { method: 'POST', body: params }, { sleep, label: 'facebook feed', retries: 0 });
        const id = res.body?.id;
        if (!id) throw new Error('Facebook /feed no devolvió id');
        return {
            externalId: id,
            externalUrl: `https://www.facebook.com/${id}`,
            payload: { message, photoIds },
        };
    },
};
