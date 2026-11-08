import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, IconButton, Portal, Snackbar, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ObvestilaKontekst = createContext(null);
const TRAJANJE = { success: 5000, info: 5000, warning: 10000, error: 10000 };

export function ObvestilaProvider({ children }) {
  const [sporocila, setSporocila] = useState([]);
  const naslednjiId = useRef(0);
  const zapri = useCallback((id) => {
    setSporocila((prej) => prej.filter((s) => s.id !== id));
  }, []);
  const pokazi = useCallback((besedilo, vrsta = 'info') => {
    const sporocilo = String(besedilo ?? '').trim();
    if (!sporocilo) return;
    const id = ++naslednjiId.current;
    setSporocila((prej) => [
      ...prej.filter((s) => s.besedilo !== sporocilo || s.vrsta !== vrsta),
      { id, besedilo: sporocilo, vrsta }
    ].slice(-3));
  }, []);
  const vrednost = useMemo(() => ({
    pokazi,
    napaka: (besedilo) => pokazi(besedilo, 'error'),
    uspeh: (besedilo) => pokazi(besedilo, 'success'),
    opozorilo: (besedilo) => pokazi(besedilo, 'warning'),
    info: (besedilo) => pokazi(besedilo, 'info')
  }), [pokazi]);

  return (
    <ObvestilaKontekst.Provider value={vrednost}>
      {children}
      {sporocila.length > 0 && (
        <ObvestilaPrikaz sporocila={sporocila} zapri={zapri} />
      )}
    </ObvestilaKontekst.Provider>
  );
}

// Keep announcements and their close buttons inside the active modal's accessible tree.
function najdiCilj() {
  const dialogi = [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')];
  return dialogi.filter((d) => !d.closest('[aria-hidden="true"]')).at(-1) ?? document.body;
}

function ObvestilaPrikaz({ sporocila, zapri }) {
  const [cilj, setCilj] = useState(najdiCilj);
  useEffect(() => {
    const posodobi = () => setCilj(najdiCilj());
    const opazovalec = new MutationObserver(posodobi);
    opazovalec.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-hidden'] });
    posodobi();
    return () => opazovalec.disconnect();
  }, []);

  return (
    <Portal container={cilj}>
      <Stack spacing={1} sx={{
        position: 'fixed', zIndex: (tema) => tema.zIndex.tooltip + 1,
        top: 'max(16px, env(safe-area-inset-top))',
        right: 'max(16px, env(safe-area-inset-right))',
        width: { xs: 'calc(100% - 32px)', sm: 400 },
        maxWidth: 'calc(100% - 32px)', pointerEvents: 'none'
      }}>
        {sporocila.map(({ id, besedilo, vrsta }) => (
          <Snackbar
            key={id}
            open
            autoHideDuration={TRAJANJE[vrsta]}
            resumeHideDuration={TRAJANJE[vrsta]}
            onClose={(dogodek, razlog) => {
              if (razlog === 'clickaway' || dogodek?.defaultPrevented) return;
              if (razlog === 'escapeKeyDown') dogodek.preventDefault();
              zapri(id);
            }}
            sx={{ position: 'static', transform: 'none', width: '100%', pointerEvents: 'auto' }}
          >
            <Alert
              severity={vrsta}
              role={vrsta === 'error' || vrsta === 'warning' ? 'alert' : 'status'}
              aria-atomic="true"
              action={<IconButton size="small" color="inherit" aria-label="Zapri obvestilo" onClick={() => zapri(id)}><CloseIcon fontSize="small" /></IconButton>}
              sx={{
                width: '100%', minWidth: 0, alignItems: 'flex-start',
                bgcolor: 'background.paper', color: 'text.primary',
                border: '1px solid', borderColor: 'divider',
                borderLeft: '4px solid', borderLeftColor: `${vrsta}.main`,
                borderRadius: 2, boxShadow: '0 8px 28px rgba(15, 23, 42, 0.16)',
                py: 1, px: 1.5,
                '& .MuiAlert-message': { fontSize: '0.8125rem', lineHeight: 1.5, overflowWrap: 'anywhere' },
                '& .MuiAlert-action': { pt: 0.25 }
              }}
            >
              <Box component="span">{besedilo}</Box>
            </Alert>
          </Snackbar>
        ))}
      </Stack>
    </Portal>
  );
}

export function useObvestila() {
  const obvestila = useContext(ObvestilaKontekst);
  if (!obvestila) throw new Error('useObvestila mora biti znotraj ObvestilaProvider.');
  return obvestila;
}
