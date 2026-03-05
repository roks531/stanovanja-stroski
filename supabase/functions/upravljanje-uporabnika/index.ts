import { createClient } from 'npm:@supabase/supabase-js@2.90.1';

type Vhod = {
  id?: string;
  ime: string;
  priimek: string;
  telefon?: string | null;
  email: string;
  geslo?: string;
  soba_id?: string | null;
  admin?: boolean;
  aktiven?: boolean;
  uporabnik_od?: string;
  uporabnik_do?: string | null;
  posodobil?: string | null;
};

const PRIVZETI_DOVOLJENI_ORIGINI = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

type CorsNastavitve = {
  wildcard: boolean;
  origini: string[];
};

function jeLokalniRazvojniOrigin(origin: string) {
  try {
    const url = new URL(origin);
    return (
      url.protocol === 'http:' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
    );
  } catch {
    return false;
  }
}

function jeOriginDovoljen(origin: string | null, dovoljeniOrigini: string[]) {
  if (!origin) return false;
  return dovoljeniOrigini.includes(origin) || jeLokalniRazvojniOrigin(origin);
}

function preberiCorsNastavitve(): CorsNastavitve {
  const izOkolja = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  if (izOkolja.length === 0) {
    return { wildcard: false, origini: PRIVZETI_DOVOLJENI_ORIGINI };
  }

  return {
    wildcard: izOkolja.includes('*'),
    origini: izOkolja.filter((o) => o !== '*')
  };
}

function jeOriginDovoljenPoCorsNastavitvah(origin: string | null, cors: CorsNastavitve) {
  if (!origin) return true;
  if (cors.wildcard) return true;
  return jeOriginDovoljen(origin, cors.origini);
}

function dovoliOrigin(origin: string | null, cors: CorsNastavitve) {
  if (origin && jeOriginDovoljenPoCorsNastavitvah(origin, cors)) return origin;
  if (cors.wildcard) return '*';
  return cors.origini[0] ?? PRIVZETI_DOVOLJENI_ORIGINI[0];
}

function corsHeaders(req: Request, cors: CorsNastavitve) {
  const origin = req.headers.get('origin');
  const zahtevaniHeaders =
    req.headers.get('access-control-request-headers') ??
    'authorization, x-client-info, apikey, content-type';

  return {
    'Access-Control-Allow-Origin': dovoliOrigin(origin, cors),
    'Access-Control-Allow-Headers': zahtevaniHeaders,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin, Access-Control-Request-Headers'
  };
}

function json(req: Request, cors: CorsNastavitve, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req, cors),
      'Content-Type': 'application/json'
    }
  });
}

function jeVeljavenEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function jeMocnoGeslo(geslo: string) {
  if (geslo.length < 12) return false;
  const imaMalo = /[a-z]/.test(geslo);
  const imaVeliko = /[A-Z]/.test(geslo);
  const imaStevilko = /\d/.test(geslo);
  const imaZnak = /[^A-Za-z0-9]/.test(geslo);
  return imaMalo && imaVeliko && imaStevilko && imaZnak;
}

function datumNizAliNull(vrednost: unknown) {
  if (vrednost == null) return null;
  const niz = String(vrednost).trim();
  return niz || null;
}

Deno.serve(async (req) => {
  const cors = preberiCorsNastavitve();
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders(req, cors) });
  }

  if (!jeOriginDovoljenPoCorsNastavitvah(origin, cors)) {
    return json(req, cors, { napaka: 'Origin ni dovoljen.' }, 403);
  }

  if (req.method !== 'POST') {
    return json(req, cors, { napaka: 'Dovoljena je samo POST metoda.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json(req, cors, { napaka: 'Manjkajo Supabase okoljske spremenljivke za funkcijo.' }, 500);
  }

  const authorization = req.headers.get('authorization');
  if (!authorization?.toLowerCase().startsWith('bearer ')) {
    return json(req, cors, { napaka: 'Manjka veljaven Authorization Bearer token.' }, 401);
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: authorization
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const {
    data: { user: caller },
    error: callerError
  } = await callerClient.auth.getUser();

  if (callerError || !caller) {
    return json(req, cors, { napaka: 'Neveljavna seja.' }, 401);
  }

  const { data: jeAdmin, error: adminError } = await callerClient.rpc('je_admin');
  if (adminError) {
    return json(req, cors, { napaka: adminError.message }, 400);
  }

  if (!jeAdmin) {
    return json(req, cors, { napaka: 'Dostop imajo samo aktivni admini.' }, 403);
  }

  let vhod: Vhod;

  try {
    vhod = (await req.json()) as Vhod;
  } catch {
    return json(req, cors, { napaka: 'Neveljaven JSON payload.' }, 400);
  }

  const ime = vhod.ime?.trim();
  const priimek = vhod.priimek?.trim();
  const email = vhod.email?.trim().toLowerCase();

  if (!ime || !priimek || !email) {
    return json(req, cors, { napaka: 'Polja ime, priimek in email so obvezna.' }, 400);
  }

  if (!jeVeljavenEmail(email)) {
    return json(req, cors, { napaka: 'Email ni v veljavni obliki.' }, 400);
  }

  if (!vhod.id && !vhod.geslo) {
    return json(req, cors, { napaka: 'Za novega uporabnika je geslo obvezno.' }, 400);
  }

  if (vhod.geslo && !jeMocnoGeslo(vhod.geslo)) {
    return json(
      req,
      cors,
      {
        napaka:
          'Geslo mora imeti najmanj 12 znakov ter vsebovati veliko in malo crko, stevilko in poseben znak.'
      },
      400
    );
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  let uporabnikId = vhod.id;
  let obstojeciProfil: { aktiven: boolean; uporabnik_do: string | null } | null = null;

  if (uporabnikId) {
    const { data: profil, error: napakaProfila } = await adminClient
      .from('uporabniki')
      .select('aktiven, uporabnik_do')
      .eq('id', uporabnikId)
      .maybeSingle();

    if (napakaProfila) {
      return json(req, cors, { napaka: napakaProfila.message }, 400);
    }
    obstojeciProfil = profil ?? null;
  }

  if (uporabnikId) {
    const authPosodobitev: { email?: string; password?: string } = {};

    if (vhod.email) authPosodobitev.email = email;
    if (vhod.geslo) authPosodobitev.password = vhod.geslo;

    if (Object.keys(authPosodobitev).length > 0) {
      const { error: authPosodobitevError } = await adminClient.auth.admin.updateUserById(
        uporabnikId,
        authPosodobitev
      );

      if (authPosodobitevError) {
        return json(req, cors, { napaka: authPosodobitevError.message }, 400);
      }
    }
  } else {
    const { data: novAuth, error: createAuthError } = await adminClient.auth.admin.createUser({
      email,
      password: vhod.geslo,
      email_confirm: true
    });

    if (createAuthError || !novAuth.user) {
      return json(req, cors, { napaka: createAuthError?.message || 'Auth uporabnika ni bilo mogoce ustvariti.' }, 400);
    }

    uporabnikId = novAuth.user.id;
  }

  const aktiven = vhod.aktiven ?? obstojeciProfil?.aktiven ?? true;
  const danes = new Date().toISOString().slice(0, 10);
  const vhodUporabnikDo = datumNizAliNull(vhod.uporabnik_do);
  const uporabnikDo = aktiven
    ? null
    : vhodUporabnikDo ?? obstojeciProfil?.uporabnik_do ?? danes;

  const payload = {
    id: uporabnikId,
    soba_id: vhod.soba_id ?? null,
    ime,
    priimek,
    telefon: vhod.telefon ?? null,
    email,
    aktiven,
    admin: vhod.admin ?? false,
    uporabnik_od: datumNizAliNull(vhod.uporabnik_od) ?? danes,
    uporabnik_do: uporabnikDo,
    posodobil: caller.id
  };

  const { error: profilError } = await adminClient.from('uporabniki').upsert(payload, { onConflict: 'id' });

  if (profilError) {
    return json(req, cors, { napaka: profilError.message }, 400);
  }

  return json(req, cors, { id: uporabnikId, sporocilo: 'Uporabnik uspesno shranjen.' });
});
