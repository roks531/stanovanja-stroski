import { Navigate, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import PrijavaStran from './komponente/PrijavaStran';
import AdminPogled from './komponente/AdminPogled';
import NajemnikPogled from './komponente/NajemnikPogled';
import { useAvtentikacija } from './kontekst/AvtentikacijaKontekst';

function Nalaganje() {
  return (
    <Box minHeight="100vh" display="grid" sx={{ placeItems: 'center' }}>
      <CircularProgress />
    </Box>
  );
}

function ZascitenaPot({ samoAdmin = false, children }) {
  const { seja, profil, nalaganje } = useAvtentikacija();

  if (nalaganje) return <Nalaganje />;
  if (!seja) return <Navigate to="/prijava" replace />;
  if (!profil) return <Nalaganje />;
  if (!profil?.aktiven) return <Navigate to="/prijava" replace />;

  if (samoAdmin && !profil?.admin) {
    return <Navigate to="/najemnik" replace />;
  }

  return children;
}

export default function App() {
  const { seja, profil, nalaganje } = useAvtentikacija();

  if (nalaganje) return <Nalaganje />;
  if (seja && !profil) return <Nalaganje />;

  const ciljPoPrijavi = seja ? (profil?.admin ? '/admin' : '/najemnik') : '/prijava';

  return (
    <Routes>
      <Route path="/prijava" element={!seja ? <PrijavaStran /> : <Navigate to={ciljPoPrijavi} replace />} />
      <Route
        path="/admin"
        element={
          <ZascitenaPot samoAdmin>
            <AdminPogled />
          </ZascitenaPot>
        }
      />
      <Route
        path="/najemnik"
        element={
          <ZascitenaPot>
            {profil?.admin ? <Navigate to="/admin" replace /> : <NajemnikPogled />}
          </ZascitenaPot>
        }
      />
      <Route path="*" element={<Navigate to={ciljPoPrijavi} replace />} />
    </Routes>
  );
}
