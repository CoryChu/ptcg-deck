const { resolveChineseCardName } = require('../api/card-name-resolve-lib');
const { searchPokemonCards } = require('../api/pokemon-search-lib');

const SAMPLES = [
  'Jumbo Ice Cream',
  "Boss's Orders",
  "Professor's Research",
];

(async () => {
  for (const name of SAMPLES) {
    console.log(`\n=== ${name} ===`);
    const enDirect = await searchPokemonCards(name);
    console.log(`EN direct: ${enDirect.count} images`);

    const resolved = await resolveChineseCardName(name);
    console.log(`Resolved: ${resolved.ok ? resolved.chineseName : resolved.error} (${resolved.source || 'none'})`);

    if (resolved.chineseName && resolved.chineseName !== name) {
      const zhResult = await searchPokemonCards(resolved.chineseName);
      console.log(`ZH search: ${zhResult.count} images`);
      if (zhResult.images?.[0]) console.log(`  ${zhResult.images[0]}`);
    }
  }
})();
