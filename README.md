function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  // Memasukkan data ke baris baru di Excel/Sheets
  sheet.appendRow([
    new Date(), 
    data.items, 
    data.table, 
    data.total
  ]);
  
  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}


tambahkan code diatas di app script
