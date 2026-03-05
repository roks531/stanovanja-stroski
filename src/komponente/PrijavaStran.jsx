/**
 * PrijavaStran – stran za prijavo v sistem.
 *
 * Vizualno: temno ozadje (Navy gradient) + svetla kartica v sredini.
 * Logika:
 *   - Največ MAX_POSKUSI napačnih prijav → začasna blokada
 *   - Supabase avtentikacija prek storitve `prijava()`
 *   - Obvestila prek Alert in Snackbar
 */
import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { prijava } from '../storitve/avtentikacija';
import { useAvtentikacija } from '../kontekst/AvtentikacijaKontekst';

const MAX_POSKUSI = 5;
const ZAKLEP_SEKUNDE = 15;

export default function PrijavaStran() {
  const { prijavaInfo, pocistiPrijavaInfo } = useAvtentikacija();
  const [email, setEmail] = useState('');
  const [geslo, setGeslo] = useState('');
  const [gesloVidno, setGesloVidno] = useState(false);
  const [nalaganje, setNalaganje] = useState(false);
  const [napaka, setNapaka] = useState('');
  const [poskusi, setPoskusi] = useState(0);
  const [zaklepDo, setZaklepDo] = useState(null);

  const trenutnoZaklenjeno = zaklepDo && Date.now() < zaklepDo;

  async function oddaj(e) {
    e.preventDefault();

    if (trenutnoZaklenjeno) {
      const sekunde = Math.ceil((zaklepDo - Date.now()) / 1000);
      setNapaka(`Prijava je začasno zaklenjena. Počakajte ${sekunde}s.`);
      return;
    }

    setNapaka('');
    pocistiPrijavaInfo();
    setNalaganje(true);

    try {
      await prijava(email.trim(), geslo);
      setPoskusi(0);
      setZaklepDo(null);
    } catch (err) {
      const noviPoskusi = poskusi + 1;
      setPoskusi(noviPoskusi);

      if (noviPoskusi >= MAX_POSKUSI) {
        setZaklepDo(Date.now() + ZAKLEP_SEKUNDE * 1000);
        setPoskusi(0);
        setNapaka(`Preveč neuspešnih prijav. Sistem je zaklenjen ${ZAKLEP_SEKUNDE} sekund.`);
      } else {
        setNapaka(err.message || 'Prijava ni uspela.');
      }
    } finally {
      setNalaganje(false);
    }
  }

  return (
    /* ── Temno ozadje z mrežo in svetlečo piko ── */
    <Box className="prijava-ozadje">
      <Box className="prijava-mreza" />

      <Paper elevation={0} className="prijava-kartica">
        <Stack spacing={3} component="form" onSubmit={oddaj}>

          {/* ── Logo / Zgornja glava ── */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
              {/* Barvit kvadrat namesto monokromatske ikone */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <HomeOutlinedIcon sx={{ fontSize: 20, color: '#fff' }} />
              </Box>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                Stanovanja Dovč
              </Typography>
            </Stack>

            <Typography variant="h4" fontWeight={800} color="text.primary" lineHeight={1.15}>
              Dobrodošli nazaj
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Vpišite vaše podatke za dostop do sistema.
            </Typography>
          </Box>

          <Divider />

          {/* ── Obvestilo ob predhodni akciji (reset gesla ipd.) ── */}
          {prijavaInfo && (
            <Alert severity="info" variant="outlined" sx={{ borderRadius: '6px' }}>
              {prijavaInfo}
            </Alert>
          )}

          {/* ── Email polje ── */}
          <Stack spacing={2}>
            <TextField
              label="E-poštni naslov"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* ── Geslo polje z vidljivostjo ── */}
            <TextField
              label="Geslo"
              type={gesloVidno ? 'text' : 'password'}
              value={geslo}
              onChange={(e) => setGeslo(e.target.value)}
              required
              autoComplete="current-password"
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setGesloVidno((p) => !p)}
                      edge="end"
                      tabIndex={-1}
                      sx={{ color: 'text.secondary' }}
                    >
                      {gesloVidno
                        ? <VisibilityOffIcon fontSize="small" />
                        : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          {/* ── Glavna prijavna tipka ── */}
          <Button
            variant="contained"
            color="primary"
            type="submit"
            size="large"
            fullWidth
            disabled={nalaganje || Boolean(trenutnoZaklenjeno)}
            startIcon={nalaganje ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{
              py: 1.4,
              fontSize: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            {nalaganje ? 'Preverjanje...' : 'Vstopi v sistem'}
          </Button>

        </Stack>
      </Paper>

      {/* ── Snackbar za napake ── */}
      <Snackbar
        open={Boolean(napaka)}
        autoHideDuration={5000}
        onClose={() => setNapaka('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          onClose={() => setNapaka('')}
          variant="filled"
          sx={{ borderRadius: '6px', minWidth: 300 }}
        >
          {napaka}
        </Alert>
      </Snackbar>
    </Box>
  );
}
