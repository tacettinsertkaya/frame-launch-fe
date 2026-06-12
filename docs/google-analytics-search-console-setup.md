# Add framelaunch.store to Google Analytics & Search Console

**Key fact:** the live site already has **Google Tag Manager** installed (container `GTM-T85NVQB4`).
So no code changes are needed — everything below is done in Google's web UIs.

You'll need to be signed into the Google account that owns the GTM container and that you
want to own Analytics + Search Console.

---

## Part 1 — Google Analytics 4

### Step 1. Create the GA4 property
1. Go to <https://analytics.google.com> → bottom-left **Admin** (gear icon).
2. In the **Account** column, pick an existing account or **Create Account** (name it e.g. "Frame Launch").
3. In the **Property** column → **Create** → **Property**.
   - Property name: `Frame Launch`
   - Reporting time zone + currency: your choice → **Next** → fill business details → **Create**.
4. When prompted to set up a data stream: choose **Web**.
   - Website URL: `https://framelaunch.store`
   - Stream name: `Frame Launch Web` → **Create stream**.
5. Copy the **Measurement ID** at the top right — it looks like `G-XXXXXXXXXX`. You need this next.

### Step 2. Connect GA4 through the existing GTM container
Because GTM is already on the site, you add GA4 inside GTM (no code, no deploy):
1. Go to <https://tagmanager.google.com> → open container **GTM-T85NVQB4**.
2. **Tags** → **New** → **Tag Configuration** → **Google Tag**.
3. **Tag ID:** paste your `G-XXXXXXXXXX`.
4. **Triggering** → choose **All Pages** (Initialization - All Pages is fine too).
5. **Save**.
6. Top right → **Submit** → **Publish**. (You must have Publish rights on the container.)

### Step 3. Confirm it works
1. In GA4 → **Reports** → **Realtime**.
2. Open <https://framelaunch.store> in another tab.
3. You should see 1 active user appear within ~30 seconds. Done.

> If you'd rather not use GTM, GA4 can also inject its own "Google tag" — but since GTM
> is already live, the GTM route above is cleanest and avoids touching the site code.

---

## Part 2 — Google Search Console

### Step 1. Add the property
1. Go to <https://search.google.com/search-console>.
2. **Add property** → choose **URL prefix** (simplest; matches your https site).
3. Enter `https://framelaunch.store` → **Continue**.

### Step 2. Verify ownership — pick the easiest that applies

**Option A — Google Tag Manager (fastest; container already installed)**
- In the verification list, pick **Google Tag Manager**.
- You must be signed in as a user with **Publish** permission on container `GTM-T85NVQB4`.
- Click **Verify**. Done instantly — nothing to add to the site.

**Option B — Google Analytics (your original choice)**
- Requires Part 1 to be finished AND the GA4 Google tag to be live on the site.
- In the verification list, pick **Google Analytics**.
- You must have **Editor** access on the GA4 property, using the same Google account.
- Click **Verify**.

**Option C — DNS (fallback, covers all subdomains)**
- Pick **Domain** property type instead of URL prefix.
- Add the TXT record Google gives you at your domain registrar → **Verify**
  (DNS changes can take a few minutes to propagate).

### Step 3. Submit your sitemap
Once verified:
1. Left menu → **Sitemaps**.
2. Enter `sitemap.xml` (confirm it exists at <https://framelaunch.store/sitemap.xml>) → **Submit**.

---

## Recommended order
1. GA4 property → get Measurement ID (Part 1, Steps 1–2).
2. Verify Search Console via **GTM** (Part 2, Option A) — quickest, works immediately.
3. Confirm GA4 Realtime shows traffic.
4. Submit sitemap.

## Notes
- This applies to the **current live site** (the older vanilla-JS version). The Next.js
  rebuild in this repo is a separate, not-yet-deployed codebase. When you eventually deploy
  it, re-add the GTM snippet (or a GA4 tag) to that codebase so tracking carries over.
- One Google account should own GTM, GA4, and Search Console to keep verification simple.
