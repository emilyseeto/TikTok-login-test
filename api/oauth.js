// TikTok OAuth initiation endpoint
export default function handler(req, res) {
    // TikTok OAuth configuration
    const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
    const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || `${req.headers.origin}/api/callback`;
    const SCOPE = 'user.info.basic';
    
    // Generate a random state token for CSRF protection
    const csrfState = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    
    // Store state in a cookie for verification
    res.setHeader('Set-Cookie', `csrfState=${csrfState}; HttpOnly; Secure; SameSite=Strict; Max-Age=600`);
    
    // Build TikTok authorization URL
    const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    authUrl.searchParams.set('client_key', CLIENT_KEY);
    authUrl.searchParams.set('scope', SCOPE);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('state', csrfState);
    
    // Redirect to TikTok authorization page
    res.redirect(302, authUrl.toString());
}
