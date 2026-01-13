
// Configuration
const SCRIPT_PROP = PropertiesService.getScriptProperties();
const DRIVE_FOLDER_ID = '1qvNtLkM4uoFsI8I8bAXvj_3JlNYsXznP'; // Provided by user

// Helper to get or create sheet
function getSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // Initialize headers based on sheet name
    if (sheetName === 'Inventory') {
      sheet.appendRow(['id', 'name', 'sku', 'category', 'brand', 'stockQty', 'reorderLevel', 'costPrice', 'sellingPrice', 'status', 'notes', 'imageUrl']);
    } else if (sheetName === 'Jobs') {
      // Added 'km' to the end
      sheet.appendRow(['id', 'date', 'customerName', 'phone', 'brand', 'model', 'numberPlate', 'fuelType', 'fuelLevel', 'vehicleImages', 'status', 'paymentStatus', 'advanceAmount', 'complaints', 'notes', 'lineItems', 'totalAmount', 'km']);
    } else if (sheetName === 'invoice') {
      // New Invoice Sheet
      sheet.appendRow(['jobId', 'description', 'category', 'quantity', 'unitPrice', 'total', 'type']);
    }
  }
  return sheet;
}

// REST API Entry Point: GET
function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'getInventory') {
      return getData('Inventory');
    } else if (action === 'getJobs') {
      return getData('Jobs');
    } else if (action === 'getInvoiceItems') {
      return getInvoiceItems(e.parameter.jobId);
    }

    return jsonResponse({ status: 'error', message: 'Invalid action' });
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() });
  }
}

// REST API Entry Point: POST
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'addPart') {
      return addRow('Inventory', data.payload);
    } else if (action === 'addJob') {
      return addRow('Jobs', data.payload);
    } else if (action === 'deletePart') {
      return deleteRow('Inventory', data.payload.id);
    } else if (action === 'deleteJob') {
      return deleteRow('Jobs', data.payload.id);
    } else if (action === 'updatePart') {
      return updateRow('Inventory', data.payload.id, data.payload.updates);
    } else if (action === 'updateJob') {
      return updateRow('Jobs', data.payload.id, data.payload.updates);
    } else if (action === 'saveInvoiceItems') {
      return saveInvoiceItems(data.payload.jobId, data.payload.items);
    } else if (action === 'uploadImage') {
      return uploadImage(data.payload);
    }

    return jsonResponse({ status: 'error', message: 'Invalid action' });
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() });
  }
}

// --- Invoice Specific Logic ---

function getInvoiceItems(jobId) {
  const sheet = getSheet('invoice');
  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // remove headers (jobId, description...)

  // Columns: 0=jobId, 1=description, 2=category, 3=quantity, 4=unitPrice, 5=total, 6=type
  const items = data
    .filter(row => String(row[0]) === String(jobId))
    .map(row => ({
      id: Math.random().toString(36).substr(2, 9), // Generate temp ID for frontend
      description: row[1],
      category: row[2],
      quantity: Number(row[3]),
      unitPrice: Number(row[4]),
      total: Number(row[5]),
      type: row[6] || 'Labour'
    }));

  return jsonResponse({ status: 'success', data: items });
}

function saveInvoiceItems(jobId, items) {
  const sheet = getSheet('invoice');
  const data = sheet.getDataRange().getValues();

  // 1. Get Old Items for Diffing (Stock Management)
  const oldItems = data
    .filter(row => String(row[0]) === String(jobId))
    .map(row => ({
      description: row[1],
      quantity: Number(row[3]),
      type: row[6] || 'Labour'
    }))
    .filter(item => item.type === 'Part');

  // 1. Delete existing rows for this jobId
  // We go backwards to avoid index shifting issues
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(jobId)) {
      sheet.deleteRow(i + 1);
    }
  }

  // 2. Add new items
  if (items && items.length > 0) {
    const newRows = items.map(item => [
      jobId,
      item.description,
      item.category,
      item.quantity,
      item.unitPrice,
      item.total,
      item.type || 'Labour'
    ]);

    // Check if sheet is empty (only headers), if so appendRow, else getRange...
    // simpler to just loop appendRow for safety or use getRange for bulk
    if (newRows.length > 0) {
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
    }
  }

  // 4. Update Inventory Stock (Diff Logic)
  const inventorySheet = getSheet('Inventory');
  const invData = inventorySheet.getDataRange().getValues();
  const invHeaders = invData.shift();

  const nameIdx = invHeaders.indexOf('name');
  const stockIdx = invHeaders.indexOf('stockQty');

  if (nameIdx !== -1 && stockIdx !== -1) {
    const stockChanges = {};
    // Plus: Restore Old Stock
    oldItems.forEach(item => {
      stockChanges[item.description] = (stockChanges[item.description] || 0) + item.quantity;
    });
    // Minus: Deduct New Stock
    items.forEach(item => {
      if (item.type === 'Part') {
        stockChanges[item.description] = (stockChanges[item.description] || 0) - Number(item.quantity);
      }
    });
    // Write to Sheet
    for (let i = 0; i < invData.length; i++) {
      const rowName = invData[i][nameIdx];
      if (stockChanges[rowName]) {
        const currentStock = Number(invData[i][stockIdx]) || 0;
        const newStock = currentStock + stockChanges[rowName];
        inventorySheet.getRange(i + 2, stockIdx + 1).setValue(newStock);
      }
    }
  }

  return jsonResponse({ status: 'success', message: 'Invoice saved and stock updated' });
}

// --- Standard Helpers ---

// Helper: Get data as JSON
function getData(sheetName) {
  const sheet = getSheet(sheetName);
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift(); // Remove headers

  const data = rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      let value = row[index];
      if ((header === 'complaints' || header === 'lineItems' || header === 'vehicleImages') && typeof value === 'string' && value.startsWith('[')) {
        try { value = JSON.parse(value); } catch (e) { }
      }
      obj[header] = value;
    });
    return obj;
  });

  return jsonResponse({ status: 'success', data: data });
}

// Helper: Add Row
function addRow(sheetName, payload) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const newRow = headers.map(header => {
    let value = payload[header];
    if (value && (Array.isArray(value) || typeof value === 'object')) {
      return JSON.stringify(value);
    }
    return value !== undefined ? value : '';
  });

  sheet.appendRow(newRow);
  return jsonResponse({ status: 'success', message: 'Added successfully' });
}

// Helper: Delete Row
function deleteRow(sheetName, id) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ status: 'success', message: 'Deleted successfully' });
    }
  }
  return jsonResponse({ status: 'error', message: 'ID not found' });
}

// Helper: Update Row
function updateRow(sheetName, id, updates) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      const rowNumber = i + 1;
      Object.keys(updates).forEach(key => {
        const colIndex = headers.indexOf(key);
        if (colIndex !== -1) {
          let value = updates[key];
          if (value && (Array.isArray(value) || typeof value === 'object')) {
            value = JSON.stringify(value);
          }
          sheet.getRange(rowNumber, colIndex + 1).setValue(value);
        }
      });
      return jsonResponse({ status: 'success', message: 'Updated successfully' });
    }
  }
  return jsonResponse({ status: 'error', message: 'ID not found' });
}

// Helper: Upload Image to Drive and get lh3 link
function uploadImage(payload) {
  const { data, filename, mimeType } = payload;
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const blob = Utilities.newBlob(Utilities.base64Decode(data), mimeType, filename);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  let lh3Link = '';
  try {
    const driveFile = Drive.Files.get(file.getId(), { fields: 'thumbnailLink' });
    lh3Link = driveFile.thumbnailLink;
  } catch (e) {
    lh3Link = `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w1000`;
  }
  return jsonResponse({ status: 'success', url: lh3Link, fileId: file.getId() });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
