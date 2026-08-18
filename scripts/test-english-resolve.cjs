const { resolveChineseCardName } = require('../api/card-name-resolve-lib');
const { searchPokemonCards } = require('../api/pokemon-search-lib');

const SAMPLES = [
  'Dawn',
  'Ultra Ball',
  'Rare Candy',
  "Boss's Orders",
  "Lillie's Determination",
  'Night Stretcher',
  'Jumbo Ice Cream',
];

(async () => {
  let ok = 0;
  let fail = 0;
  for (const name of SAMPLES) {
    const resolved = await resolveChineseCardName(name);
    const zh = resolved.chineseName || null;
    const img = zh ? (await searchPokemonCards(zh)).count : 0;
    const pass = resolved.ok && img > 0;
    if (pass) ok += 1;
    else fail += 1;
    console.log(`${pass ? 'OK' : 'FAIL'} | ${name} -> ${zh || resolved.error} (${resolved.source || '-'}) | images: ${img}`);
  }
  console.log(`\n${ok} passed / ${fail} failed / ${SAMPLES.length} total`);
  process.exit(fail > 0 ? 1 : 0);
})();
