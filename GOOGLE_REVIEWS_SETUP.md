# Google Reviews Setup (Cloudflare Worker)

This site is wired to fetch live reviews from:
- `/api/google-reviews`

The fallback static reviews remain visible if this endpoint is unavailable.

## 1. Create/enable APIs in Google Cloud
- Enable `Places API`.
- Create an API key with HTTP restrictions.
- Get your Google Place ID for Sosmos (not the Maps URL CID).

## 2. Deploy the Cloudflare Worker
From the project root:

```bash
cd worker
cp wrangler.toml.example wrangler.toml
wrangler secret put GOOGLE_MAPS_API_KEY
wrangler secret put GOOGLE_PLACE_ID
# optional (default 21600 = 6h)
wrangler secret put REVIEWS_CACHE_TTL_SECONDS
wrangler deploy
```

## 3. Route the endpoint
- If using `workers.dev`, use your worker URL + `/api/google-reviews`.
- For production, set a custom route like `https://yourdomain.com/api/google-reviews`.

## 4. Verify
Open:
- `https://yourdomain.com/api/google-reviews`

Expected JSON includes:
- `place.rating`
- `place.userRatingsTotal`
- `reviews[]`

## Notes
- Frontend integration is already done in `reviews.html` + `js/main.js`.
- If the fetch fails, placeholder reviews remain visible automatically.
