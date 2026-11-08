import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pripraviStevceRocnegaObracuna as pripravi, izracunajStroskeStevcev as izracunaj, preveriStevceRocnegaObracuna as preveri } from './rocniObracun.js';

const podatki = {
  sobe: [{ id: 's1', tip_hise: 'velika', voda_stanje: true, najemnina: 420, nettv: 12, fiksni: 5, faktor_ogrevanja: 0.1 }],
  uporabniki: [{ id: 'u1', soba_id: 's1', zacetno_stanje_elektrike: 100, zacetno_stanje_vode: 10 }],
  cene: [{ tip_hise: 'velika', velja_od: '2025-12-01', cena_elektrike: 0.2, cena_vode: 3 },
    { tip_hise: 'velika', velja_od: '2026-01-01', cena_elektrike: 99, cena_vode: 99 }],
  ogrevanjeTipi: [{ tip_hise: 'velika', mesec: 12, leto: 2025, znesek: 300 }],
  odcitki: []
};
const vnos = { soba_id: 's1', uporabnik_id: 'u1', mesec: 1, leto: 2026, stanje_elektrike: '125', stanje_vode: '12.123', cena_elektrike: 0.2, cena_vode: 3 };

test('Prvi odčitek uporablja predajo in cene ter ogrevanje iz decembra prejšnjega leta', () => {
  const p = { ...podatki, odcitki: [{ soba_id: 's1', uporabnik_id: 'prejsnji', mesec: 12, leto: 2025, stanje_elektrike: 50, stanje_vode: 3 }] };
  const k = pripravi(vnos, p);
  assert.equal(k.prejsnje_stanje_elektrike, 100);
  assert.equal(k.prejsnje_stanje_vode, 10);
  assert.equal(k.privzetiStroski.cena_elektrike, 0.2);
  assert.equal(k.privzetiStroski.strosek_ogrevanja, 30);
  assert.equal(k.privzetiStroski.strosek_neta, 12);
  assert.doesNotThrow(() => preveri(vnos, k, p));
  assert.deepEqual(izracunaj(vnos, k), { poraba_elektrike: 25, poraba_vode: 2.123, strosek_elektrike: 5, strosek_vode: 6.37 });
});

test('Naslednji mesec nadaljuje pri vnesenem stanju, urejanje pa ohrani njegovo prejšnje stanje', () => {
  const p = { ...podatki, odcitki: [{ ...vnos, prejsnje_stanje_elektrike: 100, prejsnje_stanje_vode: 10 }] };
  assert.equal(pripravi({ ...vnos, mesec: 2 }, p).prejsnje_stanje_elektrike, 125);
  assert.equal(pripravi(vnos, p).prejsnje_stanje_elektrike, 100);
});

test('Pavšalna voda ne zahteva odčitka in ohrani ceno sobe', () => {
  const p = { ...podatki, sobe: [{ ...podatki.sobe[0], voda_stanje: false, voda: 17.5 }] };
  const k = pripravi(vnos, p);
  assert.doesNotThrow(() => preveri({ ...vnos, stanje_vode: '' }, k, p));
  assert.equal(izracunaj(vnos, k).strosek_vode, 17.5);
});

test('Prazne, manjše in preveč natančne vrednosti se zavrnejo, ničla je veljavna', () => {
  const k = pripravi(vnos, podatki);
  for (const sprememba of [{ stanje_elektrike: '' }, { stanje_elektrike: '99' }, { stanje_vode: '' }, { stanje_vode: '9' }, { stanje_elektrike: '125.1' }, { stanje_vode: '12.1234' }]) {
    assert.throws(() => preveri({ ...vnos, ...sprememba }, k, podatki));
  }
  const p = { ...podatki, uporabniki: [{ id: 'u1', soba_id: 's1' }] };
  assert.doesNotThrow(() => preveri({ ...vnos, stanje_elektrike: 0, stanje_vode: 0 }, pripravi(vnos, p), p));
});

test('Drug najemnik, manjkajoče cene in manjkajoče ogrevanje se zavrnejo', () => {
  const p = { ...podatki, odcitki: [{ ...vnos, uporabnik_id: 'drug' }] };
  assert.throws(() => preveri(vnos, pripravi(vnos, p), p), /drugemu najemniku/);
  for (const sprememba of [{ cene: [] }, { ogrevanjeTipi: [] }, { uporabniki: [{ id: 'u1', soba_id: 'druga' }] }]) {
    const p = { ...podatki, ...sprememba };
    assert.throws(() => preveri(vnos, pripravi(vnos, p), p));
  }
});

test('Zgodovinski vnos ne sme pokvariti že shranjenega naslednjega odčitka', () => {
  const p = { ...podatki, odcitki: [{ ...vnos, mesec: 2, prejsnje_stanje_elektrike: 120, prejsnje_stanje_vode: 12.123 }] };
  assert.throws(() => preveri(vnos, pripravi(vnos, p), p), /Poznejši odčitek/);
  p.odcitki[0].prejsnje_stanje_elektrike = 125;
  assert.doesNotThrow(() => preveri(vnos, pripravi(vnos, p), p));
});
