/**
 * Vstopna točka React aplikacije.
 *
 * Tukaj registriramo:
 *   - QueryClient (TanStack React Query)
 *   - MUI ThemeProvider z lastno temo (src/tema.js)
 *   - LocalizationProvider za MUI datumske komponente (slovenščina)
 *   - AvtentikacijaProvider (Supabase seja)
 *   - BrowserRouter za klientsko usmerjanje
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AvtentikacijaProvider } from './kontekst/AvtentikacijaKontekst';
import tema from './tema';
import App from './App';
import './styles.css';
import 'dayjs/locale/sl';

// React Query klient z osnovno konfiguracijo
const poizvedbe = new QueryClient({
  defaultOptions: {
    queries: {
      // Podatki so sveži 3 minute, potem se samodejno osveži ob fokusu okna
      staleTime: 3 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={poizvedbe}>
      {/* Naša MUI tema – barve, pisave, oblike gumbov, chipov itd. */}
      <ThemeProvider theme={tema}>
        {/* CssBaseline ponastavi brskalniške privzete sloge */}
        <CssBaseline />
        {/* Slovenščina za datum/ura komponente (dd.MM.YYYY format) */}
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="sl">
          <AvtentikacijaProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AvtentikacijaProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
