# Renovation Tracker - Setup Guide

## Stap 1: Supabase Account (5 min)

1. Ga naar https://supabase.com
2. Klik "Start your project"
3. Meld je aan met Google/GitHub/Email
4. Maak een nieuw project aan
5. Vul in de Project Settings:
   - **URL**: Copy naar `.env.local` als `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key**: Copy naar `.env.local` als `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Stap 2: Database Setup (2 min)

1. In Supabase Dashboard, ga naar SQL Editor
2. Klik "New Query"
3. Copy-paste de inhoud van `supabase/schema.sql`
4. Klik "Run"
5. Done! Database is klaar

## Stap 3: Vercel Account (3 min)

1. Ga naar https://vercel.com
2. Meld je aan met GitHub/Google
3. Klik "New Project"
4. Selecteer je GitHub repository (na git push)

## Stap 4: Lokaal Opzetten

```bash
# Clone of download deze folder
cd renovation-app

# Install dependencies
npm install

# Copy .env.example naar .env.local en vul je Supabase keys in
cp .env.example .env.local

# Start development server
npm run dev
```

Bezoek http://localhost:3000 - klaar!

## Stap 5: Pushen naar GitHub & Vercel

```bash
# Initialize git repo
git init
git add .
git commit -m "Initial commit"

# Push naar GitHub (maak repo eerst aan op github.com)
git remote add origin https://github.com/jouw-username/renovation-tracker.git
git push -u origin main
```

Dan in Vercel:
1. Klik "Import Project"
2. Selecteer je GitHub repo
3. Vercel vraagt Environment Variables
4. Voeg `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_ANON_KEY` in
5. Klik "Deploy"

Done! 🚀 Je app is live!

## Multi-user Setup

### Jijzelf + Huismate toevoegen:

1. Zelf account maken: Registreer op je eigen app
2. Huismate email uitnodigen via "Delen met huismate" knop in de app
3. Huismate maakt account aan
4. Bij inloggen ziet huismate jouw renovaties (shared access)

## Problemen?

**"NEXTAUTH_SECRET missing"** 
→ Dit zit niet in deze versie (we gebruiken Supabase auth)

**"Database connection failed"**
→ Check je `.env.local` keys in Supabase

**"Vercel build fails"**
→ Zorg dat alle dependencies in `package.json` staan

Stel gerust vragen! 🏠
