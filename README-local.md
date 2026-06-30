# ローカル確認手順

このリポジトリは依存インストールなしで、静的HTMLモックをビルド・配信・テストできます。

## コマンド

```bash
npm run build
npm test
npm run test:serve
npm run serve
```

- `npm run build`: `real-estate-copilot-mockup.html` を `dist/index.html` にコピーします。
- `npm test`: HTML構造、6画面、承認ゲート、レスポンシブCSS、JS構文を検査します。
- `npm run test:serve`: ローカルサーバーを一時起動し、HTTPでHTMLが返ることを確認して停止します。
- `npm run serve`: `dist/` を `http://localhost:4173` で配信します。
- `npm run dev`: ルートのHTMLを直接配信します。ビルド前の確認用です。

## 補足

外部パッケージを使わない構成なので、`npm install` は不要です。
