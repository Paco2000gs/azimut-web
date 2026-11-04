/* eslint-env node */
/**
 * Server-side configuration for the social media pipeline.
 *
 * Read lazily from process.env on every call so tests (and Vercel, which can
 * reuse a warm instance across env changes) never see a stale snapshot.
 */

export const NETWORKS = ['linkedin', 'facebook', 'instagram', 'youtube'];

const list = (value) => (value || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

export const getConfig = (env = process.env) => ({
    // Anything other than the literal "false" is dry-run: a typo or a missing
    // variable must never be what turns real publishing on.
    dryRun: env.SOCIAL_DRY_RUN !== 'false',
    siteUrl: (env.SITE_URL || 'https://www.azimutproperty.com').replace(/\/+$/, ''),
    adminEmails: list(env.ADMIN_EMAILS),

    supabaseUrl: env.SUPABASE_URL || env.VITE_SUPABASE_URL || '',
    supabaseServiceKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
    tokenEncKey: env.SOCIAL_TOKEN_ENC_KEY || '',
    oauthStateSecret: env.OAUTH_STATE_SECRET || '',
    cronSecret: env.CRON_SECRET || '',
    deployHookUrl: env.VERCEL_DEPLOY_HOOK_URL || '',

    gemini: {
        apiKey: env.GEMINI_API_KEY || '',
        model: env.GEMINI_MODEL || 'gemini-3.8-flash',
    },

    worker: {
        token: env.GITHUB_DISPATCH_TOKEN || '',
        repo: env.GITHUB_REPO || 'Paco2000gs/azimut-web',
        workflow: env.GITHUB_WORKFLOW || 'social-media.yml',
        ref: env.GITHUB_REF || 'main',
        secret: env.VIDEO_WORKER_SECRET || '',
    },

    meta: {
        appId: env.META_APP_ID || '',
        appSecret: env.META_APP_SECRET || '',
        graphVersion: env.META_GRAPH_VERSION || 'v26.0',
        pageId: env.META_PAGE_ID || '',
    },
    linkedin: {
        clientId: env.LINKEDIN_CLIENT_ID || '',
        clientSecret: env.LINKEDIN_CLIENT_SECRET || '',
        apiVersion: env.LINKEDIN_API_VERSION || '202610',
        organizationId: env.LINKEDIN_ORGANIZATION_ID || '',
    },
    google: {
        clientId: env.GOOGLE_CLIENT_ID || '',
        clientSecret: env.GOOGLE_CLIENT_SECRET || '',
        youtubePrivacy: env.YOUTUBE_PRIVACY || 'public',
    },
});
