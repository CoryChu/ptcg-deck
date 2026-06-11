const { searchPokemonCards } = require('../api/pokemon-search-lib');

const SAMPLE = `超級雪妖女ex 3張
水晶燈火靈 4張
燭光靈 4張
雪童子 4張
含羞苞 1張
燈火幽靈 4張
神奇糖果 2張`;

function parseDeckLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  const withZhang = trimmed.match(/^(.+?)\s+(\d+)\s*[张張]\s*$/);
  if (withZhang) {
    return { name: withZhang[1].trim(), quantity: parseInt(withZhang[2], 10) || 1 };
  }
  return { name: trimmed, quantity: 1 };
}

(async () => {
  const entries = SAMPLE.split(/\r?\n/).map(parseDeckLine).filter(Boolean);
  console.log('=== 解析牌組文字 ===');
  console.log(entries);

  console.log('\n=== 搜尋卡牌圖片 ===');
  let ok = 0;
  let fail = 0;
  for (const { name, quantity } of entries) {
    const result = await searchPokemonCards(name);
    const status = result.ok && result.count > 0 ? 'OK' : 'FAIL';
    if (status === 'OK') ok += 1;
    else fail += 1;
    console.log(`${status} | ${name} (qty ${quantity}) → ${result.count || 0} 張圖`);
    if (result.images?.[0]) console.log(`     ${result.images[0]}`);
  }

  console.log(`\n結果：${ok} 成功 / ${fail} 失敗 / 共 ${entries.length} 行`);
  process.exit(fail > 0 ? 1 : 0);
})();
