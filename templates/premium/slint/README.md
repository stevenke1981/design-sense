# Premium Slint template（玻璃 + 金屬）

- `tokens.slint`：所有顏色、圓角、間距（深色／淺色由 `Tokens.dark` 切換）。
- `components.slint`：`AuroraBackground`、`GlassPanel`、`MetalButton`（silver / gold / titanium）、`GlassToggle`、`GlassSlider`、`GlassTabs`、`IconButton`（含 tooltip 與 accessible-label）。
- `demo.slint`：把元件組成一個設定視窗。

## 老實說：Slint 沒有背景模糊

Slint 目前沒有 `backdrop-filter`，所以這裡的「玻璃」是模擬的：
半透明有色底 + 斜向白色光澤漸層 + 1px 亮邊 + 頂端高光線 + 柔和陰影，鋪在彩色漸層背景上。
文字一律放在有色底上，所以背後是什麼都讀得清楚。

## 預覽與截圖

```bash
slint-viewer demo.slint                     # 互動預覽
cd render
cargo run --release --no-default-features --features skia -- out.png dark   # 需要顯示器；Linux 可用 xvfb-run
cargo run --release -- out.png light        # 純軟體繪圖，免顯示器
```

注意：Slint 的 software renderer 不會把漸層裁成圓角，金屬按鈕會變成直角。
請用 Skia（Windows 預設，也是 speaktype 用的）或 FemtoVG 看真正效果。
README 裡的截圖是在 Linux + Xvfb 上用 Skia 畫的，字型用 Noto Sans CJK TC 代替微軟正黑體。
