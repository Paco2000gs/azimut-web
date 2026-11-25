/* eslint-env node */
import { linkedin } from './linkedin.js';
import { facebook } from './facebook.js';
import { instagram } from './instagram.js';
import { youtube } from './youtube.js';

/**
 * Every adapter implements the same contract (see PLAN.md, "Interfaz común"):
 *   network, limits, validate(draft), buildPayload(draft, account, config),
 *   publish(draft, account, { fetch, config, sleep }) ->
 *     { externalId, externalUrl, payload, extra? }
 * Adding a network = one new file + one line here.
 */
export const ADAPTERS = { linkedin, facebook, instagram, youtube };

export const getAdapter = (network) => {
    const adapter = ADAPTERS[network];
    if (!adapter) throw new Error(`No adapter for network "${network}"`);
    return adapter;
};
