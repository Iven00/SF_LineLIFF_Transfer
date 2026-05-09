const SPREADSHEET_ID = '1YKUInNATvHY1VNoFngw0NmROjkn1uSC-fX3iyOK0qgk';
const SHEET_NAME = 'join_logs';
const HEADERS = [
  'timestamp',
  'lineUserId',
  'source',
  'displayName',
  'pictureUrl',
  'statusMessage',
  'userAgent',
  'pageUrl'
];

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    validatePayload_(payload);

    const sheet = getLogSheet_();
    sheet.appendRow([
      new Date(),
      payload.userId,
      payload.source || '',
      payload.displayName || '',
      payload.pictureUrl || '',
      payload.statusMessage || '',
      payload.userAgent || '',
      payload.pageUrl || ''
    ]);

    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function doGet() {
  return json_({
    ok: true,
    service: 'SF LINE LIFF Transfer',
    sheetName: SHEET_NAME
  });
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Missing request body');
  }
  return JSON.parse(e.postData.contents);
}

function validatePayload_(payload) {
  if (!payload.userId) {
    throw new Error('Missing userId');
  }
}

function getLogSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  const currentHeaders = headerRange.getValues()[0];
  const hasHeaders = currentHeaders.some(Boolean);
  if (!hasHeaders) {
    headerRange.setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function json_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
