# TikTok Login Test

A simple web application that demonstrates TikTok OAuth login integration using the TikTok Login Kit for Web.

## Features

- TikTok OAuth login flow
- Secure state parameter validation
- Access token exchange
- User information retrieval
- Responsive web interface
- Vercel deployment ready

## Setup

### 1. TikTok Developer Account

1. Go to [TikTok for Developers](https://developers.tiktok.com)
2. Create a developer account and register your app
3. Enable the Login Kit product for your app
4. Configure your redirect URI (e.g., `https://your-domain.vercel.app/api/callback`)

### 2. Configuration

#### For Direct API Calls (Frontend)
Update `config.js` with your TikTok app credentials:
```javascript
window.TIKTOK_CONFIG = {
    clientKey: 'your_client_key_here', // From TikTok Developer Portal
    redirectUri: 'https://your-domain.com/api/callback',
    scope: 'user.info.basic'
};
```

#### For Server-side (Backend)
Copy `env.example` to `.env.local` and fill in your TikTok app credentials:

```bash
cp env.example .env.local
```

Update the following variables:
- `TIKTOK_CLIENT_KEY`: Your app's client key from TikTok Developer Portal
- `TIKTOK_CLIENT_SECRET`: Your app's client secret from TikTok Developer Portal  
- `TIKTOK_REDIRECT_URI`: Your app's redirect URI (must match what you configured in TikTok Developer Portal)

### 3. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Set environment variables in Vercel dashboard:
   - `TIKTOK_CLIENT_KEY`
   - `TIKTOK_CLIENT_SECRET`
   - `TIKTOK_REDIRECT_URI`

## How It Works

1. **User clicks "Continue with TikTok"** → JavaScript function calls TikTok authorization API directly
2. **Direct API call** → Generates state token and redirects to TikTok authorization
3. **User authorizes on TikTok** → TikTok redirects to `/api/callback`
4. **Callback handler** → Exchanges code for access token and gets user info
5. **Success response** → Redirects back to main page with login data

## Security Features

- CSRF protection using state parameter
- Secure cookie handling
- Environment variable protection
- HTTPS enforcement

## API Endpoints

- `GET /api/oauth` - Initiates TikTok OAuth flow
- `GET /api/callback` - Handles TikTok OAuth callback
- `GET /` - Main page with login button and response display

## Response Data

After successful login, the page displays:
- Authorization code
- Access token
- User information (display name, avatar, etc.)
- Token metadata (expires, scopes, etc.)

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"** - Make sure your redirect URI in TikTok Developer Portal matches exactly
2. **"State parameter mismatch"** - This is normal security behavior, try the login flow again
3. **"Server configuration error"** - Check that all environment variables are set correctly

### Debug Mode

Check the browser console and Vercel function logs for detailed error information.
