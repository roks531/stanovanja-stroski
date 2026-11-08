/**
 * Ena vrstica stroška v razčlenitvi obračuna.
 */
import { Box, Stack, Typography } from '@mui/material';

export default function StrosekVrstica({ label, vrednost, ikona }) {
  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.6,
        px: 0.75,
        borderRadius: '4px',
        '&:hover': { background: '#f8fafc' }
      }}>
      <Stack direction="row" spacing={0.75} sx={{
        alignItems: "center"
      }}>
        {ikona && <Box sx={{ display: 'flex', flexShrink: 0 }}>{ikona}</Box>}
        <Typography variant="body2" sx={{
          color: "text.secondary"
        }}>{label}</Typography>
      </Stack>
      <Typography variant="body2" sx={{
        fontWeight: 600
      }}>{vrednost}</Typography>
    </Stack>
  );
}
