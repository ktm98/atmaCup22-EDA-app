# AtmaCup22 Bounding Box EDA Web App

React + Vite 製の軽量 EDA UI です。`/data` 配下にある画像・CSV をそのまま配信し、BBox の可視化・フィルタ・簡易統計をブラウザで行えます。

## セットアップ
1. Node.jsを用意
2. 依存インストール
   ```bash
   npm install
   ```
3. `data/` に画像とメタデータを配置  
   - 既定: `data/images/*.jpg`, `data/atmaCup22_metadata/{train_meta,test_meta,test_top_meta}.csv`
4. 開発サーバ
   ```bash
   npm run dev
   ```
   ブラウザで表示されるローカル URL にアクセス。
5. 本番ビルド / プレビュー
   ```bash
   npm run build
   npm run preview
   ```

## 主な機能
- 画像への BBox オーバーレイ表示（ラベル色分け、ラベルなしは黄色）
- データセット / カメラ角度 / Quarter / セッション範囲 / フレーム範囲 / ラベルクエリによるフィルタ
- ラベル頻度ヒストグラム、Quarter×Angle のカバレッジ棒グラフ
- BBox 基本統計（件数、ユニークラベル、平均面積）と一致画像のリストナビゲーション
- 同期ビューで同一時間帯の他アングルを並べて比較
- 画像ビューアはプレイ/シーク付き。ラベル表 hover で該当 bbox のみ強調（unlabeled も可）。

## ディレクトリ構成
- `src/` アプリ本体
  - `App.tsx` 画面構成とフィルタ/統計ロジック
  - `components/` フィルタ、チャート、ビューア、同期ビューなど UI コンポーネント
  - `utils/metaLoader.ts` CSV を取得し、画像単位にグルーピング
- `data/` 画像と CSV（サーバ起動時に `/data/...` で配信）
- `vite.config.ts` `/data` を静的配信するミドルウェアを追加

## 開発サーバのパスエラー対策
`The request id ".../index.html" is outside of Vite serving allow list` が出る場合、`vite.config.ts` の `server.fs.allow` にプロジェクトルートと `data` が含まれていることを確認してください（本リポジトリは設定済み）。

## 備考
- 画像枚数が多いためチャンクサイズ警告が出る場合があります（必要なら `manualChunks` や dynamic import で分割してください）。
- 追加のメタ CSV を置く場合は `metaLoader.ts` を拡張してください。
