# TenantSentry.com.au — Deployment Guide

Everything you need to get live. Total time: ~30 minutes.

---

## Step 1 — Register TenantSentry.com.au

**Recommended registrar: VentraIP** (Australian, fast .com.au registration)

1. Go to https://ventraip.com.au
2. Search for `tenantsentry.com.au`
3. Add to cart (~$20/yr for .com.au)
4. Also grab `tenantsentry.au` if available (~$20/yr) — redirect it to .com.au later
5. Complete checkout — use your ABN during registration (required for .com.au)
6. **Leave DNS settings as default for now** — you'll update them in Step 3

> ⚠️ .com.au domains require an ABN or ACN. Have your ABN ready.

---

## Step 2 — Deploy to Vercel

### 2a. Create a free Vercel account
1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended) or email

### 2b. Deploy the site folder

**Option A — Drag & Drop (easiest, no CLI needed)**
1. Go to https://vercel.com/new
2. Click **"Browse"** and select the `tenantsentry-site` folder from your PropTech folder
3. Vercel auto-detects it as a static site
4. Click **Deploy**
5. In ~60 seconds you'll get a live URL like `tenantsentry-site-abc123.vercel.app`

**Option B — Vercel CLI**
```bash
# Install Vercel CLI (one-time)
npm install -g vercel

# Navigate to the site folder
cd "C:\Users\gofor\Documents\Workspace\PropTech\tenantsentry-site"

# Deploy
vercel

# Follow the prompts — accept all defaults
# At the end you get a .vercel.app URL
```

### 2c. Test the live URL
- Open the `.vercel.app` URL in your browser
- Confirm the site looks correct before pointing the real domain

---

## Step 3 — Point TenantSentry.com.au to Vercel

### 3a. Add the domain in Vercel
1. In your Vercel dashboard, open the project
2. Go to **Settings → Domains**
3. Click **Add Domain**
4. Type `tenantsentry.com.au` → click Add
5. Also add `www.tenantsentry.com.au`
6. Vercel will show you DNS records to configure — **leave this tab open**

### 3b. Update DNS at VentraIP
1. Log in to https://ventraip.com.au → **My Services → Domain Names**
2. Click `tenantsentry.com.au` → **Manage DNS**
3. Delete any existing A records for `@`
4. Add the records Vercel gave you:

| Type  | Name | Value                  |
|-------|------|------------------------|
| A     | @    | 76.76.21.21            |
| CNAME | www  | cname.vercel-dns.com   |

5. Save — DNS propagates in 5–30 minutes (up to 48hrs max, usually fast)

### 3c. Verify in Vercel
- Back in Vercel → Settings → Domains
- Wait for the green ✓ tick next to `tenantsentry.com.au`
- Vercel auto-provisions a free SSL certificate (HTTPS)

---

## Step 4 — Optional: Redirect TenantSentry.ai to .com.au

If you also own `tenantsentry.ai`:
1. In Vercel → Settings → Domains → Add `tenantsentry.ai`
2. Set it as a **Redirect** to `https://tenantsentry.com.au`
3. Update DNS at your .ai registrar the same way as above

---

## Step 5 — Future Deploys (updating the site)

Every time you update `index.html`:

**Drag & Drop:** Go to Vercel dashboard → your project → **Deployments** → drag the updated folder

**CLI:** Run `vercel --prod` from the `tenantsentry-site` folder

---

## File Structure (what's in this folder)

```
tenantsentry-site/
├── index.html      ← The homepage (all-in-one HTML/CSS/JS)
├── vercel.json     ← Vercel routing + security headers config
├── robots.txt      ← Tells search engines what to index
├── sitemap.xml     ← Helps Google find your pages
└── DEPLOY.md       ← This guide
```

---

## Checklist Before Going Live

- [ ] Domain registered at VentraIP
- [ ] Vercel account created
- [ ] Site deployed and .vercel.app URL works
- [ ] Custom domain added in Vercel
- [ ] DNS records updated at VentraIP
- [ ] Green ✓ in Vercel Domains tab
- [ ] HTTPS works (https://tenantsentry.com.au loads)
- [ ] Test all CTA buttons link to tenantsentry.ai correctly

---

*Guide prepared 29 May 2026 | TenantSentry Pty Ltd*
