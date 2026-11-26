# LookLab MVP

A small deployable web MVP for the first LookLab user test.

## What works
- Responsive landing page and early-access waitlist
- Netlify Forms email collection (`looklab-waitlist`)
- Photo upload with file type and size validation
- Vibe selection and hair/styling preference inputs
- Curated haircut recommendations
- AI hairstyle try-on serverless function
- Barber Card with haircut instructions
- Print / Save as PDF
- Demo still works without an AI key; recommendations and Barber Card work, while AI preview displays a setup message.

## Run locally

Requirements: Node.js 20+.

```bash
npm install
npx netlify dev
```

Open the local URL shown by Netlify CLI (usually http://localhost:8888).

## Enable real AI hairstyle previews

1. Create an API key in your OpenAI API account.
2. In Netlify site settings, add an environment variable named `OPENAI_API_KEY`.
3. Optionally add `OPENAI_IMAGE_MODEL` (defaults to `gpt-image-1`).
4. Redeploy the site.
5. Open LookLab, upload a photo, choose a style, and click **Generate hairstyle preview**.

Do not put the API key in `index.html`, frontend JavaScript, or a public repository. The key is used only by `netlify/functions/tryon.mjs`.

The image edit endpoint sends the uploaded selfie to the configured image API to create the requested haircut preview. Review your API provider's current privacy, retention, and pricing terms before testing with real users. Ask testers for consent before uploading their photos.

## Deploy to Netlify

### Option A — Netlify UI
1. Unzip this project.
2. Drag the project folder contents into Netlify Drop, or connect the folder/repository through Netlify.
3. In Site configuration → Environment variables, set `OPENAI_API_KEY`.
4. Redeploy.
5. Go to Forms and ensure form detection is enabled. Redeploy after enabling detection if Netlify asks.
6. Submit a test email and verify it appears under Forms → `looklab-waitlist`.

### Option B — Netlify CLI
```bash
npm install
npx netlify login
npx netlify init
npx netlify env:set OPENAI_API_KEY "your-key"
npx netlify deploy --build --prod
```

## Important MVP limitations
- Haircut recommendations are curated rules based on the selected vibe and user preferences, not a trained face-analysis model.
- AI hairstyle previews are visual concepts and may not perfectly predict a real barber result.
- The app does not persist selfies or session data to a database. Images are held in browser memory for the session and passed to the serverless function only when the user requests a preview.
- Netlify Forms stores waitlist submissions in your Netlify dashboard. Configure notifications/export there if desired.
- Before a public launch, add a privacy policy, rate limiting, abuse protection, usage/cost limits, and an explicit photo-consent step.

## Suggested first-100-user test
Track:
1. Landing page visits
2. Waitlist signups
3. Photo uploads
4. Completed recommendations
5. AI preview attempts/successes
6. Barber Cards printed/saved
7. Whether the user actually showed the card to a barber
