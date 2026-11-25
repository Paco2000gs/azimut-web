/* eslint-env node */
// One Vercel Function for every /api/social/* route (see vercel.json rewrite).
// The logic lives in server/social so it can be tested without Vercel.
import { handle } from '../server/social/router.js';

export default function handler(req, res) {
    return handle(req, res);
}
