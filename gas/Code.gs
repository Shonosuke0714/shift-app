// =============================
// 設定
// =============================
var SPREADSHEET_ID = "YOUR_SPREADSHEET_ID"; // ← スプレッドシートのIDに変更
var SHEET_SLOTS = "シフト枠";
var SHEET_APPLICATIONS = "申請";

// CORS許可するオリジン（VercelのURLに変更）
var ALLOWED_ORIGIN = "*";

// =============================
// GETリクエスト処理
// =============================
function doGet(e) {
  var action = e.parameter.action || "";

  if (action === "getSlots") {
    return handleGetSlots();
  }

  return createResponse({ success: false, error: "不明なアクションです" });
}

// =============================
// POSTリクエスト処理
// =============================
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action || "";

    if (action === "submitApplication") {
      return handleSubmitApplication(body);
    }

    return createResponse({ success: false, error: "不明なアクションです" });
  } catch (err) {
    return createResponse({ success: false, error: "リクエストの解析に失敗しました: " + err.message });
  }
}

// =============================
// シフト枠一覧取得
// =============================
function handleGetSlots() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_SLOTS);

    if (!sheet) {
      return createResponse({ success: false, error: "シフト枠シートが見つかりません" });
    }

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return createResponse({ success: true, data: [] });
    }

    // 2行目からデータ取得（1行目はヘッダー）
    var values = sheet.getRange(2, 1, lastRow - 1, 10).getValues();

    var slots = values
      .filter(function(row) {
        // 枠IDが空の行はスキップ
        return row[0] !== "";
      })
      .map(function(row) {
        var date = row[2];
        // Date型の場合はISO文字列に変換
        if (date instanceof Date) {
          date = Utilities.formatDate(date, "Asia/Tokyo", "yyyy-MM-dd");
        }

        return {
          slotId: String(row[0]),
          slotName: String(row[1]),
          date: String(date),
          location: String(row[3]),
          startTime: String(row[4]),
          endTime: String(row[5]),
          jobContent: String(row[6]),
          capacity: Number(row[7]) || 0,
          applicationCount: Number(row[8]) || 0,
          status: String(row[9])
        };
      });

    return createResponse({ success: true, data: slots });
  } catch (err) {
    return createResponse({ success: false, error: "シフト枠の取得に失敗しました: " + err.message });
  }
}

// =============================
// シフト申請送信
// =============================
function handleSubmitApplication(body) {
  try {
    var name = body.name || "";
    var email = body.email || "";
    var slotId = body.slotId || "";
    var slotName = body.slotName || "";
    var category = body.category || "";
    var memo = body.memo || "";

    // バリデーション
    if (!name || !email || !slotId || !category) {
      return createResponse({ success: false, error: "必須項目が不足しています" });
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var appSheet = ss.getSheetByName(SHEET_APPLICATIONS);
    var slotSheet = ss.getSheetByName(SHEET_SLOTS);

    if (!appSheet || !slotSheet) {
      return createResponse({ success: false, error: "シートが見つかりません" });
    }

    // 申請IDを生成（現在のタイムスタンプ）
    var now = new Date();
    var applicationId = "APP-" + Utilities.formatDate(now, "Asia/Tokyo", "yyyyMMddHHmmss");
    var applicationDate = Utilities.formatDate(now, "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss");

    // 申請シートに追記
    // 申請ID, 申請日時, 氏名, メール, 希望枠ID, 希望枠名, 区分, メモ, ステータス
    appSheet.appendRow([
      applicationId,
      applicationDate,
      name,
      email,
      slotId,
      slotName,
      category,
      memo,
      "申請中"
    ]);

    // シフト枠シートの申請数をインクリメント
    var slotLastRow = slotSheet.getLastRow();
    if (slotLastRow >= 2) {
      var slotValues = slotSheet.getRange(2, 1, slotLastRow - 1, 1).getValues();
      for (var i = 0; i < slotValues.length; i++) {
        if (String(slotValues[i][0]) === String(slotId)) {
          var targetRow = i + 2; // 1-indexed + ヘッダー行分
          var currentCount = slotSheet.getRange(targetRow, 9).getValue();
          slotSheet.getRange(targetRow, 9).setValue(Number(currentCount) + 1);
          break;
        }
      }
    }

    return createResponse({ success: true, data: null });
  } catch (err) {
    return createResponse({ success: false, error: "申請の保存に失敗しました: " + err.message });
  }
}

// =============================
// レスポンス生成ヘルパー
// =============================
function createResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// =============================
// スプレッドシート初期化（初回実行用）
// =============================
function initializeSheets() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // シフト枠シートの作成
  var slotSheet = ss.getSheetByName(SHEET_SLOTS);
  if (!slotSheet) {
    slotSheet = ss.insertSheet(SHEET_SLOTS);
  }
  // ヘッダー設定
  slotSheet.getRange(1, 1, 1, 10).setValues([[
    "枠ID", "枠名", "日付", "場所", "開始時間", "終了時間", "業務内容", "募集人数", "申請数", "ステータス"
  ]]);
  slotSheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#4A90D9").setFontColor("#FFFFFF");
  slotSheet.setFrozenRows(1);

  // サンプルデータ追加
  slotSheet.getRange(2, 1, 3, 10).setValues([
    ["SLOT-001", "6月1日 倉庫作業", "2026-06-01", "東京倉庫A", "09:00", "17:00", "ピッキング・梱包", 5, 0, "募集中"],
    ["SLOT-002", "6月3日 店舗補助", "2026-06-03", "新宿店", "10:00", "15:00", "商品陳列・接客補助", 3, 0, "募集中"],
    ["SLOT-003", "6月5日 イベントスタッフ", "2026-06-05", "渋谷会場", "13:00", "20:00", "会場設営・案内", 8, 0, "募集中"]
  ]);

  // 申請シートの作成
  var appSheet = ss.getSheetByName(SHEET_APPLICATIONS);
  if (!appSheet) {
    appSheet = ss.insertSheet(SHEET_APPLICATIONS);
  }
  // ヘッダー設定
  appSheet.getRange(1, 1, 1, 9).setValues([[
    "申請ID", "申請日時", "氏名", "メール", "希望枠ID", "希望枠名", "区分", "メモ", "ステータス"
  ]]);
  appSheet.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#4A90D9").setFontColor("#FFFFFF");
  appSheet.setFrozenRows(1);

  Logger.log("初期化完了");
}
