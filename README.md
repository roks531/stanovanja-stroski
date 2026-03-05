# Stanovanja Dovc

Web app za vodenje stroškov stanovanj (admin + najemnik) z bazo na Supabase.

## Stack
- Frontend: React + Vite + MUI
- Backend: Supabase (Postgres, Auth, Edge Functions)

## Lokalni zagon
1. `npm install`
2. Kopiraj `.env.example` v `.env`
3. Nastavi:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. `npm run dev`

## Varnost pred prvim push
- Nikoli ne pushaj `.env` ali `SUPABASE_SERVICE_ROLE_KEY`.
- `dist/` in `node_modules/` ne sodita v repozitorij.
- RLS naj ostane vklopljen na vseh javnih tabelah.
- Edge Function `upravljanje-uporabnika` naj ima nastavljen `ALLOWED_ORIGINS` za produkcijski URL.
- V Supabase Auth -> URL Configuration nastavi pravilne Redirect URL-je (točni domeni/test domeni).


## Priporočen hosting (free)
Za ta projekt je najbolj praktičen **Cloudflare Pages (Free)**: git push -> samodejni deploy.

### A) Priporočeno: Cloudflare Pages (auto deploy)
1. Repo push na GitHub.
2. Cloudflare Dashboard -> Workers & Pages -> Create -> Pages -> Connect to Git.
3. Build:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Environment variables (Pages):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy.
6. Dodaj custom domeno (npr. `stanovanja.domena.si`) v Pages -> Custom domains.

### B) Ce zelis `sobe.poddomena.workers.dev`
To je Workers domena. Uporabi Worker deployment flow (ne Pages custom `pages.dev`).
Prakticno:
1. Ustvari Worker app z imenom `sobe`.
2. Objavi build (static assets) preko Workers.
3. URL bo `https://sobe.poddomena.workers.dev`.

Za Git auto-deploy je Pages trenutno bolj enostaven in manj vzdrzevanja.

## SQL migracije
SQL migracije/schema so namenoma zasebne in niso del javnega repozitorija.

## Opomba
`VITE_SUPABASE_ANON_KEY` je javen client key in je lahko v browserju,
`SUPABASE_SERVICE_ROLE_KEY` pa mora ostati izkljucno server-side (Edge Function secrets).
