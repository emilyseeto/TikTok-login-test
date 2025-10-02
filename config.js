// TikTok OAuth Configuration
// Update these values with your TikTok app credentials

window.TIKTOK_CONFIG = {
    // Get this from https://developers.tiktok.com
    clientKey: 'sbawscptfcgjaj8kxa',
    
    // Your app's redirect URI (must match what you configured in TikTok Developer Portal)
    redirectUri: window.location.origin + '/api/callback',
    
    // OAuth scopes (comma-separated)
    scope: 'user.info.basic'
};
