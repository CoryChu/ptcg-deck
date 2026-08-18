function parseDeckLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;

  if (/^(Pokémon|Pokemon|Trainer|Energy|Total Cards?)\s*:\s*\d+\s*$/i.test(trimmed)) {
    return null;
  }

  const englishTcg = trimmed.match(/^(\d+)\s+(.+?)\s+[A-Z]{3}\s+\d+\s*$/);
  if (englishTcg) {
    return {
      name: englishTcg[2].trim(),
      quantity: Math.min(999, parseInt(englishTcg[1], 10) || 1),
    };
  }

  const withZhang = trimmed.match(/^(.+?)\s+(\d+)\s*[张張]\s*$/);
  if (withZhang) {
    return {
      name: withZhang[1].trim(),
      quantity: Math.min(999, parseInt(withZhang[2], 10) || 1),
    };
  }

  const withX = trimmed.match(/^(.+?)\s+[xX×]\s*(\d+)\s*$/);
  if (withX) {
    return {
      name: withX[1].trim(),
      quantity: Math.min(999, parseInt(withX[2], 10) || 1),
    };
  }

  return { name: trimmed, quantity: 1 };
}

const SAMPLE = `Pokémon: 10
1 Lampent TWM 37
2 Snorunt ASC 46
1 Mega Froslass ex ASC 275
3 Lampent TWM 37
7 Basic {W} Energy MEE 3
Trainer: 21
2 Boss's Orders ASC 256
Total Cards: 60`;

const expected = [
  { name: 'Lampent', quantity: 1 },
  { name: 'Snorunt', quantity: 2 },
  { name: 'Mega Froslass ex', quantity: 1 },
  { name: 'Lampent', quantity: 3 },
  { name: 'Basic {W} Energy', quantity: 7 },
  { name: "Boss's Orders", quantity: 2 },
];

const entries = SAMPLE.split(/\r?\n/).map(parseDeckLine).filter(Boolean);
let ok = true;
expected.forEach((exp, i) => {
  const got = entries[i];
  const match = got && got.name === exp.name && got.quantity === exp.quantity;
  if (!match) {
    ok = false;
    console.log(`FAIL [${i}] expected`, exp, 'got', got);
  }
});
console.log(entries);
console.log(ok ? 'ALL PASS' : 'FAILED');
process.exit(ok ? 0 : 1);
