# Vivek Reddy Eluka — Portfolio Website

This is a **data‑driven** portfolio site built with **HTML + CSS + JavaScript**.
You edit **one file** (`data.json`) and the page updates automatically.

## Edit content
Open `data.json` and update:
- `name`, `headline`, `roles`, `summary`
- `skills`, `projects`, `research`, `education`, `achievements`
- `social` links
- `resumeUrl` (defaults to `./resume.pdf`)

## Add / replace your resume PDF
Replace `resume.pdf` in this folder with your latest resume:
- keep the filename **exactly** `resume.pdf`, OR
- change `resumeUrl` in `data.json` to point to the right file/link.

## Run locally (important)
Because the site loads `data.json` with `fetch()`, you should run it with a local server.

### Option A: Python (simple)
From this folder:
```bash
python -m http.server 8000
```
Then open:
- http://localhost:8000

### Option B: VS Code Live Server
Open the folder in VS Code and use the **Live Server** extension.

## Make it a public website (recommended: GitHub Pages)

### 1) Create a GitHub repo
1. Go to GitHub → **New repository**
2. Name it something like: `vivek-portfolio`
3. Set it to **Public**
4. Create the repo

### 2) Upload these files
Upload everything inside this folder:
- `index.html`, `styles.css`, `script.js`, `data.json`
- `resume.pdf`, `favicon.svg`, `og-image.png`, etc.

### 3) Enable GitHub Pages
1. In your repo, go to **Settings → Pages**
2. Under **Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main** (or master) / folder: **/ (root)**
3. Save

After that, your site will be live at a URL like:
- `https://YOUR_GITHUB_USERNAME.github.io/vivek-portfolio/`

## Alternative: Netlify (fast)
1. Create a Netlify account
2. Click **Add new site → Deploy manually**
3. Drag‑and‑drop this folder contents
4. Netlify will give you a public URL instantly

## Alternative: Vercel
1. Create a Vercel account
2. Import your GitHub repo
3. Deploy (defaults are fine)
4. You’ll get a public URL

## Custom domain (optional)
For GitHub Pages / Netlify / Vercel you can connect a custom domain.
They’ll show you DNS records (CNAME/A) to add at your domain provider.

---
Tip: The Open Graph image used by social previews is `og-image.png`. Replace it with a custom one if you want.
