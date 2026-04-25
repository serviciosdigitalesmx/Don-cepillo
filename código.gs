/**
 * Don Cepillo - Backend de Google Apps Script
 * Recibe eventos del frontend:
 * - action: "trackClick"
 * - action: "saveOrder"
 */

const APP_CONFIG = {
  // Si este script está ligado a un Spreadsheet, usa el activo.
  // Si es standalone, puedes pegar aquí el ID de tu hoja.
  SPREADSHEET_ID: '1WK7xb_XuffavpRqp7N-Lm6AbD1u5-Pdt6nTq2PPzA2Y',
  SHEETS: {
    ORDERS: 'Orders',
    CLICKS: 'Clicks',
  },
};

function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'Don Cepillo API',
    now: new Date().toISOString(),
  });
}

function doPost(e) {
  try {
    const body = parseBody_(e);
    const action = body.action;
    const payload = body.payload || {};
    const timestamp = body.timestamp || new Date().toISOString();

    if (!action) {
      return jsonResponse_({ ok: false, error: 'Missing action' });
    }

    if (action === 'trackClick') {
      saveClick_(timestamp, payload);
      return jsonResponse_({ ok: true, action: 'trackClick' });
    }

    if (action === 'saveOrder') {
      saveOrder_(timestamp, payload);
      return jsonResponse_({ ok: true, action: 'saveOrder' });
    }

    return jsonResponse_({ ok: false, error: `Unknown action: ${action}` });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: error.message || String(error),
    });
  }
}

function saveClick_(timestamp, payload) {
  const sheet = getOrCreateSheet_(APP_CONFIG.SHEETS.CLICKS, [
    'timestamp',
    'event',
    'url',
    'referrer',
    'userAgent',
    'extra',
  ]);

  sheet.appendRow([
    timestamp,
    payload.event || '',
    payload.url || '',
    payload.referrer || '',
    payload.userAgent || '',
    JSON.stringify(payload),
  ]);
}

function saveOrder_(timestamp, payload) {
  const sheet = getOrCreateSheet_(APP_CONFIG.SHEETS.ORDERS, [
    'timestamp',
    'name',
    'address',
    'items',
    'itemsDetailed',
    'total',
    'notes',
    'status',
    'source',
  ]);

  sheet.appendRow([
    timestamp,
    payload.name || '',
    payload.address || '',
    payload.items || '',
    payload.itemsDetailed || '',
    payload.total || 0,
    payload.notes || '',
    payload.status || 'Pendiente',
    payload.source || 'Web',
  ]);
}

function getSpreadsheet_() {
  if (APP_CONFIG.SPREADSHEET_ID) {
    return SpreadsheetApp.openById(APP_CONFIG.SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet_(sheetName, headers) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function parseBody_(e) {
  const raw = e && e.postData && e.postData.contents;
  if (!raw) return {};
  return JSON.parse(raw);
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
