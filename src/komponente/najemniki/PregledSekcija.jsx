/**
 * Sekcija "Pregled & Vnos" za najemnika.
 * Prikazuje trenutne stroške, vnos števcev in razčlenitev stroškov.
 */
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
import StrosekVrstica from './StrosekVrstica';

export default function PregledSekcija({
  prijavljenNaziv,
  sobaNaziv,
  imaVodniStevec,
  denar,
  trenutniPrikaz,
  vnosStevca,
  jeOgrevanjeZaklenjeno,
  sporociloZaklepaOgrevanja,
  predogledStevca,
  setVnosStevca,
  napakaStevec,
  uspehStevec,
  shranjevanjeStevca,
  potrjevanjeObracuna,
  shraniStevce,
  potrdiObracun
}) {
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

            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <Box className="stat-kartica">
                <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                  <HomeWorkOutlinedIcon sx={{ fontSize: 14, color: '#059669' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em', fontWeight: 600 }}>
                    Najemnina
                  </Typography>
                </Stack>
                <Typography variant="h6" fontWeight={700}>{denar(trenutniPrikaz.najemnina)}</Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <Box className="stat-kartica">
                <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                  <BoltOutlinedIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em', fontWeight: 600 }}>
                    Elektrika
                  </Typography>
                </Stack>
                <Typography variant="h6" fontWeight={700}>{denar(trenutniPrikaz.strosekElektrike)}</Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <Box className="stat-kartica">
                <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                  <WaterDropOutlinedIcon sx={{ fontSize: 14, color: '#3b82f6' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em', fontWeight: 600 }}>
                    Voda
                  </Typography>
                </Stack>
                <Typography variant="h6" fontWeight={700}>{denar(trenutniPrikaz.strosekVode)}</Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <Box className="stat-kartica">
                <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                  <WhatshotOutlinedIcon sx={{ fontSize: 14, color: '#d97706' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em', fontWeight: 600 }}>
                    Ogrevanje
                  </Typography>
                </Stack>
                <Typography variant="h6" fontWeight={700}>{denar(trenutniPrikaz.strosekOgrevanja)}</Typography>
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
              <Stack component="form" spacing={2} onSubmit={shraniStevce}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <SpeedOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="h6">Vnos stanja števcev</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 12 }} />}
                      label={`Obdobje: ${String(vnosStevca.mesec).padStart(2, '0')}.${vnosStevca.leto}`}
                      variant="outlined"
                      color="primary"
                    />
                  </Stack>
                </Box>

                {jeOgrevanjeZaklenjeno && (
                  <Alert severity="warning" sx={{ borderRadius: '6px' }}>
                    {sporociloZaklepaOgrevanja}
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

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    type="submit"
                    variant="outlined"
                    color="primary"
                    fullWidth
                    disabled={shranjevanjeStevca || potrjevanjeObracuna || jeOgrevanjeZaklenjeno}
                    startIcon={shranjevanjeStevca ? <CircularProgress size={16} color="inherit" /> : null}
                  >
                    {shranjevanjeStevca ? 'Shranjujem...' : 'Shrani števce'}
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={potrdiObracun}
                    disabled={shranjevanjeStevca || potrjevanjeObracuna || jeOgrevanjeZaklenjeno}
                    startIcon={potrjevanjeObracuna ? <CircularProgress size={16} color="inherit" /> : null}
                  >
                    {potrjevanjeObracuna ? 'Potrjujem...' : 'Potrdi obračun'}
                  </Button>
                </Stack>
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

                    <Divider sx={{ my: 1 }} />

                    <StrosekVrstica label="Najemnina" vrednost={denar(trenutniPrikaz.najemnina)} />
                    <StrosekVrstica label="Skupni stroški" vrednost={denar(trenutniPrikaz.strosekSkupni)} />
                    <StrosekVrstica label="NetTV" vrednost={denar(trenutniPrikaz.strosekNeta)} />
                    <StrosekVrstica label="Fiksni" vrednost={denar(trenutniPrikaz.strosekTv)} />
                    <StrosekVrstica label="Ogrevanje" vrednost={denar(trenutniPrikaz.strosekOgrevanja)} />

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
    </Stack>
  );
}
