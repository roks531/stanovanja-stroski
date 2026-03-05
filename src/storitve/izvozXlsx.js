const MIME_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const UTF8 = new TextEncoder();

let crcTableCache = null;

function pripraviCrcTabelo() {
  if (crcTableCache) return crcTableCache;
  const tabela = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    tabela[i] = c >>> 0;
  }
  crcTableCache = tabela;
  return tabela;
}

function crc32(bytes) {
  const tabela = pripraviCrcTabelo();
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = tabela[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(v) {
  const out = new Uint8Array(2);
  const dv = new DataView(out.buffer);
  dv.setUint16(0, v, true);
  return out;
}

function u32(v) {
  const out = new Uint8Array(4);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, v >>> 0, true);
  return out;
}

function zdruziNize(nizi) {
  const dolzina = nizi.reduce((sum, del) => sum + del.length, 0);
  const out = new Uint8Array(dolzina);
  let odmik = 0;
  nizi.forEach((del) => {
    out.set(del, odmik);
    odmik += del.length;
  });
  return out;
}

function xmlEsc(vrednost) {
  return String(vrednost)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function stolpecCrka(index) {
  let i = index + 1;
  let out = '';
  while (i > 0) {
    const rem = (i - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    i = Math.floor((i - 1) / 26);
  }
  return out;
}

function imeLista(rawIme, zasedenaImena) {
  const osnovno = (rawIme ?? 'List')
    .toString()
    .replaceAll(/[\[\]\*\/\\\:\?]/g, ' ')
    .trim()
    .slice(0, 31) || 'List';

  let kandidat = osnovno;
  let i = 2;
  while (zasedenaImena.has(kandidat)) {
    const pripona = ` ${i}`;
    kandidat = `${osnovno.slice(0, Math.max(1, 31 - pripona.length))}${pripona}`;
    i += 1;
  }
  zasedenaImena.add(kandidat);
  return kandidat;
}

function zagotoviXlsxIme(ime) {
  if (!ime) return 'izvoz.xlsx';
  return ime.toLowerCase().endsWith('.xlsx') ? ime : `${ime}.xlsx`;
}

function celicaXml(vrednost, naslov) {
  if (typeof vrednost === 'number' && Number.isFinite(vrednost)) {
    return `<c r="${naslov}"><v>${vrednost}</v></c>`;
  }

  const tekst = vrednost == null ? '' : String(vrednost);
  return `<c r="${naslov}" t="inlineStr"><is><t xml:space="preserve">${xmlEsc(tekst)}</t></is></c>`;
}

function pripraviStolpce(stolpci, vrstice) {
  if (Array.isArray(stolpci) && stolpci.length > 0) return stolpci;
  const prvi = vrstice[0] ?? {};
  return Object.keys(prvi).map((k) => ({ key: k, label: k }));
}

function worksheetXml(stolpci, vrstice) {
  const vseVrstice = [
    stolpci.map((s) => s.label),
    ...vrstice.map((v) => stolpci.map((s) => v[s.key]))
  ];

  const vrsticeXml = vseVrstice
    .map((vrstica, vrsticaIndex) => {
      const r = vrsticaIndex + 1;
      const celice = vrstica
        .map((vrednost, stolpecIndex) => celicaXml(vrednost, `${stolpecCrka(stolpecIndex)}${r}`))
        .join('');
      return `<row r="${r}">${celice}</row>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${vrsticeXml}</sheetData>
</worksheet>`;
}

function workbookXml(listi) {
  const sheetsXml = listi
    .map((list, idx) => `<sheet name="${xmlEsc(list.ime)}" sheetId="${idx + 1}" r:id="rId${idx + 1}"/>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${sheetsXml}</sheets>
</workbook>`;
}

function workbookRelsXml(stListov) {
  const relSheet = Array.from({ length: stListov })
    .map(
      (_, idx) =>
        `<Relationship Id="rId${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${idx + 1}.xml"/>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${relSheet}
  <Relationship Id="rId${stListov + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

function contentTypesXml(stListov) {
  const sheetOverrides = Array.from({ length: stListov })
    .map(
      (_, idx) =>
        `<Override PartName="/xl/worksheets/sheet${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${sheetOverrides}
</Types>`;
}

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border/></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

function zipDatoteke(datoteke) {
  const lokalniZapisi = [];
  const centralniZapisi = [];
  let odmik = 0;

  datoteke.forEach(({ pot, vsebina }) => {
    const ime = UTF8.encode(pot);
    const data = UTF8.encode(vsebina);
    const crc = crc32(data);

    const lokalni = zdruziNize([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(ime.length),
      u16(0),
      ime,
      data
    ]);

    const centralni = zdruziNize([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(ime.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(odmik),
      ime
    ]);

    lokalniZapisi.push(lokalni);
    centralniZapisi.push(centralni);
    odmik += lokalni.length;
  });

  const centralniOdmik = odmik;
  const centralnaVelikost = centralniZapisi.reduce((sum, e) => sum + e.length, 0);
  const konec = zdruziNize([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(datoteke.length),
    u16(datoteke.length),
    u32(centralnaVelikost),
    u32(centralniOdmik),
    u16(0)
  ]);

  return zdruziNize([...lokalniZapisi, ...centralniZapisi, konec]);
}

export function izvoziXlsxDatoteko({ imeDatoteke, listi }) {
  if (!Array.isArray(listi) || listi.length === 0) {
    throw new Error('Ni podatkov za izvoz.');
  }

  const zasedenaImena = new Set();
  const pripravljeniListi = listi.map((list, idx) => {
    const vrstice = Array.isArray(list?.vrstice) ? list.vrstice : [];
    const stolpci = pripraviStolpce(list?.stolpci, vrstice);
    return {
      ime: imeLista(list?.ime ?? `List ${idx + 1}`, zasedenaImena),
      xml: worksheetXml(stolpci, vrstice)
    };
  });

  const datoteke = [
    { pot: '[Content_Types].xml', vsebina: contentTypesXml(pripravljeniListi.length) },
    { pot: '_rels/.rels', vsebina: ROOT_RELS_XML },
    { pot: 'xl/workbook.xml', vsebina: workbookXml(pripravljeniListi) },
    { pot: 'xl/_rels/workbook.xml.rels', vsebina: workbookRelsXml(pripravljeniListi.length) },
    { pot: 'xl/styles.xml', vsebina: STYLES_XML },
    ...pripravljeniListi.map((list, idx) => ({
      pot: `xl/worksheets/sheet${idx + 1}.xml`,
      vsebina: list.xml
    }))
  ];

  const bytes = zipDatoteke(datoteke);
  const blob = new Blob([bytes], { type: MIME_XLSX });
  const url = URL.createObjectURL(blob);
  const povezava = document.createElement('a');
  povezava.href = url;
  povezava.download = zagotoviXlsxIme(imeDatoteke);
  document.body.appendChild(povezava);
  povezava.click();
  povezava.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
