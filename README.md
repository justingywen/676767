# 淡水小釣手 · Tamsui Fishing Club

免費、純前端的路亞釣魚小遊戲，直接託管在 GitHub Pages。沒有後端、登入、付費服務或外部素材依賴。

## 已完成

- 漁人碼頭、油車口、公司田溪三個釣點，全部開放，各有獨立水景與魚池。
- UL／L／ML／M 路亞竿；軟蟲、米諾、鉛筆、小鐵板、亮片；相容釣組與餌重檢查。
- 蓄力拋投、動態釣線與水花、逗餌、咬鉤揚竿、捲線洩力、魚衝刺、起魚展示。
- 8 種魚、截斷常態尺寸抽樣、尺寸相關重量、個人最大與最重紀錄。
- LocalStorage 自動存檔、JSON 匯出／匯入、音效、減少動態效果。
- 桌機與手機版面、觸控與鍵盤操作、背景暫停。

## 本機遊玩

需安裝 Node.js 20 以上。不需要安裝 npm 套件。

```sh
node scripts/serve.mjs
```

瀏覽器開啟 http://localhost:4173。請透過 HTTP 開啟，直接雙擊 HTML 的 `file://` 網址不支援 ES modules。

也可使用 `npm run dev`。若 4173 已被使用，可先設定環境變數 `PORT`。

## 操作

1. 選釣點、路亞竿、擬餌與釣組。
2. 按住橘色按鈕／空白鍵蓄力，放開拋竿。
3. 等待時輕點同一按鈕逗餌；看到「！」立刻按下揚竿。
4. 搏魚時按住捲線、放開洩力，保持拉力在綠色區間。
5. 魚衝刺前會有提示。耗盡體力並拉近到岸邊，即可起魚。
6. 魚獲自動登錄，放流後可以重新選裝備。

鍵盤 Enter 提供切換操作：蓄力時再按一次拋出，搏魚時切換捲線／洩力。切換分頁或失焦後，按「繼續釣魚」恢復。

## 測試與建置

```sh
node --test
node scripts/build.mjs
node scripts/serve.mjs dist
```

建置輸出為 `dist/`。所有網址使用相對路徑，可部署在 `/676767/` 等 GitHub Pages 子目錄。

## GitHub Pages

1. 將這些檔案提交並推送到 GitHub repository 的 `main` 分支。
2. 在 repository 的 **Settings → Pages → Source** 選擇 **GitHub Actions**。
3. `.github/workflows/deploy.yml` 會測試、建置並部署 `dist/`。
4. 完成後使用 Actions 的 deployment URL；一般為 `https://你的帳號.github.io/676767/`。

若預設分支不是 `main`，修改 workflow 的 `on.push.branches`。此工作區目前只準備部署檔案，尚未代表已推送或部署。

## 程式結構

```text
index.html              介面、對話框與無障礙結構
src/style.css           響應式版面與視覺
src/data.js             釣點、魚種、路亞竿、擬餌與向量插圖
src/mechanics.js        抽魚、尺寸重量、搏魚、存檔驗證
src/main.js             遊戲狀態、輸入、介面與儲存
src/scene.js            Canvas 水景、釣線、釣手與動畫
test/mechanics.test.js  規則、裝備與存檔測試
scripts/                零依賴本機伺服器與靜態建置
docs/DESIGN.md          資料來源、模型假設與擴充說明
```

## 紀錄與素材

存檔 key 為 `tamsui-fishing:save:v1`；不同瀏覽器、裝置或網站來源不共用紀錄。請使用設定中的匯出／匯入備份。匯入會取代目前進度。

景色與魚插圖使用本專案的 Canvas／SVG 程式繪製，音效由 Web Audio 合成。魚類插圖為風格化示意，不作辨識依據。魚種出現率、尺寸與拉力是遊戲平衡參數；生態資料來源與限制見 `docs/DESIGN.md`。
