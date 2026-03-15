/**
 * Vsi dialogi, ki jih uporablja admin pogled.
 * Logika in stanje ostaneta v parent komponenti.
 */
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import EuroSymbolOutlinedIcon from '@mui/icons-material/EuroSymbolOutlined';

export default function AdminDialogi({
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
  const tipiHise = dialogManjkajoceOgrevanje.tipiHise ?? [];
  const manjkajociTipi = dialogManjkajoceOgrevanje.manjkajociTipi ?? [];
  const jeTipManjkajoc = (tip) => manjkajociTipi.includes(tip);
  const jeTipIzbranZaPotrditev = (tip) => (dialogManjkajoceOgrevanje.potrdiTipi ?? []).includes(tip);

  return (
    <>
      {/* Pogovorno okno: potrditev vseh odprtih obračunov */}
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

      {/* Pogovorno okno: manjkajoče ogrevanje pri potrjevanju obdobja */}
      <Dialog
        open={dialogManjkajoceOgrevanje.odprt}
        onClose={() => {
          if (!potrjevanjeObdobja) zapriDialogManjkajoceOgrevanje();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Potrdi podatke za obračune</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Obdobje: <strong>{dialogManjkajoceOgrevanje.nazivObdobja}</strong>. Potrdi lahko podatke za
              posamezen tip hiše ali za oba skupaj. Ogrevanje lahko spreminjate tudi v rubriki ogrevanja.
            </Typography>

            {tipiHise.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Ni aktivnih tipov hiš za potrjevanje.
              </Typography>
            )}

            {tipiHise.map((tip) => {
              const manjka = jeTipManjkajoc(tip);
              const izbran = jeTipIzbranZaPotrditev(tip);
              return (
                <Box
                  key={tip}
                  sx={{
                    border: '1px solid',
                    borderColor: manjka ? '#fcd34d' : '#86efac',
                    borderRadius: 1.5,
                    p: 1.25,
                    backgroundColor: manjka ? '#fffbeb' : '#f0fdf4'
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
                      <Typography variant="subtitle2" sx={{ textTransform: 'capitalize', fontWeight: 700 }}>
                        {tip} hiša
                      </Typography>
                      <Chip
                        size="small"
                        color={manjka ? 'warning' : 'success'}
                        label={manjka ? 'Manjka ogrevanje' : 'Ogrevanje že vneseno'}
                      />
                    </Stack>

                    {manjka ? (
                      <>
                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Checkbox
                              size="small"
                              checked={izbran}
                              onChange={(e) =>
                                setDialogManjkajoceOgrevanje((prej) => {
                                  const trenutni = new Set(prej.potrdiTipi ?? []);
                                  if (e.target.checked) trenutni.add(tip);
                                  else trenutni.delete(tip);
                                  return {
                                    ...prej,
                                    potrdiTipi: Array.from(trenutni)
                                  };
                                })
                              }
                              disabled={potrjevanjeObdobja}
                            />
                          }
                          label="Potrdi ta tip hiše v tem koraku"
                        />
                        <TextField
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
                          helperText="Prazno pomeni 0 €."
                          size="small"
                          fullWidth
                          disabled={potrjevanjeObdobja || !izbran}
                        />
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Ogrevanje za ta tip hiše je za izbrano obdobje že potrjeno.
                      </Typography>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={zapriDialogManjkajoceOgrevanje} disabled={potrjevanjeObdobja}>
            Prekliči
          </Button>
          <Button
            variant="contained"
            className="gumb-jeklo"
            onClick={manjkajociTipi.length > 0 ? potrdiNastavitevManjkajocegaOgrevanjaNaNulo : zapriDialogManjkajoceOgrevanje}
            disabled={
              potrjevanjeObdobja ||
              (manjkajociTipi.length > 0 && (dialogManjkajoceOgrevanje.potrdiTipi ?? []).length === 0)
            }
          >
            {potrjevanjeObdobja ? 'Shranjujem...' : (manjkajociTipi.length > 0 ? 'Potrdi izbrane tipe' : 'Zapri')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
