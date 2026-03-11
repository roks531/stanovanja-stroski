/**
 * Vsi dialogi, ki jih uporablja admin pogled.
 * Logika in stanje ostaneta v parent komponenti.
 */
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EuroSymbolOutlinedIcon from '@mui/icons-material/EuroSymbolOutlined';

export default function AdminDialogi({
  dialogZePripravljeno,
  setDialogZePripravljeno,
  dialogPotrdiVse,
  setDialogPotrdiVse,
  obdelujemPotrdiVse,
  potrdiVseOdprtePotrditev,
  dialogManjkajoceOgrevanje,
  setDialogManjkajoceOgrevanje,
  potrjevanjeObdobja,
  zapriDialogManjkajoceOgrevanje,
  potrdiNastavitevManjkajocegaOgrevanjaNaNulo
}) {
  return (
    <>
      {/* Dialog: obdobje je že pripravljeno */}
      <Dialog
        open={dialogZePripravljeno.odprt}
        onClose={() => setDialogZePripravljeno((s) => ({ ...s, odprt: false }))}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Obdobje že pripravljeno</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5} direction="row" alignItems="flex-start">
            <CheckCircleOutlineIcon sx={{ color: '#059669', mt: 0.25, flexShrink: 0 }} />
            <Typography>
              Obračunsko obdobje <strong>{dialogZePripravljeno.nazivObdobja}</strong> je že pripravljeno.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            className="gumb-jeklo"
            onClick={() => setDialogZePripravljeno((s) => ({ ...s, odprt: false }))}
          >
            V redu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: potrditev vseh odprtih obračunov */}
      <Dialog
        open={dialogPotrdiVse.odprt}
        onClose={() => {
          if (!obdelujemPotrdiVse) setDialogPotrdiVse((s) => ({ ...s, odprt: false }));
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Potrditev odprtih obračunov</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Typography>
              Želite potrditi <strong>{dialogPotrdiVse.stevilo}</strong>{' '}
              {dialogPotrdiVse.stevilo === 1
                ? 'obračun'
                : dialogPotrdiVse.stevilo >= 2 && dialogPotrdiVse.stevilo <= 4
                  ? 'obračune'
                  : 'obračunov'}?
            </Typography>
            {dialogPotrdiVse.stevilo === 0 && (
              <Typography variant="body2" color="text.secondary">
                Vsi filtrirani obračuni so že potrjeni.
              </Typography>
            )}
            {dialogPotrdiVse.stevilo > 0 && (
              <Typography variant="body2" color="text.secondary">
                Vsi odprti obračuni v trenutnem filtriranem pogledu bodo nastavljeni na status <strong>Potrjeno</strong> z današnjim datumom obračuna.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogPotrdiVse((s) => ({ ...s, odprt: false }))}
            disabled={obdelujemPotrdiVse}
          >
            Prekliči
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={potrdiVseOdprtePotrditev}
            disabled={obdelujemPotrdiVse || dialogPotrdiVse.stevilo === 0}
          >
            {obdelujemPotrdiVse ? 'Potrjevanje...' : `Potrdi ${dialogPotrdiVse.stevilo}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: manjkajoče ogrevanje pri potrjevanju obdobja */}
      <Dialog
        open={dialogManjkajoceOgrevanje.odprt}
        onClose={() => {
          if (!potrjevanjeObdobja) zapriDialogManjkajoceOgrevanje();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Potrditev obračunskega obdobja</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Za obdobje <strong>{dialogManjkajoceOgrevanje.nazivObdobja}</strong> manjka ogrevanje za:{' '}
              <strong>{dialogManjkajoceOgrevanje.tipi.join(', ')}</strong>.
              Vnesite znesek ogrevanja za vsako hišo (prazno = 0 €).
            </Typography>
            {dialogManjkajoceOgrevanje.tipi.map((tip) => (
              <TextField
                key={tip}
                label={`Ogrevanje – ${tip} hiša`}
                type="number"
                inputProps={{ min: 0, step: '0.01' }}
                value={dialogManjkajoceOgrevanje.vrednosti[tip] ?? ''}
                onChange={(e) =>
                  setDialogManjkajoceOgrevanje((prej) => ({
                    ...prej,
                    vrednosti: { ...prej.vrednosti, [tip]: e.target.value }
                  }))
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} />
                    </InputAdornment>
                  )
                }}
                size="small"
                fullWidth
                disabled={potrjevanjeObdobja}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={zapriDialogManjkajoceOgrevanje} disabled={potrjevanjeObdobja}>
            Prekliči
          </Button>
          <Button
            variant="contained"
            className="gumb-jeklo"
            onClick={potrdiNastavitevManjkajocegaOgrevanjaNaNulo}
            disabled={potrjevanjeObdobja}
          >
            {potrjevanjeObdobja ? 'Shranjujem...' : 'Potrdi obdobje'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
