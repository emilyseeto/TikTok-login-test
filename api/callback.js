// TikTok OAuth callback handler
export default async function handler(req, res) {
    const { code, state, error, error_description, scopes } = req.query;
    
    // Get the stored state from cookies
    const cookies = req.headers.cookie;
    const storedState = cookies?.split(';')
        .find(cookie => cookie.trim().startsWith('csrfState='))
        ?.split('=')[1];
    
    // Verify state parameter to prevent CSRF attacks
    if (!state || state !== storedState) {
        return res.redirect(`/?error=invalid_state&error_description=State parameter mismatch`);
    }
    
    // Handle authorization errors
    if (error) {
        return res.redirect(`/?error=${error}&error_description=${error_description || 'Authorization failed'}`);
    }
    
    if (!code) {
        return res.redirect(`/?error=no_code&error_description=No authorization code received`);
    }
    
    try {
        // Exchange authorization code for access token
        const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
        const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
        const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || `${req.headers.origin}/api/callback`;
        
        if (!CLIENT_KEY || !CLIENT_SECRET) {
            console.error('Missing TikTok credentials');
            return res.redirect(`/?error=server_error&error_description=Server configuration error`);
        }
        
        const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_key: CLIENT_KEY,
                client_secret: CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
            }),
        });
        
        const tokenData = await tokenResponse.json();
        
        if (!tokenResponse.ok) {
            console.error('Token exchange failed:', tokenData);
            return res.redirect(`/?error=token_error&error_description=${tokenData.error?.message || 'Failed to exchange code for token'}`);
        }
        
        // Get user info using the access token
        const userResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
            },
        });
        
        const userData = await userResponse.json();
        
        // Redirect back to main page with success data
        const successData = {
            code: code,
            state: state,
            scopes: scopes,
            access_token: tokenData.access_token,
            user_info: userData.data?.user || null,
            token_info: {
                access_token: tokenData.access_token,
                token_type: tokenData.token_type,
                expires_in: tokenData.expires_in,
                scope: tokenData.scope,
                refresh_token: tokenData.refresh_token,
                refresh_expires_in: tokenData.refresh_expires_in
            }
        };
        
        // Encode the success data to pass in URL
        const encodedData = encodeURIComponent(JSON.stringify(successData));
        return res.redirect(`/?success=true&data=${encodedData}`);
        
    } catch (error) {
        console.error('Callback error:', error);
        return res.redirect(`/?error=server_error&error_description=${encodeURIComponent(error.message)}`);
    }
}
