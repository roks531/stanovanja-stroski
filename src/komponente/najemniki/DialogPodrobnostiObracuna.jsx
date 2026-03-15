/**
 * Pogovorno okno s podrobno razčlenitvijo posameznega obračuna.
 */
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography
} from '@mui/material';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import StrosekVrstica from './StrosekVrstica';

export default function DialogPodrobnostiObracuna({
  podrobnostiOdprte,
  setPodrobnostiOdprte,
  izbranRacun,
  denar,
  skupniZnesekRacuna
}) {
  return (
    <Dialog
      open={podrobnostiOdprte && Boolean(izbranRacun)}
      onClose={() => setPodrobnostiOdprte(false)}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={700}>Razčlenitev</Typography>
          {izbranRacun && (
            <Box
              sx={{
                px: 1,
                py: 0.3,
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                ...(izbranRacun.placano_bool
                  ? { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }
                  : { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' })
              }}
            >
              {izbranRacun.obdobje} · {izbranRacun.placano_bool ? 'Potrjeno' : 'Odprto'}
            </Box>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {izbranRacun ? (
          <Stack spacing={0.75}>
            <StrosekVrstica label="Najemnina" vrednost={denar(izbranRacun.najemnina)} />
            <StrosekVrstica label="Skupni stroški" vrednost={denar(izbranRacun.strosek_skupni)} />
            <StrosekVrstica label="NetTV" vrednost={denar(izbranRacun.strosek_neta)} />
            <StrosekVrstica label="Fiksni" vrednost={denar(izbranRacun.strosek_tv)} />
            <StrosekVrstica label="Ogrevanje" vrednost={denar(izbranRacun.strosek_ogrevanja)} />
            <StrosekVrstica
              label="Elektrika"
              vrednost={denar(izbranRacun.strosek_elektrike)}
              ikona={<BoltOutlinedIcon sx={{ fontSize: 14, color: '#f59e0b' }} />}
            />
            <StrosekVrstica
              label="Voda"
              vrednost={denar(izbranRacun.strosek_vode)}
              ikona={<WaterDropOutlinedIcon sx={{ fontSize: 14, color: '#3b82f6' }} />}
            />
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, px: 1, borderRadius: '6px', background: '#f8fafc' }}>
              <Typography fontWeight={700}>SKUPAJ</Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                {skupniZnesekRacuna(izbranRacun)}
              </Typography>
            </Box>
            <Stack spacing={0.5} sx={{ pt: 0.5 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Izračun</Typography>
                <Typography variant="caption">{izbranRacun.datum_izracuna}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Potrjeno</Typography>
                <Typography variant="caption" fontWeight={600}>
                  {izbranRacun.placano_bool ? `Potrjeno (${izbranRacun.datum_placila})` : 'Ni potrjeno'}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        ) : (
          <Alert severity="info">Izberi obračun za prikaz podrobnosti.</Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setPodrobnostiOdprte(false)} color="primary">Zapri</Button>
      </DialogActions>
    </Dialog>
  );
}
