# 繁體中文（zh-TW）排版

- **字型堆疊：** Web：`"PingFang TC", "Noto Sans TC", "Microsoft JhengHei UI", "Microsoft JhengHei", sans-serif`（英文字型放最前面讓拉丁字母用英文字型）。Slint：`default-font-family: "Microsoft JhengHei UI"`，在 Rust 端依序偵測 Microsoft JhengHei UI → Microsoft YaHei UI → PMingLiU → SimSun。宣告 `lang="zh-Hant-TW"`，避免瀏覽器挑到簡體字形。
- **字級與行高：** 內文 15–17px，行高 1.6–1.8；介面標籤 12–14px；標題行高 1.3–1.4。
- **行長：** 每行 30–40 個字。
- **不用斜體：** 中文沒有斜體，強調改用粗體、顏色或著重號（`text-emphasis: filled dot; text-emphasis-position: under right;`）。
- **字距：** 不要用負字距；標題可以微調 +0.02em。
- **斷行：** `line-break: strict;`、`overflow-wrap: anywhere;`，不要 `word-break: break-all`（會切斷英文單字與網址）。避免標點出現在行首（瀏覽器的 strict 規則大多會處理）。
- **標點：** 使用全形標點（，。、：；？！「」『』），引號用「」；中英文之間可以加半形空格，但全文要一致。
- **用語：** 檔案、資料夾、設定、預設、軟體、影片、網路、程式、介面、使用者（避免文件夾、默認、軟件、視頻、網絡）。
- **數字：** 表格與計數用等寬數字（`font-variant-numeric: tabular-nums`）。
- **輸入法：** 文字欄位要支援注音/倉頡選字中的 Enter，不可在選字時送出（`event.isComposing`）。
