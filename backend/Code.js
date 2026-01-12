
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
      // Added 'brand' and 'notes'
      sheet.appendRow(['id', 'name', 'sku', 'category', 'brand', 'stockQty', 'reorderLevel', 'costPrice', 'sellingPrice', 'status', 'notes', 'imageUrl']);
    } else if (sheetName === 'Jobs') {
      sheet.appendRow(['id', 'date', 'customerName', 'phone', 'brand', 'model', 'numberPlate', 'fuelType', 'fuelLevel', 'vehicleImages', 'status', 'paymentStatus', 'advanceAmount', 'complaints', 'notes', 'lineItems', 'totalAmount']);
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
    } else if (action === 'uploadImage') {
      return uploadImage(data.payload);
    }

    return jsonResponse({ status: 'error', message: 'Invalid action' });
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() });
  }
}

// Helper: Get data as JSON
function getData(sheetName) {
  const sheet = getSheet(sheetName);
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift(); // Remove headers

  const data = rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      // Handle array strings if necessary (e.g. complaints)
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
// Optimized to handle missing headers gracefully or just map strict headers
function addRow(sheetName, payload) {
  const sheet = getSheet(sheetName);
  // Get latest headers from the sheet
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const newRow = headers.map(header => {
    let value = payload[header];
    // Convert arrays/objects to string for storage
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
  // Assume ID is in the first column (index 0)
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1); // 1-based index
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
      // Found the row, update columns
      const rowNumber = i + 1;

      Object.keys(updates).forEach(key => {
        const colIndex = headers.indexOf(key);
        if (colIndex !== -1) {
          // Convert arrays/objects to string if needed
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
  const { data, filename, mimeType } = payload; // data is base64 string
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
