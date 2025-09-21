# PetriVerse

PetriVerse（ペトリバース）は、ペトリ皿の中に広がる小さな生態系を再現するフロントエンド専用シミュレーターです。React + TypeScript をベースに Feature-Sliced Design を意識した構成で実装されています。

## 主な機能

- Canvas ベースの観察シーンで微生物・捕食者・環境の変化をリアルタイム描画。
- 温度 / 酸素 / 水質 / 突然変異率を調整可能な環境パネル。
- 高栄養 / 低栄養 / 毒性エサを散布するフィードアクション。
- 世代交代や突然変異・捕食イベントを記録する進化ログ。
- 出現した生物・イベントを自動登録し、JSON でエクスポート / インポートできる図鑑。
- 進化や捕食の傾向を簡易的に集計するランキングビュー。

## 開発

```
npm install
npm run dev
```

> ネットワーク制限環境では依存パッケージの取得が行えない場合があります。その場合はローカルで依存関係を解決してからビルドを行ってください。

## フォルダ構成（抜粋）

```
src/
├── app              # プロバイダ、ルーティング、グローバルスタイル
├── entities         # organism / predator / environment / food / encyclopediaEntry
├── features         # feed-organism, encyclopedia などの機能単位
├── widgets          # observationScene, environmentControl, evolutionHistory
├── pages            # main / encyclopedia / ranking ページ
└── shared           # 共通ロジック、定数、ユーティリティ
```
