import { supabase } from './supabase';

// Dodatno čiščenje tokenov, ko Supabase signOut vrne napako ali je seja že neveljavna.
function pocistiLokalneAuthTokene() {
  if (typeof window === 'undefined') return;

  const surovUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
  let projektRef = '';

  try {
    const url = new URL(surovUrl);
    projektRef = url.hostname.split('.')[0] ?? '';
  } catch {
    projektRef = '';
  }

  const kandidati = [
    projektRef ? `sb-${projektRef}-auth-token` : null,
    projektRef ? `sb-${projektRef}-auth-token-code-verifier` : null,
    'supabase.auth.token'
  ].filter(Boolean);

  const storageViri = [window.localStorage, window.sessionStorage];

  storageViri.forEach((shramba) => {
    kandidati.forEach((kljuc) => {
      try {
        shramba.removeItem(kljuc);
      } catch {
        // Ignoriraj napake lokalne shrambe.
      }
    });

    // Varnostno: pobrisi tudi morebitne auth kljuce drugih formatov.
    try {
      for (let i = shramba.length - 1; i >= 0; i -= 1) {
        const kljuc = shramba.key(i);
        if (kljuc && kljuc.startsWith('sb-') && kljuc.includes('-auth-token')) {
          shramba.removeItem(kljuc);
        }
      }
    } catch {
      // Ignoriraj napake iteracije po shrambi.
    }
  });
}

export async function prijava(email, geslo) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: geslo
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function odjava() {
  let napakaSignout = null;

  try {
    // Local sign-out clears this device session only, so other devices stay signed in.
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    napakaSignout = error ?? null;
  } catch (err) {
    napakaSignout = err instanceof Error ? err : new Error(String(err));
  }

  if (napakaSignout) {
    const sporocilo = String(napakaSignout.message ?? '').toLowerCase();
    const jeNeveljavenRefreshToken =
      sporocilo.includes('invalid refresh token') ||
      sporocilo.includes('refresh token not found');
    const jeSejaZeManjkajoca =
      sporocilo.includes('auth session missing') ||
      sporocilo.includes('session missing');
    const jePrepovedano = sporocilo.includes('forbidden') || sporocilo.includes('403');

    // Vedno poskusi lokalno pobrisati tokene, da se UI seja zanesljivo konča.
    pocistiLokalneAuthTokene();

    // Ce je seja že neveljavna/manjkajoca, uporabnika obravnavaj kot odjavljenega.
    if (jeNeveljavenRefreshToken || jeSejaZeManjkajoca || jePrepovedano) {
      return;
    }

    throw new Error(napakaSignout.message);
  }
}

export async function spremeniGeslo(novoGeslo) {
  const { data, error } = await supabase.auth.updateUser({ password: novoGeslo });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function pridobiProfil(uporabnikId) {
  const { data, error } = await supabase
    .from('uporabniki')
    .select(
      `
      id,
      ime,
      priimek,
      telefon,
      email,
      aktiven,
      admin,
      uporabnik_od,
      uporabnik_do,
      soba_id
    `
    )
    .eq('id', uporabnikId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
