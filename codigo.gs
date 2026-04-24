// Este script crea las hojas "Pedidos" y "Metricas" si no existen.
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  const p = data.payload;

  // Asegurar que las hojas existan antes de guardar
  initSheets(ss);

  if (action === "saveOrder") {
    const sheet = ss.getSheetByName("Pedidos");
    sheet.appendRow([
      "ORD-" + Math.floor(Math.random() * 100000), // ID de pedido
      new Date(), // Fecha
      p.name,
      p.address,
      p.items,
      p.total,
      p.notes || "Sin notas",
      "Pendiente" // Status
    ]);
  } 
  
  else if (action === "trackClick") {
    const sheet = ss.getSheetByName("Metricas");
    sheet.appendRow([
      new Date(),
      p.event,
      p.userAgent,
      p.referrer,
      JSON.stringify(p.extraData || {})
    ]);
  }

  return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
}

function initSheets(ss) {
  const sheets = [
    { name: "Pedidos", head: ["ID", "Fecha", "Cliente", "Dirección", "Pedido", "Total", "Notas", "Status"] },
    { name: "Metricas", head: ["Fecha", "Evento", "Dispositivo", "Referencia", "Detalles Extra"] }
  ];

  sheets.forEach(s => {
    if (!ss.getSheetByName(s.name)) {
      let sheet = ss.insertSheet(s.name);
      sheet.appendRow(s.head);
      sheet.getRange(1, 1, 1, s.head.length).setFontWeight("bold").setBackground("#f3f3f3");
    }
  });
}
