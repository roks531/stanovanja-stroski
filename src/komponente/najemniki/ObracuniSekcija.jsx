/**
 * Sekcija "Obračuni" za najemnika.
 * Prikaz kartic, filtri in paginacija.
 */
import {
  Alert,
  Box,
  Chip,
  Grid,
  Pagination,
  Stack,
  Typography,
  Divider
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import SearchableSelect from '../SearchableSelect';

export default function ObracuniSekcija({
  vrsticePlacila,
  racuniFiltrirani,
  racuniZaPrikaz,
  stStraniRacunov,
  stranRacunov,
  setStranRacunov,
  karticNaStran,
  filterLeto,
  setFilterLeto,
  filterStatus,
  setFilterStatus,
  letaRacunov,
  setIzbranRacunId,
  setPodrobnostiOdprte
}) {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
          <Typography variant="h5" fontWeight={800}>Moji obračuni</Typography>
          <Chip size="small" color="primary" label={`${vrsticePlacila.length} obračunov`} />
          <Chip size="small" color="success" label={`Potrjeno: ${vrsticePlacila.filter((r) => r.placano_bool).length}`} />
          <Chip size="small" color="warning" label={`Odprto: ${vrsticePlacila.filter((r) => !r.placano_bool).length}`} />
        </Stack>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Klikni obračun za podrobno razčlenitev.
        </Typography>
      </Box>

      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ maxWidth: 500 }}>
        <SearchableSelect
          label="Leto"
          value={filterLeto}
          onChange={setFilterLeto}
          options={[
            { value: '', label: 'Vsa leta' },
            ...letaRacunov.map((leto) => ({ value: leto, label: String(leto) }))
          ]}
          sx={{ minWidth: 140, flex: 1 }}
        />
        <SearchableSelect
          label="Status"
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: '', label: 'Vsi' },
            { value: 'odprto', label: 'Odprti' },
            { value: 'placano', label: 'Potrjeni' }
          ]}
          sx={{ minWidth: 140, flex: 1 }}
        />
      </Stack>

      {racuniFiltrirani.length > 0 && (
        <Typography variant="caption" color="text.secondary">
          Prikazujem {Math.min((stranRacunov - 1) * karticNaStran + 1, racuniFiltrirani.length)}–
          {Math.min(stranRacunov * karticNaStran, racuniFiltrirani.length)} od {racuniFiltrirani.length}
        </Typography>
      )}

      {racuniFiltrirani.length === 0 ? (
        <Alert severity="info" variant="outlined">Trenutno ni shranjenih obračunov.</Alert>
      ) : (
        <>
          <Grid container spacing={1.5}>
            {racuniZaPrikaz.map((racun) => (
              <Grid item xs={12} sm={6} md={4} key={racun.id}>
                <Box
                  onClick={() => {
                    setIzbranRacunId(racun.id);
                    setPodrobnostiOdprte(true);
                  }}
                  sx={{
                    border: '1px solid',
                    borderColor: racun.placano_bool ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.30)',
                    borderRadius: '10px',
                    p: 2,
                    background: racun.placano_bool ? 'rgba(240,253,244,0.6)' : 'rgba(255,251,235,0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.14s ease',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(15,23,42,0.10)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <Stack spacing={1.25}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontSize="0.72rem" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Obdobje
                        </Typography>
                        <Typography fontWeight={700} fontSize="1rem">{racun.obdobje}</Typography>
                      </Box>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.3,
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          ...(racun.placano_bool
                            ? { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }
                            : { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' })
                        }}
                      >
                        {racun.placano_bool ? <CheckCircleOutlineIcon sx={{ fontSize: 12 }} /> : <RadioButtonUncheckedIcon sx={{ fontSize: 12 }} />}
                        {racun.placano_bool ? 'Potrjeno' : 'Odprto'}
                      </Box>
                    </Stack>

                    <Divider sx={{ borderColor: racun.placano_bool ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)' }} />

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">Skupaj</Typography>
                      <Typography fontWeight={800} fontSize="1.1rem" color="text.primary">{racun.skupni_strosek}</Typography>
                    </Stack>

                    {racun.datum_placila !== '-' && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">Potrjeno</Typography>
                        <Typography variant="caption" fontWeight={600}>{racun.datum_placila}</Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>

          {stStraniRacunov > 1 && (
            <Stack direction="row" justifyContent="center">
              <Pagination
                count={stStraniRacunov}
                page={stranRacunov}
                onChange={(_, nova) => setStranRacunov(nova)}
                color="primary"
                size="small"
                shape="rounded"
              />
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
}
