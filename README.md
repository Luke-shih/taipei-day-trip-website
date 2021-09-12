# 台北一日遊
### 本專案以 Open data 上台北景點作為資料根據，建置台北一日遊的導覽電商網站，內容包含
- 景點之瀏覽、搜尋功能。
- 個別景點資訊分頁，預定行程購物車。
- 與 TapPay 金流服務串接，可用測試信用卡進行付款功能。

### Demo
點擊此網址可前往台北一日遊頁面：http://www.taipeitrip.com:3000/
- 測試帳號：test@test.com
- 測試密碼：test
- Credit Card : 4242-4242-4242-4242
- Date : 01/23
- CVV : 123
- 或可自行註冊帳號亦可使用

### Technologies
- 使用 Python Flask 做為後端框架
- RESTful API 架構實踐專案功能
- 原生HTML+CSS完成RWD網頁
- 藉由 Open government API 蒐集景點資料並新增至 MySQL 資料庫
- 使用 JavaScript 達到 AJAX 及 前端功能開發
- 景點關鍵字搜尋
- 結合 TapPay 開發付款系統
- 將網站部屬至 EC2 。

### 功能介紹
#### 首頁
- 滾輪往下滑，可以閱覽所有景點資訊(1次重新列出12筆新景點)，也可以透過關鍵字搜尋景點標題
![首頁](https://i.imgur.com/MIFGXBH.jpg)
- 景點頁面
![景點頁面](https://i.imgur.com/SoKccmr.jpg)
### 帳號管理
- 使用者可以註冊、登入、登出網站系統
![登入](https://i.imgur.com/Ni6WBc3.jpg)
### TapPay 支付系統
![TapPay](https://i.imgur.com/qu4H68G.jpg)
### 預定完成
![預定完成](https://i.imgur.com/3KfsHt9.jpg)
