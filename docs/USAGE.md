# 使い方ガイド

アプリ起動後の各 UI 操作とデータ読み込みの流れです。

## 画面構成
- **Summary**: 現在のフィルタに一致する BBox 件数、画像件数、ユニークラベル数、平均面積を表示。
- **Charts**:  
  - ラベル頻度（上位 12 ラベル）  
  - Quarter × Angle のカバレッジ棒グラフ
- **Filters**: データセット・角度・Quarter・セッション/フレーム範囲・ラベル文字列で絞り込み。
- **Image Viewer**: 現在の画像に BBox をオーバーレイ。Next/Prev でページング。
- **同期ビュー**: 同じ `quarter / session / frame` を持つ他アングル・データセットを並べて比較。
- **Image List**: フィルタに一致する画像の先頭 25 件を一覧し、`View` でビューアにジャンプ。

## フィルタの使い方
- **Dataset**: `train | test | test_top` を複数選択。  
- **Camera angle**: `side | top` を複数選択。  
- **Quarter group**: `all` もしくは `Q1`〜`Q4` の接頭辞で絞り込み。  
- **Quarter code (exact)**: `Q1-000` など正確な quarter で絞り込み。
- **Label contains**: 部分一致でラベル番号を検索。`unlabeled` を入力するとラベルなしのみ。  
- **Session / Frame range**: 数値入力で範囲を指定。CSV の最小・最大が初期値。

## 画像ビューア
- BBox はラベルごとに色分け（ラベルなしは黄色）。凡例はバッジで表示。
- 右上の Prev/Next で一致画像を順送り。ショートカットは未設定（必要なら今後追加）。
- Play/Pause ボタンで同一 session/angle を自動再生（初期 500ms 間隔、入力で調整可）。
- `Session frame` ボタンで同一 session/angle 内の前後フレームにジャンプし、ミニ動画的に確認可能。
- セッションナビ: Prev/Next session とセレクトボックスで、同一 quarter/angle の別セッション先頭にジャンプ。
- 画像ファイル名（`...jpg`）をヘッダーに表示。
- 右側のラベル表はラベル昇順。行 hover で該当BBoxのみ強調し、他は薄くなる（unlabeled も可）。Pos/Size からどのBBoxか特定しやすい。
- テーブルには先頭 20 BBox を表示。全件を見たい場合はフィルタを絞るかソースを直接確認。

## データについて
- `/data/atmaCup22_2nd_meta/{train_meta.csv,test_meta.csv}` を取得します。  
- train 画像は `{quarter}__{angle}__{session}__{frame}.jpg` を想定し、`/data/images` を参照します。  
- test 画像は crop のみで、`test_meta.csv` の `rel_path` を `/data/crops/` に連結したパスを参照します（例: `/data/crops/crops/Q4-000/sess_0001/top/...`）。

## よくある操作
- **ラベル 12 の top カメラだけ見る**: Camera angle で `top` のみ、Label contains に `12`。  
- **Quarter 2 のセッション 0〜2 のみ**: Quarter group `Q2`、Session range を 0〜2。  
- **テスト bbox の確認**: Dataset で `test` のみを選択（ラベルなしが黄枠）。  
- **同じ時間をマルチアングルで見る**: 何か1枚を `View` で開いた後、下部の「同期ビュー」に並ぶ他アングルをクリック。さらに `Session frame` ボタンで連続フレームを追うと簡易動画として確認できる。

## トラブルシュート
- 画像が出ない: `data/images` にファイルが存在し、ファイル名ルールが一致しているか確認。
- CSV を読めない: ブラウザのネットワークタブで `/data/atmaCup22_metadata/...` が 200 か確認。
- ビルド時のチャンク警告: `vite.config.ts` で `build.chunkSizeWarningLimit` を上げるか、チャートなどを dynamic import してください。
