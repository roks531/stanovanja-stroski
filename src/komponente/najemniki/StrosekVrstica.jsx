/**
 * Ena vrstica stroška v razčlenitvi obračuna.
 */
import { Box, Stack, Typography } from '@mui/material';

export default function StrosekVrstica({ label, vrednost, ikona }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        py: 0.6,
        px: 0.75,
        borderRadius: '4px',
        '&:hover': { background: '#f8fafc' }
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75}>
        {ikona && <Box sx={{ display: 'flex', flexShrink: 0 }}>{ikona}</Box>}
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Stack>
      <Typography variant="body2" fontWeight={600}>{vrednost}</Typography>
    </Stack>
  );
}
