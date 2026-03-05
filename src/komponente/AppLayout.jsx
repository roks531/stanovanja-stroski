/**
 * AppLayout – skupna postavitev z levim stranskim menijem.
 *
 * Uporablja ga AdminPogled in NajemnikPogled.
 * Na mobitelih je meni skrit v "Drawer" predalu (hamburger ikona).
 * Na namizju je meni vedno viden (zložljiv na ikone).
 *
 * Props:
 *   navigacija  – array menuji: { id, label, ikona: JSX, ikona: ReactElement }
 *   aktivnaSekcija – trenutno aktivna sekcija (id)
 *   onSpremembaSekcije – callback(id) ko user klikne menu item
 *   naslov – napis v glavi menija (npr. "Admin nadzor")
 *   podnaslov – manjši napis pod naslovom (npr. email)
 *   children – vsebina desnega dela
 *   onOdjava – callback za odjavo
 */
import { useState } from 'react';
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

// Ikone
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

// Konstantne vrednosti
const NAV_W = 230;           // širina razširjenega menija
const NAV_W_SM = 60;         // širina zloženega menija (samo ikone)
const HEADER_H = 60;         // višina zgornje vrstice

/* ── Pomožna komponenta: posamezna navigacijska postavka ── */
function NavItem({ item, aktiven, zlozen, onClick }) {
  const vsebina = (
    <Box
      onClick={() => onClick(item.id)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: zlozen ? 0 : 1.5,
        justifyContent: zlozen ? 'center' : 'flex-start',
        px: zlozen ? 0 : 2,
        py: 1.1,
        mx: 1,
        borderRadius: '6px',
        cursor: 'pointer',
        color: aktiven ? '#059669' : '#6b7280',
        backgroundColor: aktiven
          ? '#ecfdf5'
          : 'transparent',
        transition: 'all 0.14s ease',
        '&:hover': {
          backgroundColor: aktiven
            ? '#d1fae5'
            : '#f0fdf4',
          color: aktiven ? '#047857' : '#374151',
        },
      }}
    >
      {/* Ikona */}
      <Box sx={{ display: 'flex', flexShrink: 0, '& svg': { fontSize: 19 }, color: aktiven ? '#059669' : 'inherit' }}>
        {item.ikona}
      </Box>
      {/* Besedilo – vidno samo ko meni ni zloženni */}
      {!zlozen && (
        <Typography variant="body2" fontWeight={aktiven ? 700 : 500} noWrap>
          {item.label}
        </Typography>
      )}
      {/* Ko je zloženni, pokaži piko za aktivni element */}
      {zlozen && aktiven && (
        <Box
          sx={{
            position: 'absolute',
            right: 6,
            width: 4,
            height: 4,
            borderRadius: '50%',
            bgcolor: '#059669',
          }}
        />
      )}
    </Box>
  );

  if (zlozen) {
    // Tooltip z imenom sekcije ko je meni zloženni
    return (
      <Tooltip title={item.label} placement="right">
        <Box sx={{ position: 'relative' }}>{vsebina}</Box>
      </Tooltip>
    );
  }

  return vsebina;
}

/* ── Vsebina stranskega menija ─────────────────────────── */
function MenuVsebina({ navigacija, aktivnaSekcija, onSpremembaSekcije, naslov, podnaslov, onOdjava, zlozen, onZapriDrawer, brandPodnaslov }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#ffffff',
        borderRight: '1px solid rgba(0,0,0,0.07)',
        color: '#374151',
        overflow: 'hidden',
      }}
    >
      {/* Glava menija – logo / aplikacija */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: zlozen ? 0 : 2.5,
          justifyContent: zlozen ? 'center' : 'flex-start',
          height: HEADER_H,
          flexShrink: 0,
          borderBottom: '1px solid rgba(0,0,0,0.07)',
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <HomeOutlinedIcon sx={{ fontSize: 18, color: '#fff' }} />
        </Box>
        {!zlozen && (
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" noWrap>
              Stanovanja Dovč
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {brandPodnaslov ?? 'Administracija'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigacijski elementi */}
      <Box sx={{ flex: 1, py: 1.5, overflowY: 'auto' }}>
        <Stack spacing={0.25}>
          {navigacija.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              aktiven={aktivnaSekcija === item.id}
              zlozen={zlozen}
              onClick={(id) => {
                onSpremembaSekcije(id);
                // Na mobilnem zapri drawer po izbiri
                if (onZapriDrawer) onZapriDrawer();
              }}
            />
          ))}
        </Stack>
      </Box>

      <Divider sx={{ borderColor: 'rgba(0,0,0,0.07)' }} />

      {/* Vrstica z uporabnikom in odjavo */}
      <Box
        sx={{
          px: zlozen ? 0 : 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          justifyContent: zlozen ? 'center' : 'flex-start',
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            fontSize: '0.8rem',
            fontWeight: 700,
            bgcolor: '#d1fae5',
            color: '#059669',
            flexShrink: 0,
          }}
        >
          {(naslov?.charAt(0) ?? '?').toUpperCase()}
        </Avatar>
        {!zlozen && (
          <>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" fontWeight={600} color="text.primary" noWrap display="block">
                {naslov}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {podnaslov}
              </Typography>
            </Box>
            <Tooltip title="Odjava">
              <IconButton size="small" onClick={onOdjava} sx={{ color: '#9ca3af', '&:hover': { color: '#374151' } }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Gumb za odjavo ko je meni zloženni (samo ikona) */}
      {zlozen && (
        <Box sx={{ pb: 1, display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Odjava" placement="right">
            <IconButton size="small" onClick={onOdjava} sx={{ color: '#9ca3af', '&:hover': { color: '#374151' } }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}

/* ── Glavna komponenta AppLayout ───────────────────────── */
export default function AppLayout({
  navigacija = [],
  aktivnaSekcija,
  onSpremembaSekcije,
  naslov = '',
  podnaslov = '',
  children,
  onOdjava,
  brandPodnaslov,
}) {
  const muiTema = useTheme();
  const jeMobilen = useMediaQuery(muiTema.breakpoints.down('md'));
  // je meni zloženni (le ikone) na namizju
  const [zlozen, setZlozen] = useState(false);
  // je drawer odprt na mobilnem
  const [drawerOdprt, setDrawerOdprt] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* === NAMIZNI STRANSKI MENI === */}
      {!jeMobilen && (
        <Box
          sx={{
            width: zlozen ? NAV_W_SM : NAV_W,
            flexShrink: 0,
            transition: 'width 0.22s ease',
            position: 'sticky',
            top: 0,
            height: '100vh',
            zIndex: 100,
            boxShadow: '1px 0 0 rgba(0,0,0,0.07)',
          }}
        >
          <MenuVsebina
            navigacija={navigacija}
            aktivnaSekcija={aktivnaSekcija}
            onSpremembaSekcije={onSpremembaSekcije}
            naslov={naslov}
            podnaslov={podnaslov}
            onOdjava={onOdjava}
            zlozen={zlozen}
            brandPodnaslov={brandPodnaslov}
          />
          {/* Gumb za zlaganje/razlaganje stranskega menija */}
          <Box
            sx={{
              position: 'absolute',
              top: HEADER_H / 2,
              right: -14,
              transform: 'translateY(-50%)',
            }}
          >
            <Tooltip title={zlozen ? 'Razširi meni' : 'Zloži meni'}>
              <IconButton
                size="small"
                onClick={() => setZlozen((p) => !p)}
                sx={{
                  bgcolor: '#fff',
                  border: '1px solid rgba(15,23,42,0.12)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  width: 28,
                  height: 28,
                  '&:hover': { bgcolor: '#f1f5f9' },
                }}
              >
                {zlozen
                  ? <MenuIcon sx={{ fontSize: 15 }} />
                  : <MenuOpenIcon sx={{ fontSize: 15 }} />
                }
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* === MOBILNI DRAWER === */}
      {jeMobilen && (
        <Drawer
          open={drawerOdprt}
          onClose={() => setDrawerOdprt(false)}
          PaperProps={{ sx: { width: NAV_W, border: 'none' } }}
        >
          <MenuVsebina
            navigacija={navigacija}
            aktivnaSekcija={aktivnaSekcija}
            onSpremembaSekcije={onSpremembaSekcije}
            naslov={naslov}
            podnaslov={podnaslov}
            onOdjava={onOdjava}
            zlozen={false}
            onZapriDrawer={() => setDrawerOdprt(false)}
            brandPodnaslov={brandPodnaslov}
          />
        </Drawer>
      )}

      {/* === DESNI VSEBINSKI DEL === */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Zgornja vrstica (na mobilnem pokaži hamburger) */}
        {jeMobilen && (
          <Box
            sx={{
              height: HEADER_H,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              background: '#ffffff',
              flexShrink: 0,
            }}
          >
            <IconButton
              onClick={() => setDrawerOdprt(true)}
              sx={{ color: '#6b7280' }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HomeOutlinedIcon sx={{ fontSize: 16, color: '#fff' }} />
            </Box>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
              Stanovanja Dovč
            </Typography>
            {/* Odjava na desni strani mobilnega headerja */}
            <Box sx={{ ml: 'auto' }}>
              <Tooltip title="Odjava">
                <IconButton size="small" onClick={onOdjava} sx={{ color: '#9ca3af', '&:hover': { color: '#374151' } }}>
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}

        {/* Vsebina – otroci */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
