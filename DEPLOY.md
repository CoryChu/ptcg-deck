# PTCG Deck 雲端部署指南（Vercel）

部署完成後，手機／平板只要有網路就能使用，**不需開 Mac、不需終端機**。

---

## 方式 A：網頁介面（推薦，最簡單）

### 1. 上傳到 GitHub（只需做一次）

在終端機執行：

```bash
cd "/Users/corychu/Desktop/Cory/Cursor/ptcg-laser-printer"

git init
git add index.html manifest.json assets/ vercel.json .vercelignore .gitignore
git commit -m "Deploy PTCG Deck to Vercel"

git branch -M main
git remote add origin https://github.com/你的帳號/ptcg-deck.git
git push -u origin main
```

> 請先在 GitHub 建立名為 `ptcg-deck` 的 **Public** 儲存庫。

### 2. 連接 Vercel

1. 前往 https://vercel.com 並用 GitHub 登入
2. 點 **Add New… → Project**
3. 選擇 `ptcg-deck` 儲存庫 → **Import**
4. 設定確認（通常不用改）：
   - **Framework Preset**：Other
   - **Build Command**：留空
   - **Install Command**：留空
   - **Output Directory**：留空
5. 點 **Deploy**

### 3. 取得網址

約 30 秒後會得到網址，例如：

```
https://ptcg-deck.vercel.app
```

在 iPhone／iPad Safari 打開，可點 **分享 → 加入主畫面** 當 App 使用。

### 之後更新

修改程式後：

```bash
git add index.html manifest.json assets/ vercel.json
git commit -m "更新內容"
git push
```

Vercel 會自動重新部署（約 30 秒）。

---

## 方式 B：Vercel CLI（不用 GitHub）

```bash
cd "/Users/corychu/Desktop/Cory/Cursor/ptcg-laser-printer"
npx vercel login
npx vercel --prod
```

依提示操作，完成後會顯示網址。

---

## 注意事項

- 牌組資料存在瀏覽器記憶體，重新整理會清空，請用 **Save Deck** 備份
- 列印／PDF 建議在 Mac 或已連接印表機的裝置上使用
- 免費方案已足夠個人使用
