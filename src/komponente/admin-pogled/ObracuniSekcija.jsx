/**
 * Sekcija "Obračuni" v admin pogledu.
 * Vključuje filtre, hitra dejanja in urejljivo tabelo obračunov.
 */
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import SearchableSelect from '../SearchableSelect';
import {
  ADMIN_DATAGRID_FLEKS_SX,
  ADMIN_SEKCIJA_CARD_SX,
  ADMIN_SEKCIJA_CONTENT_SX,
  ADMIN_SEKCIJA_STACK_SX,
  ADMIN_TABELA_FLEKS_SX
} from './adminSekcijaPostavitev';


export default function ObracuniSekcija({
  vrsticeObracuniFiltrirane,
  odpreDialogPotrdiVse,
  izvoziObracuneXlsx,
  filterObracuni,
  setFilterObracuni,
  moznostiFilterSobe,
  moznostiFilterUporabniki,
  imenaMesecov,
  letaObracunov,
  stolpciObracuni,
  moznostiStrani,
  lokalizacijaMreze,
  obdelajPosodobitevObracuna,
  obdelajNapakoPosodobitveObracuna,
  jeCelicaObracunUredljiva
}) {
  return (
    <Card className="kartica-jeklo" sx={ADMIN_SEKCIJA_CARD_SX}>
      <CardContent sx={ADMIN_SEKCIJA_CONTENT_SX}>
        <Stack spacing={1.5} sx={ADMIN_SEKCIJA_STACK_SX}>
          {/* Glava sekcije */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={1}
          >
            <Box>
              <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                <Typography variant="h5">Obračuni najemnikov</Typography>
                <Chip size="small" color="primary" label={`${vrsticeObracuniFiltrirane.length} obračunov`} />
                <Chip size="small" color="success" label={`Potrjeno: ${vrsticeObracuniFiltrirane.filter((v) => v.placano).length}`} />
                <Chip size="small" color="warning" label={`Odprto: ${vrsticeObracuniFiltrirane.filter((v) => !v.placano).length}`} />
              </Stack>
              <Typography variant="body2" color="text.secondary" mt={0.25}>
                Potrjeni obračuni so zaklenjeni. Urejati je mogoče samo odprte obračune.
              </Typography>
            </Box>
            <Stack direction="row" gap={1}>
              <Button
                variant="outlined"
                size="small"
                color="success"
                startIcon={<CheckCircleOutlineIcon />}
                onClick={odpreDialogPotrdiVse}
                disabled={vrsticeObracuniFiltrirane.filter((v) => !v.placano).length === 0}
              >
                Potrdi odprte
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={izvoziObracuneXlsx}
              >
                Izvozi XLSX
              </Button>
            </Stack>
          </Stack>

          {/* Filtri obračunov */}
          <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center" sx={{
            '& .MuiInputLabel-root': { fontSize: '0.8rem' },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': { fontSize: '0.74rem' },
            '& .MuiInputBase-input': { fontSize: '0.82rem' },
          }}>
            <Box sx={{ width: 190 }}>
              <SearchableSelect
                label="Soba"
                value={filterObracuni.soba_id}
                onChange={(novaVrednost) => setFilterObracuni((prej) => ({ ...prej, soba_id: novaVrednost }))}
                options={[
                  { value: '', label: 'Vse sobe' },
                  ...moznostiFilterSobe.map((soba) => ({ value: soba.id, label: soba.ime }))
                ]}
              />
            </Box>
            <Box sx={{ width: 190 }}>
              <SearchableSelect
                label="Najemnik"
                value={filterObracuni.uporabnik_id}
                onChange={(novaVrednost) => setFilterObracuni((prej) => ({ ...prej, uporabnik_id: novaVrednost }))}
                options={[
                  { value: '', label: 'Vsi najemniki' },
                  ...moznostiFilterUporabniki.map((uporabnik) => ({ value: uporabnik.id, label: uporabnik.ime }))
                ]}
              />
            </Box>
            <Box sx={{ width: 148 }}>
              <SearchableSelect
                label="Mesec"
                value={filterObracuni.mesec}
                onChange={(novaVrednost) => setFilterObracuni((prej) => ({ ...prej, mesec: novaVrednost }))}
                options={[
                  { value: '', label: 'Vsi' },
                  ...imenaMesecov.map((ime, idx) => ({ value: idx + 1, label: ime }))
                ]}
              />
            </Box>
            <Box sx={{ width: 110 }}>
              <SearchableSelect
                label="Leto"
                value={filterObracuni.leto}
                onChange={(novaVrednost) => setFilterObracuni((prej) => ({ ...prej, leto: novaVrednost }))}
                options={[
                  { value: '', label: 'Vsa' },
                  ...letaObracunov.map((leto) => ({ value: leto, label: String(leto) }))
                ]}
              />
            </Box>
            <Button
              variant="outlined"
              size="small"
              sx={{ height: 40, whiteSpace: 'nowrap' }}
              onClick={() =>
                setFilterObracuni({
                  soba_id: '',
                  uporabnik_id: '',
                  mesec: '',
                  leto: ''
                })
              }
            >
              Počisti filtre
            </Button>
          </Stack>

          {/* Tabela obračunov */}
          <Box className="tabela-polna" sx={ADMIN_TABELA_FLEKS_SX}>
            <DataGrid
              sx={ADMIN_DATAGRID_FLEKS_SX}
              rows={vrsticeObracuniFiltrirane}
              columns={stolpciObracuni}
              density="compact"
              columnHeaderHeight={48}
              rowHeight={90}
              disableRowSelectionOnClick
              showToolbar
              pageSizeOptions={moznostiStrani}
              localeText={lokalizacijaMreze}
              processRowUpdate={obdelajPosodobitevObracuna}
              onProcessRowUpdateError={obdelajNapakoPosodobitveObracuna}
              isCellEditable={jeCelicaObracunUredljiva}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 300 },
                  csvOptions: { disableToolbarButton: true },
                  printOptions: { disableToolbarButton: true }
                }
              }}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 100, page: 0 }
                }
              }}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
