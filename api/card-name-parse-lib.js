const CJK_RE = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;

const S2T_CHARS = {
  国: '國', 级: '級', 宝: '寶', 梦: '夢', 东: '東', 药: '藥', 护: '護', 龙: '龍',
  圣: '聖', 条: '條', 阳: '陽', 风: '風', 电: '電', 气: '氣', 发: '發', 斗: '鬥',
  丽: '麗', 亚: '亞', 团: '團', 产: '產', 总: '總', 网: '網', 经: '經', 验: '驗',
  扩: '擴', 张: '張', 纳: '納', 统: '統', 备: '備', 场: '場', 灵: '靈', 无: '無',
  头: '頭', 汉: '漢', 语: '語', 说: '說', 调: '調', 认: '認', 让: '讓', 设: '設',
  计: '計', 记: '記', 训: '訓', 许: '許', 访: '訪', 译: '譯', 该: '該', 课: '課',
  谢: '謝', 贝: '貝', 质: '質', 费: '費', 买: '買', 卖: '賣', 贵: '貴', 观: '觀',
  规: '規', 视: '視', 览: '覽', 觉: '覺', 标: '標', 样: '樣', 档: '檔', 树: '樹',
  桥: '橋', 机: '機', 权: '權', 构: '構', 枪: '槍', 乐: '樂', 楼: '樓', 欧: '歐',
  残: '殘', 杀: '殺', 毕: '畢', 极: '極', 压: '壓', 丧: '喪', 儿: '兒', 尘: '塵',
  汇: '匯', 齐: '齊', 齿: '齒', 龟: '龜', 车: '車', 转: '轉', 轮: '輪', 轻: '輕',
  边: '邊', 达: '達', 运: '運', 还: '還', 进: '進', 远: '遠', 连: '連', 选: '選',
  递: '遞', 邮: '郵', 钟: '鐘', 铁: '鐵', 银: '銀', 铜: '銅', 钱: '錢', 针: '針',
  锁: '鎖', 链: '鏈', 镜: '鏡', 闪: '閃', 闭: '閉', 开: '開', 关: '關', 间: '間',
  闻: '聞', 声: '聲', 热: '熱', 爱: '愛', 尔: '爾', 独: '獨', 猎: '獵', 兽: '獸',
  献: '獻', 环: '環', 现: '現', 球: '球', 画: '畫', 当: '當', 录: '錄', 彦: '彥',
  执: '執', 扩: '擴', 抛: '拋', 挂: '掛', 据: '據', 扫: '掃', 扬: '揚', 换: '換',
  损: '損', 摊: '攤', 拨: '撥', 择: '擇', 击: '擊', 凿: '鑿', 浅: '淺', 测: '測',
  济: '濟', 浓: '濃', 泽: '澤', 洁: '潔', 滩: '灘', 灾: '災', 点: '點', 炼: '煉',
  烧: '燒', 烛: '燭', 烟: '煙', 烦: '煩', 灭: '滅', 灯: '燈', 灵: '靈', 灾: '災',
  烧: '燒', 烂: '爛', 墙: '牆', 牵: '牽', 状: '狀', 犹: '猶', 猎: '獵', 献: '獻',
  环: '環', 现: '現', 琼: '瓊', 产: '產', 亩: '畝', 毕: '畢', 异: '異', 疯: '瘋',
  疗: '療', 盖: '蓋', 艺: '藝', 节: '節', 范: '範', 药: '藥', 苏: '蘇', 虑: '慮',
  虚: '虛', 虽: '雖', 虾: '蝦', 蚕: '蠶', 补: '補', 装: '裝', 裤: '褲', 西: '西',
  要: '要', 见: '見', 规: '規', 览: '覽', 觉: '覺', 亲: '親', 观: '觀', 讲: '講',
  议: '議', 记: '記', 许: '許', 论: '論', 设: '設', 访: '訪', 证: '證', 评: '評',
  识: '識', 诉: '訴', 词: '詞', 试: '試', 诗: '詩', 诚: '誠', 话: '話', 该: '該',
  详: '詳', 语: '語', 误: '誤', 说: '說', 请: '請', 诸: '諸', 读: '讀', 课: '課',
  谁: '誰', 调: '調', 谈: '談', 谢: '謝', 谱: '譜', 负: '負', 贡: '貢', 财: '財',
  责: '責', 贤: '賢', 货: '貨', 质: '質', 贩: '販', 贪: '貪', 贫: '貧', 购: '購',
  贮: '貯', 贯: '貫', 贱: '賤', 贴: '貼', 贵: '貴', 贸: '貿', 贺: '賀', 贾: '賈',
  贿: '賄', 资: '資', 赌: '賭', 赎: '贖', 赏: '賞', 赐: '賜', 赔: '賠', 赖: '賴',
  赚: '賺', 赛: '賽', 赞: '贊', 赠: '贈', 赢: '贏', 赵: '趙', 趋: '趨', 跃: '躍',
  践: '踐', 踪: '蹤', 躯: '軀', 车: '車', 轧: '軋', 轨: '軌', 轩: '軒', 转: '轉',
  轮: '輪', 软: '軟', 轰: '轟', 轴: '軸', 轻: '輕', 载: '載', 轿: '轎', 较: '較',
  辅: '輔', 辆: '輛', 辈: '輩', 辉: '輝', 辑: '輯', 输: '輸', 辖: '轄', 辗: '輾',
  辙: '轍', 辞: '辭', 辩: '辯', 边: '邊', 辽: '遼', 达: '達', 迁: '遷', 过: '過',
  迈: '邁', 运: '運', 还: '還', 这: '這', 进: '進', 远: '遠', 违: '違', 连: '連',
  迟: '遲', 迹: '跡', 选: '選', 逊: '遜', 递: '遞', 逻: '邏輯', 遗: '遺', 遥: '遙',
  邮: '郵', 邻: '鄰', 郑: '鄭', 释: '釋', 里: '里', 针: '針', 钓: '釣', 钙: '鈣',
  钝: '鈍', 钞: '鈔', 钟: '鐘', 钢: '鋼', 钥: '鑰', 钦: '欽', 钧: '鈞', 钩: '鉤',
  钮: '鈕', 钱: '錢', 钳: '鉗', 钻: '鑽', 铁: '鐵', 铃: '鈴', 铅: '鉛', 铜: '銅',
  铝: '鋁', 铭: '銘', 铲: '鏟', 银: '銀', 铺: '鋪', 链: '鏈', 销: '銷', 锁: '鎖',
  锄: '鋤', 锅: '鍋', 锈: '鏽', 锋: '鋒', 锌: '鋅', 锐: '銳', 错: '錯', 锡: '錫',
  锣: '鑼', 锤: '錘', 锦: '錦', 键: '鍵', 锯: '鋸', 镜: '鏡', 镶: '鑲', 长: '長',
  门: '門', 闪: '閃', 闭: '閉', 问: '問', 闯: '闖', 闲: '閒', 间: '間', 闷: '悶',
  闸: '閘', 闹: '鬧', 闺: '閨', 闻: '聞', 阀: '閥', 阁: '閣', 阅: '閱', 阐: '闡',
  阔: '闊', 队: '隊', 阳: '陽', 阴: '陰', 阵: '陣', 阶: '階', 际: '際', 陆: '陸',
  陈: '陳', 险: '險', 隐: '隱', 隶: '隸', 难: '難', 雾: '霧', 静: '靜', 韩: '韓',
  页: '頁', 顶: '頂', 顷: '頃', 项: '項', 顺: '順', 须: '須', 顽: '頑', 顾: '顧',
  顿: '頓', 颁: '頒', 预: '預', 领: '領', 颇: '頗', 颈: '頸', 频: '頻', 颗: '顆',
  题: '題', 颜: '顏', 额: '額', 颠: '顛', 风: '風', 飘: '飄', 飞: '飛', 饭: '飯',
  饮: '飲', 饰: '飾', 饱: '飽', 饼: '餅', 饿: '餓', 馆: '館', 馈: '饋', 馋: '饞',
  马: '馬', 驱: '驅', 驳: '駁', 驶: '駛', 驻: '駐', 驼: '駝', 驾: '駕', 骂: '罵',
  骄: '驕', 骆: '駱', 验: '驗', 骑: '騎', 骗: '騙', 骚: '騷', 骤: '驟', 骨: '骨',
  体: '體', 高: '高', 鬼: '鬼', 鱼: '魚', 鲁: '魯', 鲜: '鮮', 鸟: '鳥', 鸡: '雞',
  鸣: '鳴', 鸭: '鴨', 鸽: '鴿', 鹅: '鵝', 鹏: '鵬', 鹤: '鶴', 鹰: '鷹', 麦: '麥',
  黄: '黃', 齐: '齊', 齿: '齒', 龄: '齡', 龙: '龍', 龟: '龜',
};

function hasCjk(text) {
  return CJK_RE.test(String(text || ''));
}

function normalizeEnglish(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[''']/g, "'")
    .replace(/\s+/g, ' ');
}

function escapeRegExp(text) {
  return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeHtmlText(text) {
  return String(text || '')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]+>/g, ' ');
}

function isValidChineseCardName(name) {
  const trimmed = String(name || '').trim();
  if (!hasCjk(trimmed) || trimmed.length < 2 || trimmed.length > 20) return false;
  if (/[。，、；：？！（）【】《》「」]/.test(trimmed)) return false;
  if (/消歧义|这篇文章|如果您在寻找|主页面|主頁面|附录|附錄/.test(trimmed)) return false;
  return true;
}

function toTraditionalForHk(name) {
  return String(name || '')
    .split('')
    .map((ch) => S2T_CHARS[ch] || ch)
    .join('');
}

function getChineseSearchKeywords(name) {
  const base = String(name || '').trim();
  if (!base) return [];
  const traditional = toTraditionalForHk(base);
  return [...new Set([base, traditional].filter(Boolean))];
}

function englishMatchesSnippet(snippet, englishName) {
  const normalizedEn = normalizeEnglish(englishName);
  return normalizeEnglish(decodeHtmlText(snippet)).includes(normalizedEn);
}

function extractChineseFromVerifiedSnippet(snippet, englishName) {
  const plain = decodeHtmlText(snippet);
  const en = escapeRegExp(normalizeEnglish(englishName));
  const verified = new RegExp(
    `([\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff][\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff·\\s]{0,20}?)（[^）]*英文︰[^）]*${en}[^）]*）`,
    'i',
  );
  const match = plain.match(verified);
  if (match && isValidChineseCardName(match[1])) return match[1].trim();
  return null;
}

function extractChineseFromTitle(title, snippet, englishName) {
  const trimmedTitle = String(title || '').trim();
  if (!trimmedTitle || !hasCjk(trimmedTitle)) return null;
  if (!englishMatchesSnippet(snippet, englishName)) return null;

  const typed = trimmedTitle.match(
    /^([\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff][\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff·\s]{0,20}?)（(?:TCG|道具|支援者|物品)/,
  );
  if (typed && isValidChineseCardName(typed[1])) return typed[1].trim();

  if (trimmedTitle.includes('（TCG）') || trimmedTitle.includes('（道具）')) {
    const base = trimmedTitle.split('（')[0].trim();
    if (isValidChineseCardName(base)) return base;
  }

  return null;
}

function extractChineseBase(title) {
  const trimmed = String(title || '').trim();
  if (!trimmed || !hasCjk(trimmed)) return null;
  const base = trimmed.split('（')[0].trim();
  return isValidChineseCardName(base) ? base : null;
}

function parse52pokeSearchItems(items, englishName) {
  const snippetMatches = [];
  const titleMatches = [];
  const tcgMatches = [];

  for (const item of items) {
    const title = String(item?.title || item?.heading || '').trim();
    const snippet = String(item?.snippet || item?.searchresult || '');

    const fromSnippet = extractChineseFromVerifiedSnippet(snippet, englishName);
    if (fromSnippet) snippetMatches.push(fromSnippet);

    const fromTitle = extractChineseFromTitle(title, snippet, englishName);
    if (fromTitle) titleMatches.push(fromTitle);

    if (title.includes('（TCG）')) {
      const chinese = extractChineseBase(title);
      if (chinese) tcgMatches.push(chinese);
    }
  }

  if (snippetMatches.length > 0) return snippetMatches[0];
  if (titleMatches.length > 0) return titleMatches[0];
  if (tcgMatches.length > 0) return tcgMatches[0];
  return null;
}

function parseWebSearchResults(html, englishName) {
  const plain = decodeHtmlText(html);
  const normalizedEn = normalizeEnglish(englishName);
  const found = [];

  const pushCandidate = (name) => {
    const trimmed = String(name || '').trim();
    if (!isValidChineseCardName(trimmed)) return;
    if (!found.includes(trimmed)) found.push(trimmed);
  };

  const overviewPatterns = [
    /官方中文名稱[为為]「([^」]{2,16})」/gi,
    /中文名稱[为為]「([^」]{2,16})」/gi,
    /官方.*?[为為]「([^」]{2,16})」/gi,
    /(?:PTCG|宝可梦|寶可夢)[^「」]{0,120}「([^」]{2,16})」/gi,
    /「([^」]{2,16})」[^「」]{0,80}(?:繁体中文|繁體中文|官方中文)/gi,
  ];

  for (const pattern of overviewPatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(plain)) !== null) {
      pushCandidate(match[1]);
    }
  }

  const enPattern = new RegExp(
    `[\\u4e00-\\u9fff]{2,12}（[^）]*英文︰[^）]*${escapeRegExp(normalizedEn)}`,
    'gi',
  );
  let enMatch;
  while ((enMatch = enPattern.exec(plain)) !== null) {
    const inline = enMatch[0].match(/^([\u4e00-\u9fff]{2,12})（/);
    if (inline) pushCandidate(inline[1]);
  }

  const bookRe = /『([\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff][^』]{1,20})』/g;
  let bookMatch;
  while ((bookMatch = bookRe.exec(plain)) !== null) {
    pushCandidate(bookMatch[1]);
  }

  const tcgRe = /([\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff][\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff·\s]{0,16})（Tcg）/gi;
  let tcgMatch;
  while ((tcgMatch = tcgRe.exec(plain)) !== null) {
    pushCandidate(tcgMatch[1]);
  }

  if (plain.toLowerCase().includes(normalizedEn)) {
    for (const candidate of found) {
      if (plain.includes(`「${candidate}」`) || plain.includes(`『${candidate}』`)) {
        return candidate;
      }
    }
  }

  return found[0] || null;
}

module.exports = {
  hasCjk,
  normalizeEnglish,
  isValidChineseCardName,
  toTraditionalForHk,
  getChineseSearchKeywords,
  englishMatchesSnippet,
  extractChineseFromVerifiedSnippet,
  extractChineseFromTitle,
  parse52pokeSearchItems,
  parseWebSearchResults,
};
