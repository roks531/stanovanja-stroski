import test from 'node:test';
import assert from 'node:assert/strict';
import { pripraviPregledOddaje, pripraviPregledOddajeZaMesece } from './pregledOddaje.js';

const soba = { id: 's1', ime_sobe: 'Soba 1', tip_hise: 'velika', aktivna: true };
const najemnik = { id: 'u1', soba_id: 's1', ime: 'Ana', priimek: 'Novak', aktiven: true, admin: false, uporabnik_od: '2026-09-15' };
const placilo = { soba_id: 's1', uporabnik_id: 'u1', mesec: 11, leto: 2026, placano: false };
function pregled(spremembe = {}) {
  return pripraviPregledOddaje({ sobe: [soba], uporabniki: [najemnik], placila: [], mesec: 11, leto: 2026, ...spremembe });
}

test('tenant confirmation counts as submitted before admin payment confirmation', () => {
  assert.equal(pregled({ placila: [placilo] })[0].status, 'oddano');
  assert.equal(pregled({ placila: [placilo] })[0].placano, false);
  assert.equal(pregled({ placila: [{ ...placilo, placano: true }] })[0].status, 'oddano');
  assert.equal(pregled({ placila: [{ ...placilo, placano: true }] })[0].placano, true);
});

test('missing tenants remain visible even without any billing records', () => {
  assert.equal(pregled()[0].status, 'manjka');
  assert.equal(pregled()[0].placano, null);
  assert.equal(pregled()[0].najemnik, 'Ana Novak');
});

test('previous tenant, other room, month or year never completes the current tenant submission', () => {
  for (const sprememba of [{ uporabnik_id: 'former' }, { soba_id: 'other' }, { mesec: 10 }, { leto: 2025 }]) {
    assert.equal(pregled({ placila: [{ ...placilo, ...sprememba }] })[0].status, 'manjka');
    assert.equal(pregled({ placila: [{ ...placilo, ...sprememba, placano: true }] })[0].placano, null);
  }
});

test('empty rooms, inactive tenants and admins do not add missing submissions', () => {
  for (const uporabniki of [[], [{ ...najemnik, aktiven: false }], [{ ...najemnik, admin: true }]]) {
    const vrstice = pregled({ uporabniki });
    assert.equal(vrstice.length, 1);
    assert.equal(vrstice[0].status, 'ni_potrebno');
  }
  assert.equal(pregled({ sobe: [{ ...soba, aktivna: false }] })[0].status, 'ni_potrebno');
});

test('first required period is the month after move-in, including year boundaries', () => {
  assert.equal(pregled({ mesec: 9 })[0].status, 'ni_potrebno');
  assert.equal(pregled({ mesec: 10 })[0].status, 'manjka');
  const uporabniki = [{ ...najemnik, uporabnik_od: '2025-12-20' }];
  assert.equal(pregled({ uporabniki, mesec: 12, leto: 2025 })[0].status, 'ni_potrebno');
  assert.equal(pregled({ uporabniki, mesec: 1, leto: 2026 })[0].status, 'manjka');
});

test('each active tenant is counted separately and missing submissions appear first', () => {
  const vrstice = pregled({ uporabniki: [najemnik, { ...najemnik, id: 'u2', ime: 'Bojan' }], placila: [placilo] });
  assert.deepEqual(vrstice.map((v) => v.status), ['manjka', 'oddano']);
  assert.equal(vrstice[0].uporabnik_id, 'u2');
});

test('months after tenancy ends are not expected; existing submissions stay visible', () => {
  const uporabniki = [{ ...najemnik, uporabnik_do: '2026-10-31' }];
  assert.equal(pregled({ uporabniki })[0].status, 'ni_potrebno');
  assert.equal(pregled({ uporabniki, placila: [placilo] })[0].status, 'oddano');
});

test('submission time uses invoice creation time, independently of payment or later edits', () => {
  const datumOddaje = '2026-11-08T09:15:00Z';
  const zapis = { ...placilo, datum_izracuna: datumOddaje, datum_placila: '2026-11-10T12:00:00Z', posodobljeno_ob: '2026-11-11T12:00:00Z' };
  assert.equal(pregled({ placila: [zapis] })[0].datum_oddaje, datumOddaje);
  assert.equal(pregled({ placila: [{ ...zapis, placano: true }] })[0].datum_oddaje, datumOddaje);
  assert.equal(pregled({ placila: [placilo] })[0].datum_oddaje, null);
  assert.equal(pregled({ placila: [{ ...zapis, uporabnik_id: 'former' }] })[0].datum_oddaje, null);
});

test('multiple months keep missing and submitted periods separate with unique row IDs', () => {
  const vrstice = pripraviPregledOddajeZaMesece({
    sobe: [soba], uporabniki: [najemnik],
    placila: [{ ...placilo, mesec: 10, datum_izracuna: '2026-10-08T09:15:00Z' }],
    meseci: [9, 10, 11, 10], leto: 2026
  });
  assert.equal(vrstice.length, 3);
  assert.equal(new Set(vrstice.map((v) => v.id)).size, 3);
  assert.deepEqual(vrstice.map((v) => [v.mesec, v.status]), [[11, 'manjka'], [10, 'oddano'], [9, 'ni_potrebno']]);
  assert.equal(vrstice[0].datum_oddaje, null);
  assert.equal(vrstice[1].datum_oddaje, '2026-10-08T09:15:00Z');
  assert.equal(vrstice[1].leto, 2026);
});

test('multiple-month overview keeps years and tenant ownership separate', () => {
  const podatki = { sobe: [soba], uporabniki: [{ ...najemnik, uporabnik_od: '2024-01-01' }], placila: [placilo], meseci: [11] };
  const zdaj = pripraviPregledOddajeZaMesece({ ...podatki, leto: 2026 })[0];
  const prej = pripraviPregledOddajeZaMesece({ ...podatki, leto: 2025 })[0];
  assert.equal(zdaj.status, 'oddano');
  assert.equal(prej.status, 'manjka');
  assert.notEqual(zdaj.id, prej.id);
});


test('May submission remains visible after its tenant is unassigned from the room', () => {
  const uporabniki = [{ ...najemnik, soba_id: null }];
  const placila = [{ ...placilo, mesec: 5, placano: true, datum_izracuna: '2026-05-19T10:00:00Z' }];
  const vrstice = pregled({ uporabniki, placila, mesec: 5 });
  assert.equal(vrstice.length, 1);
  assert.equal(vrstice[0].status, 'oddano');
  assert.equal(vrstice[0].najemnik, 'Ana Novak');
  assert.equal(vrstice[0].uporabnik_id, 'u1');
  assert.equal(vrstice[0].placano, true);
  assert.equal(vrstice[0].datum_oddaje, '2026-05-19T10:00:00Z');
  assert.equal(vrstice[0].razlog, '');
  assert.equal(pregled({ uporabniki, placila, mesec: 6 })[0].status, 'ni_potrebno');
});

test('historical submissions survive deactivation and reassignment without completing a replacement tenant submission', () => {
  for (const sprememba of [{ aktiven: false }, { soba_id: 's2' }, { soba_id: null, aktiven: false }]) {
    const uporabniki = [{ ...najemnik, ...sprememba }, { ...najemnik, id: 'replacement', ime: 'Bojan' }];
    const vrstice = pregled({ uporabniki, placila: [placilo] });
    assert.equal(vrstice.length, 2);
    assert.equal(vrstice.find((v) => v.uporabnik_id === 'u1').status, 'oddano');
    assert.equal(vrstice.find((v) => v.uporabnik_id === 'replacement').status, 'manjka');
    assert.equal(new Set(vrstice.map((v) => v.id)).size, 2);
  }
});

test('saved submission remains accessible even when the tenant profile is unavailable', () => {
  const vrstice = pregled({ uporabniki: [], placila: [placilo] });
  assert.equal(vrstice.length, 1);
  assert.equal(vrstice[0].status, 'oddano');
  assert.equal(vrstice[0].uporabnik_id, 'u1');
  assert.equal(vrstice[0].najemnik, 'Nekdanji najemnik');
});

test('multi-month history includes only the saved month for an unassigned tenant', () => {
  const vrstice = pripraviPregledOddajeZaMesece({
    sobe: [soba], uporabniki: [{ ...najemnik, soba_id: null }],
    placila: [{ ...placilo, mesec: 5 }], meseci: [4, 5, 6], leto: 2026
  });
  assert.equal(vrstice.length, 3);
  assert.deepEqual(vrstice.filter((v) => v.status === 'oddano').map((v) => v.mesec), [5]);
  assert.deepEqual(vrstice.filter((v) => v.status === 'ni_potrebno').map((v) => v.mesec), [6, 4]);
});
