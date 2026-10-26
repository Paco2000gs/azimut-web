/* eslint-env node */
import { LIMITS } from '../limits.js';
import { composeLinkedInCommentary } from '../text.js';
import { request, download } from '../http.js';
import { validateCommon } from './common.js';

const API = 'https://api.linkedin.com/rest';

const headers = (token, version) => ({
    Authorization: `Bearer ${token}`,
    'Linkedin-Version': version,
    'X-Restli-Protocol-Version': '2.0.0',
    'Content-Type': 'application/json',
});

const postBody = (draft, author, imageUrns) => {
    const alt = (i) => draft.media[i]?.alt || draft.title || '';
    const content = imageUrns.length > 1
        ? { multiImage: { images: imageUrns.map((id, i) => ({ id, altText: alt(i) })) } }
        : { media: { id: imageUrns[0], altText: alt(0) } };
    return {
        author,
        commentary: composeLinkedInCommentary(draft),
        visibility: 'PUBLIC',
        distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
        content,
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false,
    };
};

/**
 * LinkedIn Company Page, organic multi-image post.
 * Images API (initializeUpload + PUT) then Posts API with content.multiImage
 * (2-20 images) or content.media for a single one.
 */
export const linkedin = {
    network: 'linkedin',
    limits: LIMITS.linkedin,

    validate(draft) {
        return validateCommon('linkedin', draft);
    },

    buildPayload(draft, account, config) {
        const author = account?.account_id || `urn:li:organization:${config.linkedin.organizationId || '<LINKEDIN_ORGANIZATION_ID>'}`;
        return {
            network: 'linkedin',
            apiVersion: config.linkedin.apiVersion,
            imageUploads: draft.media.map(img => ({
                request: { method: 'POST', url: `${API}/images?action=initializeUpload`, body: { initializeUploadRequest: { owner: author } } },
                source: img.url,
            })),
            post: {
                method: 'POST',
                url: `${API}/posts`,
                body: postBody(draft, author, draft.media.map((_, i) => `urn:li:image:<subida-${i + 1}>`)),
            },
        };
    },

    async publish(draft, account, { fetch: fetchImpl, config, sleep }) {
        const token = account.access_token;
        const h = headers(token, config.linkedin.apiVersion);
        const opts = { sleep };

        const imageUrns = [];
        for (const img of draft.media) {
            const init = await request(fetchImpl, `${API}/images?action=initializeUpload`, {
                method: 'POST', headers: h,
                body: JSON.stringify({ initializeUploadRequest: { owner: account.account_id } }),
            }, { ...opts, label: 'linkedin initializeUpload' });
            const { uploadUrl, image } = init.body?.value || {};
            if (!uploadUrl || !image) throw new Error('LinkedIn initializeUpload: respuesta sin uploadUrl/image');
            const file = await download(fetchImpl, img.url);
            await request(fetchImpl, uploadUrl, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': file.contentType },
                body: file.bytes,
            }, { ...opts, label: 'linkedin image upload' });
            imageUrns.push(image);
        }

        const body = postBody(draft, account.account_id, imageUrns);
        const res = await request(fetchImpl, `${API}/posts`, {
            method: 'POST', headers: h, body: JSON.stringify(body),
        }, { ...opts, label: 'linkedin posts', retries: 0 });
        const id = res.headers.get('x-restli-id');
        if (!id) throw new Error('LinkedIn no devolvió x-restli-id');
        return {
            externalId: id,
            externalUrl: `https://www.linkedin.com/feed/update/${id}/`,
            payload: { post: body, imageUrns },
        };
    },
};
