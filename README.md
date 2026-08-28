# CodeCrafts v2

A production-focused studio website built to clarify the offer, prove capability with real project evidence, and turn qualified visits into enquiries.

The homepage includes a responsive project stack, persistent light/dark themes, reduced-motion support, and a lightweight Three.js visual layer. Project details live on the Work page; the homepage uses the three verified screenshots only as a visual entry point.

The site includes page-specific titles and descriptions, canonical URLs, Open Graph/Twitter metadata, Organization and WebSite structured data, a social preview image, `robots.txt`, `sitemap.xml`, and a web manifest. Canonical and sitemap URLs currently use the production Vercel domain and should be updated together if a custom domain becomes primary.

## Preview

Run `powershell -ExecutionPolicy Bypass -File .\local-preview.ps1`, then open `http://localhost:4174`.

## Deployment

Deploy this directory as the project root. The contact endpoint uses the included Vercel function and requires `RESEND_API_KEY`, `CONTACT_TO`, and `CONTACT_FROM` environment variables.

## Admin CMS

The protected CMS is available at `/admin`. It edits shared site content, page copy, projects, service lists, FAQs, contact choices and page-level SEO without changing the HTML files.

The CMS stores published content in Supabase and keeps `content/site-content.json` as a resilient fallback. To configure it:

1. Open the Supabase SQL Editor and run `content/supabase.sql` once.
2. Add the following Vercel environment variables for Production, Preview and Development:
   - `SUPABASE_URL` - the project URL.
   - `SUPABASE_SECRET_KEY` - the server-only `sb_secret_...` key. Never expose this in frontend code. Legacy projects can use `SUPABASE_SERVICE_ROLE_KEY` instead.
   - `CMS_ADMIN_PASSWORD` - a long, unique admin password.
   - `CMS_SESSION_SECRET` - at least 32 random characters used to sign login sessions.
3. Redeploy, open `/admin`, sign in and publish. The first publish creates the primary content row from the built-in content.

Use `vercel dev` when testing authentication and publishing locally. The lightweight PowerShell preview opens the admin in a read-only fallback-preview mode on the loopback interface, but intentionally does not emulate secure login or database writes.

## Pages

- `index.html` — homepage with layered static previews of the three client projects
- `work.html` — verified project screenshots and live-site links
- `services.html`
- `about.html`
- `contact.html`
