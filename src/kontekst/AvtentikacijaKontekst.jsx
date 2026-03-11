import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../storitve/supabase';
import { odjava as odjavaStoritev, pridobiProfil, spremeniGeslo as spremeniGesloStoritev } from '../storitve/avtentikacija';

const AvtentikacijaKontekst = createContext(null);

export function AvtentikacijaProvider({ children }) {
  const [seja, setSeja] = useState(null);
  const [profil, setProfil] = useState(null);
  const [nalaganje, setNalaganje] = useState(true);
  const [prijavaInfo, setPrijavaInfo] = useState('');
  const obdelavaIdRef = useRef(0);
  const mountedRef = useRef(true);
  const sejaRef = useRef(null);

  async function obdelaSejo(naslednjaSeja, moznosti = {}) {
    const { prikaziNalaganje = true } = moznosti;
    const obdelavaId = ++obdelavaIdRef.current;

    if (!mountedRef.current) return;
    if (prikaziNalaganje) {
      setNalaganje(true);
    }
    setSeja(naslednjaSeja ?? null);

    const uporabnikId = naslednjaSeja?.user?.id;

    if (!uporabnikId) {
      if (!mountedRef.current || obdelavaId !== obdelavaIdRef.current) return;
      setProfil(null);
      if (prikaziNalaganje) {
        setNalaganje(false);
      }
      return;
    }

    try {
      const profilPodatki = await pridobiProfil(uporabnikId);

      if (!mountedRef.current || obdelavaId !== obdelavaIdRef.current) return;

      if (!profilPodatki || !profilPodatki.aktiven) {
        if (profilPodatki && !profilPodatki.aktiven) {
          setPrijavaInfo(
            'Vas racun ni vec aktiven, ker najem ni vec veljaven. Za dodatne informacije kontaktirajte skrbnika.'
          );
        }
        setSeja(null);
        setProfil(null);
        void supabase.auth.signOut({ scope: 'local' });
        return;
      }

      setPrijavaInfo('');
      setProfil(profilPodatki);
    } catch (err) {
      console.error('Napaka pri branju profila uporabnika:', err);
      if (!mountedRef.current || obdelavaId !== obdelavaIdRef.current) return;
      setSeja(null);
      setProfil(null);
      void supabase.auth.signOut({ scope: 'local' });
    } finally {
      if (!mountedRef.current || obdelavaId !== obdelavaIdRef.current) return;
      if (prikaziNalaganje) {
        setNalaganje(false);
      }
    }
  }

  useEffect(() => {
    sejaRef.current = seja;
  }, [seja]);

  useEffect(() => {
    mountedRef.current = true;

    async function init() {
      const { data } = await supabase.auth.getSession();
      await obdelaSejo(data.session ?? null);
    }

    void init();

    const { data: listener } = supabase.auth.onAuthStateChange((dogodek, naslednjaSeja) => {
      if (dogodek === 'TOKEN_REFRESHED') {
        if (!mountedRef.current) return;
        setSeja(naslednjaSeja ?? null);
        return;
      }

      // INITIAL_SESSION is already handled by init() above — skip it to avoid
      // a race where the second obdelaSejo call bumps obdelavaIdRef and the
      // first's finally block never clears the spinner.
      if (dogodek === 'INITIAL_SESSION') return;

      const prejSeja = sejaRef.current;
      const prejUserId = prejSeja?.user?.id ?? null;
      const novUserId = naslednjaSeja?.user?.id ?? null;
      const jeIstiUporabnik = Boolean(prejUserId && novUserId && prejUserId === novUserId);

      // Na vrnitvi v browser tab Supabase pogosto sprozi SIGNED_IN za isto sejo.
      // Takrat osvežimo profil "tiho", brez globalnega loaderja, da UI ne utripa.
      const prikaziNalaganje =
        dogodek === 'SIGNED_OUT' ||
        (dogodek === 'SIGNED_IN' && !jeIstiUporabnik);
      void obdelaSejo(naslednjaSeja ?? null, { prikaziNalaganje });
    });

    return () => {
      mountedRef.current = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function osveziProfil(moznosti = { prikaziNalaganje: false }) {
    const { data } = await supabase.auth.getSession();
    await obdelaSejo(data.session ?? null, moznosti);
  }

  async function odjava() {
    setPrijavaInfo('');
    try {
      await odjavaStoritev();
    } catch (err) {
      console.error('Napaka pri odjavi:', err);
      // Fallback: ne pusti uporabnika v "zalepljeni" seji, ce odjava odpove.
      setSeja(null);
      setProfil(null);
      setNalaganje(false);
    }
  }

  async function spremeniGeslo(novoGeslo) {
    await spremeniGesloStoritev(novoGeslo);
  }

  function pocistiPrijavaInfo() {
    setPrijavaInfo('');
  }

  const vrednost = useMemo(
    () => ({ seja, profil, nalaganje, prijavaInfo, osveziProfil, odjava, spremeniGeslo, pocistiPrijavaInfo }),
    [seja, profil, nalaganje, prijavaInfo]
  );

  return <AvtentikacijaKontekst.Provider value={vrednost}>{children}</AvtentikacijaKontekst.Provider>;
}

export function useAvtentikacija() {
  const ctx = useContext(AvtentikacijaKontekst);
  if (!ctx) {
    throw new Error('useAvtentikacija mora biti znotraj AvtentikacijaProvider.');
  }
  return ctx;
}
