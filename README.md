# My Hidden Deals

A professional web application that connects to users' email via Nylas OAuth and automatically scans for non-expired coupons and promotional offers.

## Features

- **Nylas OAuth Integration**: Secure Google email connection via Nylas
- **Automated Scanning**: Automatically scans inbox for promotional content
- **Smart Categorization**: Deals organized by category (Retail, Food & Dining, Travel, Services)
- **Expiry Tracking**: Visual indicators for deals expiring soon
- **Easy Code Copying**: Click any coupon code to copy it to clipboard
- **Direct Links**: CTA buttons to view deals directly from source emails
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Professional UI**: Modern design with Inter font and smooth animations

## How It Works

1. **Connect Email**: Users enter their email and authenticate via Nylas OAuth (Google)
2. **Automatic Scan**: System triggers a promo scan job via the backend API
3. **Process Results**: Backend analyzes emails and extracts promotional content
4. **Display Deals**: All active deals are displayed with filters and categories
5. **Take Action**: Users can copy codes or click through to view original offers

## File Structure

```
A1DemoConnect/
├── index.html         # Landing page
├── connected.html     # OAuth callback / results page
├── styles.css         # All styling and animations
├── app.js            # API integration and app logic
└── README.md         # This file
```

## Usage

Run a local web server (required for OAuth redirect):

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js with http-server
npx http-server
```

Then navigate to `http://localhost:8000`

**Note**: Your backend must allowlist `http://localhost:8000` for OAuth redirects during local development.

## API Integration

The app integrates with the following backend endpoints at `https://staging.aone1.ai`:

### 1. Initiate OAuth Flow
```
POST /api/nylas/auth
Body: {
  "provider": "google",
  "redirect": "http://localhost:8000/connected.html",
  "email": "user@example.com"  // optional
}
Response: { "authUrl": "https://..." }
```

### 2. Trigger Promo Scan
```
POST /api/promos/scan
Body: { "grantId": "grant-id-from-oauth" }
Response: { "jobId": "job-123" }
```

### 3. Check Scan Status (Optional Polling)
```
GET /api/promos/scan/{jobId}
Response: { "status": "done" | "processing" | "failed" }
```

### 4. Fetch Promos
```
GET /api/promos?grantId={grantId}&limit=50&offset=0
Response: Array of promo objects
```

## Expected API Data Format

The `/api/promos` endpoint should return deals in this format:

```javascript
[
  {
    id: string | number,
    brand: string,           // merchant name
    subject: string,         // deal title/subject
    description: string,     // deal description
    code: string,           // coupon code (optional)
    discount: string,       // e.g., "20%" or "$50"
    expiry: string,         // ISO date string
    ctaLink: string,        // link to original email/offer
    // ... other fields
  }
]
```

## Customization

- **Colors**: Modify CSS variables in `:root` selector in `styles.css`
- **Categories**: Add/remove categories in the filters section and update the `formatCategory` function
- **Mock Data**: Edit the `mockDeals` array in `app.js` for testing

## Production Deployment

The application is deployed at **https://mydeals.aone1.ai**

### Deploy to Production

```bash
# Using the deployment script
./deploy.sh

# Or manually with Vercel
vercel --prod

# Or with Netlify
netlify deploy --prod
```

See `DEPLOYMENT.md` for comprehensive deployment instructions.

### Backend Requirements

Ensure your backend at `staging.aone1.ai` has:

1. **Allowed redirect hosts:**
   ```
   ALLOWED_REDIRECT_HOSTS=mydeals.aone1.ai,localhost
   ```

2. **CORS configuration:**
   ```javascript
   origin: ['https://mydeals.aone1.ai', 'http://localhost:8000']
   ```

3. **Nylas callback URI:**
   ```
   https://staging.aone1.ai/api/nylas/callback
   ```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Technologies Used

- Pure HTML5
- CSS3 (Grid, Flexbox, Animations)
- Vanilla JavaScript (ES6+)
- Inter font (Google Fonts)
- Nylas OAuth integration
- No build process required

## Project Structure

```
A1DemoConnect/
├── index.html           # Landing page
├── connected.html       # OAuth callback / results page
├── styles.css          # All styling
├── app.js              # API integration logic
├── deploy.sh           # Deployment script
├── vercel.json         # Vercel configuration
├── netlify.toml        # Netlify configuration
├── _redirects          # Netlify redirects
├── DEPLOYMENT.md       # Deployment guide
└── README.md           # This file
```

## License

This is a production project for aone1.ai.

