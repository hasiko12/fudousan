# Real Estate Copilot MVP A

反響統合・物件マッチング・内見調整を支援する、不動産担当者向けコパイロットのMVP仕様と静的HTMLモックアップです。

このリポジトリは、まず営業デモと仕様検証を目的にしています。現時点では本番アプリではなく、追加依存なしでローカル確認できる静的モックアップと関連仕様書を管理します。

## 概要

MVP Aの目的は、SUUMO、HOME'S、アットホーム、自社フォーム、LINE転記、電話メモなどから来る反響を1画面に集約し、顧客条件と保有物件を照合し、内見候補日時と返信文ドラフトを素早く作ることです。

重要な方針:

- 顧客への完全自動送信はしない。
- AIは条件抽出、要約、物件候補説明、返信文ドラフトに限定する。
- 返信文は必ず担当者の承認ゲートを通す。
- Demo環境では実名、実電話番号、実メールアドレス、実問い合わせ本文を使わない。

## リポジトリ構成

```text
.
├── real-estate-copilot-mockup.html          # 主要6画面の静的HTMLモックアップ
├── index.html                               # GitHub Pages用の入口
├── reference-ui-mockup.html                 # デザイン参考HTML
├── mvp-a-real-estate-copilot-spec.md        # MVP Aの機能・技術仕様
├── mvp-a-cloud-stack-deployment-strategy.md # クラウド公開・構成方針
├── design-guide-for-codex.md                # UI/UXデザイン指示書
├── README-local.md                          # ローカル確認手順の短縮版
├── scripts/
│   ├── build.mjs                            # dist/index.html を生成
│   ├── serve.mjs                            # ローカル静的サーバー
│   └── smoke-serve.mjs                      # HTTP配信のsmoke test
└── test/
    └── mockup.test.mjs                      # 静的モックの構造テスト
```

## ローカルで確認する

Node.js が入っていれば、外部パッケージのインストールなしで動きます。

```bash
npm run build
npm test
npm run test:serve
npm run serve
```

ブラウザで次を開きます。

```text
http://127.0.0.1:4173/
```

各コマンド:

- `npm run build`: `real-estate-copilot-mockup.html` を `dist/index.html` にコピーします。
- `npm test`: 6画面、承認ゲート、レスポンシブCSS、JS構文、ID参照を検査します。
- `npm run test:serve`: 一時サーバーを起動し、HTTPでHTMLが返ることを確認して停止します。
- `npm run serve`: `dist/` を `http://127.0.0.1:4173/` で配信します。
- `npm run dev`: ルートのHTMLを直接配信します。ビルド前の確認用です。

## モックアップの画面

`real-estate-copilot-mockup.html` には以下の6画面が入っています。

- ダッシュボード
- リード一覧
- リード詳細
- 物件管理
- 受信トレイ
- 設定

主なデモ操作:

- 画面切替
- 反響貼り付けモーダル表示
- AI返信文のメール/LINE/SMS切替
- 返信文の承認状態切替
- タスク完了切替
- 内見候補スロット選択
- 物件公開トグル

## 技術方針

詳細は [mvp-a-real-estate-copilot-spec.md](./mvp-a-real-estate-copilot-spec.md) と [mvp-a-cloud-stack-deployment-strategy.md](./mvp-a-cloud-stack-deployment-strategy.md) を参照してください。

現時点の推奨:

| 段階 | 目的 | 推奨構成 |
| --- | --- | --- |
| Demo | 営業用デモ、サンプルデータのみ | Cloudflare Pages + Pages Functions/Workers + D1 |
| Pilot | 1社専用で実データ検証 | Cloudflare Pages or Vercel + Railway API + Railway Postgres |
| SaaS | 複数事業者向け提供 | Supabase Pro or Railway Postgres + 専用API |

実装時の基本方針:

- DBアクセスはrepository層に閉じ込める。
- ORMはD1/SQLiteとPostgres移行を考慮してDrizzle ORMを第一候補にする。
- AI処理はサーバー側だけで実行する。
- `OPENAI_API_KEY` などのsecretをフロントに露出しない。
- Demo seed dataには実個人情報を含めない。

## GitHub Pages公開

このリポジトリはGitHub Pagesの `main` ブランチ root 配信で公開できます。

- `index.html` は `real-estate-copilot-mockup.html` へリダイレクトします。
- `dist/` はアップロード不要です。ローカルビルド確認用の生成物として `.gitignore` に含めています。
- Actions workflowは不要です。

## テスト内容

`npm test` では以下を確認します。

- 主要6画面が存在する。
- 重要なIDに重複がない。
- JSが参照するDOM IDが存在する。
- AI承認ゲート文言がある。
- `送信済み` や `自動送信ボタン` のような禁止表現がない。
- デザイントークンとレスポンシブCSSがある。
- インラインJSが構文エラーなくparseできる。
- `dist/index.html` を生成できる。

## 注意

- このリポジトリは現時点では静的モックアップ中心です。
- 本番DB、認証、OpenAI API呼び出し、Cloudflare D1連携はまだ実装していません。
- Demo公開時はサンプルデータのみを使ってください。
- 実データを預かる場合は、Railway Postgres等のPilot構成、認証、バックアップ、削除ルール、ログ制限を先に実装してください。
