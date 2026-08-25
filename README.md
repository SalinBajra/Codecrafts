# CodeCrafts v2

A production-focused studio website built to clarify the offer, prove capability with real project evidence, and turn qualified visits into enquiries.

The homepage includes a responsive project stack, persistent light/dark themes, reduced-motion support, and a lightweight Three.js visual layer. Project details live on the Work page; the homepage uses the three verified screenshots only as a visual entry point.

## Preview

Run `powershell -ExecutionPolicy Bypass -File .\local-preview.ps1`, then open `http://localhost:4174`.

## Deployment

Deploy this directory as the project root. The contact endpoint uses the included Vercel function and requires `RESEND_API_KEY`, `CONTACT_TO`, and `CONTACT_FROM` environment variables.

## Pages

- `index.html` — homepage with layered static previews of the three client projects
- `work.html` — verified project screenshots and live-site links
- `services.html`
- `about.html`
- `contact.html`
