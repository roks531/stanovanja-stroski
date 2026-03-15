/**
 * Sekcija "Pregled & Vnos" za najemnika.
 * Prikazuje trenutne stroške, vnos števcev in razčlenitev stroškov.
 */
import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import WhatshotOutlinedIcon from '@mui/icons-material/WhatshotOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import SearchableSelect from '../SearchableSelect';
import StrosekVrstica from './StrosekVrstica';

export default function PregledSekcija({
  prijavljenNaziv,
  sobaNaziv,
  prikaziPogodbo,
  pogodbaOdFormat,
  pogodbaDoFormat,
  moznostiObdobijZaVnos,
  imaVodniStevec,
  denar,
  trenutniPrikaz,
  vnosStevca,
  spremeniObdobjeVnosa,
  jeOgrevanjeZaklenjeno,
  sporociloZaklepaOgrevanja,
  jeObdobjeZeOddano,
  sporociloZeOddano,
  predogledStevca,
  setVnosStevca,
  napakaStevec,
  uspehStevec,
  shranjevanjeStevca,
  potrjevanjeObracuna,
  potrdiObracun
}) {
  const [dialogPotrditevOdprt, setDialogPotrditevOdprt] = useState(false);
  const obdelavaPotrditve = shranjevanjeStevca || potrjevanjeObracuna;
  const imenaMesecov = [
    'januar',
    'februar',
    'marec',
    'april',
    'maj',
    'junij',
    'julij',
    'avgust',
    'september',
    'oktober',
    'november',
    'december'
  ];
  const nazivObdobjaPotrditve = `${imenaMesecov[Number(vnosStevca.mesec) - 1] ?? String(vnosStevca.mesec)} ${vnosStevca.leto}`;

  async function potrdiIzDialoga() {
    setDialogPotrditevOdprt(false);
    await potrdiObracun();
  }

  return (
    <Stack spacing={2.5}>
      {/* Pozdravna glava */}
      <Box>
        <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
          Dober dan, {prijavljenNaziv.split(' ')[0]}!
        </Typography>
        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
          <Chip size="small" color="primary" icon={<HomeWorkOutlinedIcon sx={{ fontSize: 13 }} />} label={`Soba: ${sobaNaziv}`} />
        </Stack>
        {prikaziPogodbo && (
          <Box
            sx={{
              mt: 1.25,
              px: 1.25,
              py: 1,
              borderRadius: '8px',
              border: '1px solid rgba(15,23,42,0.09)',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.75} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Stack direction="row" spacing={0.6} alignItems="center">
                <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}
                >
                  Veljavnost pogodbe
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {pogodbaOdFormat} - {pogodbaDoFormat}
              </Typography>
            </Stack>
          </Box>
        )}
      </Box>

      {/* Statistične kartice */}
      {trenutniPrikaz && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={1.5} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
            Aktualni mesečni stroški
          </Typography>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                  color: '#fff',
                  boxShadow: '0 8px 24px rgba(79,70,229,0.25)'
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.75, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.68rem' }}>
                  Skupaj ta mesec
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, letterSpacing: '-0.02em' }}>
                  {denar(trenutniPrikaz.skupaj)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.65 }}>
                  Ocena – brez potrjenega obračuna
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      <Grid container spacing={2.5}>
        {/* Levo: vnos števcev */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="kartica-jeklo" sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <SpeedOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="h6">Vnos stanja števcev</Typography>
                  </Stack>
                  <Stack spacing={0.75}>
                    <Stack direction="row" spacing={0.6} alignItems="center">
                      <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}
                      >
                        Obračunsko obdobje
                      </Typography>
                    </Stack>
                    <Box sx={{ width: { xs: '100%', sm: 220 } }}>
                      <SearchableSelect
                        label="Obdobje"
                        value={`${vnosStevca.mesec}|${vnosStevca.leto}`}
                        onChange={spremeniObdobjeVnosa}
                        options={moznostiObdobijZaVnos}
                        disableClearable
                      />
                    </Box>
                  </Stack>
                </Box>

                {jeOgrevanjeZaklenjeno && (
                  <Alert severity="warning" sx={{ borderRadius: '6px' }}>
                    {sporociloZaklepaOgrevanja}
                  </Alert>
                )}
                {jeObdobjeZeOddano && (
                  <Alert severity="info" sx={{ borderRadius: '6px' }}>
                    {sporociloZeOddano}
                  </Alert>
                )}

                <Box sx={{ p: 1.5, borderRadius: '8px', border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.04)' }}>
                  <Stack direction="row" alignItems="center" spacing={0.75} mb={1.25}>
                    <BoltOutlinedIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                    <Typography variant="subtitle2" fontWeight={700}>Elektrika</Typography>
                  </Stack>
                  <Grid container spacing={1}>
                    <Grid size={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Prejšnje stanje"
                        disabled
                        value={predogledStevca.prejsnjeElektrike}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography variant="caption" color="text.secondary">kWh</Typography>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid size={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Novo stanje *"
                        type="number"
                        disabled={jeOgrevanjeZaklenjeno}
                        value={vnosStevca.stanje_elektrike}
                        onChange={(e) => setVnosStevca((p) => ({ ...p, stanje_elektrike: e.target.value }))}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography variant="caption" color="text.secondary">kWh</Typography>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                  </Grid>
                  {predogledStevca.novoElektrike !== null && Number.isFinite(predogledStevca.novoElektrike) && (
                    <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
                      <Chip size="small" color="warning" label={`Poraba: ${predogledStevca.porabaElektrike} kWh`} />
                      <Chip size="small" color="warning" label={`Strošek: ${denar(predogledStevca.strosekElektrike)}`} />
                    </Stack>
                  )}
                </Box>

                {imaVodniStevec && (
                  <Box sx={{ p: 1.5, borderRadius: '8px', border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.04)' }}>
                    <Stack direction="row" alignItems="center" spacing={0.75} mb={1.25}>
                      <WaterDropOutlinedIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
                      <Typography variant="subtitle2" fontWeight={700}>Voda</Typography>
                    </Stack>
                    <Grid container spacing={1}>
                      <Grid size={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Prejšnje stanje"
                          disabled
                          value={predogledStevca.prejsnjeVode}
                          InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption" color="text.secondary">m³</Typography></InputAdornment> }}
                        />
                      </Grid>
                      <Grid size={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Novo stanje *"
                          type="number"
                          disabled={jeOgrevanjeZaklenjeno}
                          value={vnosStevca.stanje_vode}
                          onChange={(e) => setVnosStevca((p) => ({ ...p, stanje_vode: e.target.value }))}
                          InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption" color="text.secondary">m³</Typography></InputAdornment> }}
                        />
                      </Grid>
                    </Grid>
                    {predogledStevca.novoVode !== null && Number.isFinite(predogledStevca.novoVode) && (
                      <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
                        <Chip size="small" color="info" label={`Poraba: ${predogledStevca.porabaVode} m³`} />
                        <Chip size="small" color="info" label={`Strošek: ${denar(predogledStevca.strosekVode)}`} />
                      </Stack>
                    )}
                  </Box>
                )}

                {napakaStevec && <Alert severity="error">{napakaStevec}</Alert>}
                {uspehStevec && <Alert severity="success">{uspehStevec}</Alert>}

                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => setDialogPotrditevOdprt(true)}
                  disabled={obdelavaPotrditve || jeOgrevanjeZaklenjeno || jeObdobjeZeOddano}
                  startIcon={obdelavaPotrditve ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {obdelavaPotrditve ? 'Potrjujem...' : 'Potrdi'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Desno: razčlenitev */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="kartica-jeklo" sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={0.25}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                  <ReceiptOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="h6">Razčlenitev stroškov</Typography>
                </Stack>

                {trenutniPrikaz ? (
                  <>
                    <StrosekVrstica
                      label="Elektrika"
                      vrednost={denar(trenutniPrikaz.strosekElektrike)}
                      ikona={<BoltOutlinedIcon sx={{ fontSize: 15, color: '#f59e0b' }} />}
                    />
                    <StrosekVrstica
                      label="Voda"
                      vrednost={denar(trenutniPrikaz.strosekVode)}
                      ikona={<WaterDropOutlinedIcon sx={{ fontSize: 15, color: '#3b82f6' }} />}
                    />
                    <StrosekVrstica
                      label="Ogrevanje"
                      vrednost={denar(trenutniPrikaz.strosekOgrevanja)}
                      ikona={<WhatshotOutlinedIcon sx={{ fontSize: 15, color: '#d97706' }} />}
                    />

                    <Divider sx={{ my: 1 }} />

                    <StrosekVrstica label="Najemnina" vrednost={denar(trenutniPrikaz.najemnina)} />
                    <StrosekVrstica label="Skupni stroški" vrednost={denar(trenutniPrikaz.strosekSkupni)} />
                    <StrosekVrstica label="NetTV" vrednost={denar(trenutniPrikaz.strosekNeta)} />
                    <StrosekVrstica label="Fiksni" vrednost={denar(trenutniPrikaz.strosekTv)} />

                    <Divider sx={{ my: 1 }} />

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        border: '1px solid rgba(15,23,42,0.09)'
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={700}>SKUPAJ</Typography>
                      <Typography variant="h5" fontWeight={800} color="primary.main">
                        {denar(trenutniPrikaz.skupaj)}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Alert severity="info" variant="outlined">Za izračun manjka odčitek ali cena.</Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={dialogPotrditevOdprt}
        onClose={() => {
          if (!obdelavaPotrditve) setDialogPotrditevOdprt(false);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Shrani in potrdi obračun</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Ali želite shraniti števce in potrditi obračun za <strong>{nazivObdobjaPotrditve}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogPotrditevOdprt(false)} disabled={obdelavaPotrditve}>
            Prekliči
          </Button>
          <Button variant="contained" className="gumb-jeklo" onClick={potrdiIzDialoga} disabled={obdelavaPotrditve}>
            Potrdi
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
