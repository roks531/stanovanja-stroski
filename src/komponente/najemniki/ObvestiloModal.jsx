/**
 * ObvestiloModal – najemnikov modal za prikaz neprebranih obvestil (enkrat).
 *
 * Če je eno obvestilo: pokažemo ga takoj.
 * Če je več: pokažemo korakovnik (1 / N) z gumboma ← → za listanje.
 * Vsako zaprtje/potrditev shrani v prebrana_obvestila (1 zapis).
 * Ko najemnik zapre zadnje, se modal avtomatsko zapre.
 */
import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import { oznaciBranoObvestilo } from '../../storitve/podatki';

/**
 * Parametri:
 *  obvestila   – seznam { id, sporocilo, ustvarjeno_ob }
 *  uporabnikId – auth uid prijavljenega najemnika
 *  onVsaPrebrana – povratni klic, ko so vsa zaprta (zapre modal na začetku)
 */
export default function ObvestiloModal({ obvestila, uporabnikId, onVsaPrebrana }) {
  // Lokalna kopija – odstranjujemo prebrana iz seznama
  const [seznam, setSeznam] = useState(obvestila ?? []);
  const [indeks, setIndeks] = useState(0);
  const [zapiranje, setZapiranje] = useState(false);

  if (!seznam.length) return null;

  const trenutno = seznam[indeks];
  const skupaj = seznam.length;
  const jeEno = skupaj === 1;

  async function zapriTrenutno() {
    setZapiranje(true);
    try {
      await oznaciBranoObvestilo(trenutno.id, uporabnikId);
    } catch {
      // Napako tiho ignoriramo – modal se vseeno zapre
    } finally {
      setZapiranje(false);
    }

    const novo = seznam.filter((o) => o.id !== trenutno.id);
    if (novo.length === 0) {
      onVsaPrebrana?.();
    } else {
      setSeznam(novo);
      setIndeks((prev) => Math.min(prev, novo.length - 1));
    }
  }

  function pojdiNa(noviIndeks) {
    setIndeks(Math.max(0, Math.min(noviIndeks, seznam.length - 1)));
  }

  return (
    <Dialog
      open
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      onClose={() => {}} // preprečimo zaprtje s klikom zunaj
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <CampaignOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
            Obvestilo
          </Typography>
          {/* Korakovnik – prikazan samo kadar je več kot 1 obvestilo */}
          {!jeEno && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <IconButton
                size="small"
                onClick={() => pojdiNa(indeks - 1)}
                disabled={indeks === 0}
              >
                <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 14 }} />
              </IconButton>
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ minWidth: 36, textAlign: 'center' }}
              >
                {indeks + 1} / {skupaj}
              </Typography>
              <IconButton
                size="small"
                onClick={() => pojdiNa(indeks + 1)}
                disabled={indeks === skupaj - 1}
              >
                <ArrowForwardIosOutlinedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {/* Navigacijske pike za orientacijo */}
        {!jeEno && (
          <Stack direction="row" spacing={0.5} justifyContent="center" mb={1.5}>
            {seznam.map((o, i) => (
              <Box
                key={o.id}
                onClick={() => pojdiNa(i)}
                sx={{
                  width: i === indeks ? 20 : 8,
                  height: 8,
                  borderRadius: '4px',
                  bgcolor: i === indeks ? 'primary.main' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'width 0.2s ease',
                  flexShrink: 0,
                }}
              />
            ))}
          </Stack>
        )}

        <Typography
          sx={{
            fontSize: '0.95rem',
            lineHeight: 1.65,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: '#1e293b',
          }}
        >
          {trenutno.sporocilo}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        {!jeEno && (
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
            {skupaj - 1 > 0 ? `Še ${skupaj - 1} neprebranih` : ''}
          </Typography>
        )}
        <Button
          variant="contained"
          className="gumb-jeklo"
          onClick={zapriTrenutno}
          disabled={zapiranje}
          startIcon={zapiranje ? <CircularProgress size={14} color="inherit" /> : null}
        >
          {jeEno || indeks === skupaj - 1 ? 'Razumem, zapri' : 'Razumem'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
