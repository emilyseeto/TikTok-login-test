// Express server for local development and Docker deployment
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('healthy');
});

// TikTok OAuth initiation endpoint
app.get('/api/oauth', (req, res) => {
    // TikTok OAuth configuration
    const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
    const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/callback`;
    const SCOPE = 'user.info.basic';
    
    // Generate a random state token for CSRF protection
    const csrfState = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    
    // Store state in a cookie for verification
    res.cookie('csrfState', csrfState, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 600000 // 10 minutes
    });
    
    // Build TikTok authorization URL
    const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    authUrl.searchParams.set('client_key', CLIENT_KEY);
    authUrl.searchParams.set('scope', SCOPE);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('state', csrfState);
    
    // Redirect to TikTok authorization page
    res.redirect(302, authUrl.toString());
});

// TikTok OAuth callback handler
app.get('/api/callback', async (req, res) => {
    const { code, state, error, error_description, scopes } = req.query;
    
    // Get the stored state from cookies
    const storedState = req.cookies?.csrfState;
    
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
        const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/callback`;
        
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
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`TikTok Login Test server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`TikTok Client Key: ${process.env.TIKTOK_CLIENT_KEY ? 'Set' : 'Not set'}`);
});
