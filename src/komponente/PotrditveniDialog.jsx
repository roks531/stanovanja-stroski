import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

export default function PotrditveniDialog({
  odprt,
  naslov = 'Potrditev',
  sporocilo = '',
  opomba = '',
  oznakaPotrditve = 'Potrdi',
  oznakaPreklica = 'Prekliči',
  potrjujem = false,
  onPotrdi,
  onZapri
}) {
  return (
    <Dialog
      open={odprt}
      onClose={() => {
        if (!potrjujem) onZapri?.();
      }}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1.25 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <WarningAmberRoundedIcon sx={{ color: '#d97706' }} />
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            {naslov}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1}>
          {sporocilo && <Typography>{sporocilo}</Typography>}
          {opomba && (
            <Typography variant="body2" color="text.secondary">
              {opomba}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onZapri} disabled={potrjujem}>
          {oznakaPreklica}
        </Button>
        <Button
          variant="contained"
          color="error"
          className="gumb-jeklo"
          onClick={onPotrdi}
          disabled={potrjujem}
        >
          {potrjujem ? 'Brisanje...' : oznakaPotrditve}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
