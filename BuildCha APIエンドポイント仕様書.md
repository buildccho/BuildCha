# **APIエンドポイント ドキュメント**

このドキュメントでは、提供されたスクリーンショットの情報を元に、APIエンドポイントをまとめます。

## **Users API (ユーザー関連)**

| Method | Endpoint | 目的 | リクエストボディ | レスポンスボディ |
| :---- | :---- | :---- | :---- | :---- |
| GET | /user | ユーザー情報取得 | \- | ユーザー情報 |
| PATCH | /user | ユーザー情報更新 | 変更内容 | \- |
| POST | /signup | ユーザー登録 | ユーザー情報 | \- |
| POST | /signin | ログイン | \- | \- |

## **Maps API (マップ関連)**

| Method | Endpoint | 目的 | リクエストボディ | レスポンスボディ |
| :---- | :---- | :---- | :---- | :---- |
| GET | /maps | 街一覧取得 | \- | 街一覧 |
| GET | /maps/:id | 街取得 | \- | \- |
| POST | /maps | 街作成 | Map 名前 | \- |
| PATCH | /maps/:id | 街の情報更新 | 更新内容 | \- |
| DELETE | /maps/:id | 街削除 | \- | \- |

## **Quests API (クエスト関連)**

| Method | Endpoint | 目的 | リクエストボディ | レスポンスボディ |
| :---- | :---- | :---- | :---- | :---- |
| GET | /quests | クエスト一覧取得 | \- | \- |
| GET | /quests/:id | クエスト取得 | \- | \- |
| POST | /quests | クエスト作成（管理者用） | クエスト情報 | \- |
| PATCH | /quests/:id | クエスト更新（管理者用） | クエスト修正 | \- |
| DELETE | /quests/:id | クエスト削除（管理者用） | \- | \- |

## **User Objects API (ユーザーオブジェクト関連)**

| Method | Endpoint | 目的 | リクエストボディ | レスポンスボディ |
| :---- | :---- | :---- | :---- | :---- |
| GET | /objects/:id | オブジェクト取得 | \- | \- |
| POST | /objects | オブジェクト作成 | questId, mapId, 3dObject, history | objects |
| PATCH | /objects/:id | オブジェクト更新 | 更新内容 | \- |
| DELETE | /objects/:id | オブジェクト削除 | \- | \- |
| POST | /ai/create | オブジェクト作成 (AI)（作成済み） | userInput, history | 3dObject |
| POST | /ai/compare | 比較 (AI)（作成済み） | \- | comment, score |

