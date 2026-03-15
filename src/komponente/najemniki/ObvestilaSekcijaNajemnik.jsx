/**
 * ObvestilaSekcijaNajemnik – najemnikov pregled vseh aktivnih obvestil admina.
 *
 * Prikazuje vsa aktivna obvestila za najemnikovo sobo:
 *  - Neprebrana so vizualno poudarjena
 *  - Prebrana so prikazana z nižjo opaciteto
 *  - Enostavno brskanje z vertikalnim seznamom kartic
 */
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import dayjs from 'dayjs';
import { pridobiVsaAktivnaObvestila } from '../../storitve/podatki';

export default function ObvestilaSekcijaNajemnik() {
  const [obvestila, setObvestila] = useState([]);
  const [nalaganje, setNalaganje] = useState(true);
  const [napaka, setNapaka] = useState('');

  const nalozi = useCallback(async () => {
    setNalaganje(true);
    setNapaka('');
    try {
      const data = await pridobiVsaAktivnaObvestila();
      setObvestila(data);
    } catch (err) {
      setNapaka(err.message || 'Napaka pri nalaganju obvestil.');
    } finally {
      setNalaganje(false);
    }
  }, []);

  useEffect(() => {
    nalozi();
  }, [nalozi]);

  return (
    <Stack spacing={2.5}>
      {/* Glava */}
      <Box>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <CampaignOutlinedIcon sx={{ fontSize: 26, color: 'text.secondary' }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Obvestila
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.25}>
              Sporočila najemodajalca za vašo sobo.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {napaka && (
        <Alert severity="error" onClose={() => setNapaka('')}>
          {napaka}
        </Alert>
      )}

      {nalaganje ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress size={28} />
        </Stack>
      ) : obvestila.length === 0 ? (
        <Box
          sx={{
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            py: 6,
            textAlign: 'center',
          }}
        >
          <CampaignOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary" variant="body2">
            Ni aktivnih obvestil.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {obvestila.map((o, idx) => (
            <ObvestiloKartica key={o.id} obvestilo={o} stevilka={idx + 1} skupaj={obvestila.length} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function ObvestiloKartica({ obvestilo, stevilka, skupaj }) {
  const datum = dayjs(obvestilo.ustvarjeno_ob).format('DD.MM.YYYY HH:mm');
  const neprebrano = !obvestilo.prebrano;

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: neprebrano ? 'primary.main' : 'divider',
        borderRadius: 2,
        p: 2,
        background: neprebrano ? 'rgba(5,150,105,0.04)' : 'background.paper',
        opacity: obvestilo.prebrano ? 0.8 : 1,
        position: 'relative',
      }}
    >
      {/* Glava kartice */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          {neprebrano ? (
            <MarkEmailUnreadOutlinedIcon
              sx={{ fontSize: 18, color: 'primary.main' }}
            />
          ) : (
            <MarkEmailReadOutlinedIcon
              sx={{ fontSize: 18, color: 'text.disabled' }}
            />
          )}
          <Chip
            size="small"
            label={neprebrano ? 'Novo' : 'Prebrano'}
            color={neprebrano ? 'primary' : 'default'}
            variant={neprebrano ? 'filled' : 'outlined'}
            sx={{ fontSize: '0.68rem', height: 20, fontWeight: 600 }}
          />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.disabled">
            {stevilka}/{skupaj}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {datum}
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 1.5 }} />

      {/* Vsebina sporočila */}
      <Typography
        variant="body2"
        sx={{
          whiteSpace: 'pre-wrap',
          lineHeight: 1.7,
          color: neprebrano ? 'text.primary' : 'text.secondary',
          fontWeight: neprebrano ? 500 : 400,
        }}
      >
        {obvestilo.sporocilo}
      </Typography>
    </Box>
  );
}
