# Renovation Tracker - Setup Guide

## Stap 1: Supabase Project (5 min)

1. Ga naar https://supabase.com
2. Klik "Start your project"
3. Meld je aan (Google/GitHub/Email)
4. Maak project aan:
   - **Project name:** "renovation-app"
   - **Database password:** sterk wachtwoord (save dit!)
   - **Region:** Europe (Brussel)
5. ✅ Wacht tot project klaar is

## Stap 2: Database Schema Setup (3 min)

1. In Supabase Dashboard → **SQL Editor**
2. Klik **"New Query"**
3. Copy-paste alles uit `supabase/schema.sql`
4. Klik **"Run"**
5. ✅ "Execution completed" bericht verschijnt

## Stap 3: API Keys Kopieren (2 min)

1. Ga naar **Settings → API**
2. Copy beide:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Sla deze veilig op (je hebt ze zo nodig)

## Stap 4: Lokaal Testen (5 min)

```bash
npm install
cp .env.example .env.local
# Vul je Supabase keys in .env.local
npm run dev
```

Bezoek http://localhost:3000 → Login pagina moet zichtbaar zijn ✅

## Stap 5: Vercel Deployment (10 min)

1. Zet code op GitHub (al gedaan!)
2. Ga naar https://vercel.com
3. Klik "New Project" → "Import Git Repository"
4. Selecteer: `Yoel001/renovation-tracker`
5. Environment Variables toevoegen:
   - `NEXT_PUBLIC_SUPABASE_URL` = [jouw URL]
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = [jouw key]
6. Klik "Deploy"
7. ✅ Wacht ~2-3 minuten op live URL

## Stap 6: Supabase Auth Settings (2 min)

In Supabase → **Settings → Authentication**:
1. Scroll naar "Redirect URLs"
2. Voeg je Vercel URL toe:
   ```
   https://your-vercel-url.vercel.app
   ```
3. Save ✅

## Stap 7: Multi-User Setup

1. **Jij:** Account aanmaken op live app
   - Email: `yoel.casal@gmail.com`
   - Wachtwoord: zelf kiezen
   
2. **Huismate:** Account aanmaken
   - Email: `lahaye.celine@hotmail.com`
   - Wachtwoord: zelf kiezen

3. **Delen aktiveren:**
   - In app → "Delen met huismate"
   - Email: `lahaye.celine@hotmail.com`
   - ✅ Real-time sync!

## Troubleshooting

**"Invalid API key"**
- Check je Supabase keys in Vercel
- Zorg dat beide vars ingesteld zijn
- Redeploy Vercel

**"Could not find table 'public.shared_access'"**
- Run het SQL script in Supabase SQL Editor
- Zorg dat "Execution completed" verschijnt

**"Redirect URL not allowed"**
- Voeg je Vercel URL toe in Supabase → Settings → Authentication
- Redirect URLs moeten exact matchen

## Gratis Kosten

✅ Vercel: gratis tier (unlimited deploys)
✅ Supabase: gratis tier (1 project, 500MB DB)
✅ GitHub: gratis (public repo)

**Total: €0,00/maand** 🎉
