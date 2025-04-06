// This file stores generated keys from the website
// It will be updated via localStorage to maintain persistence

// Initialize the key store if it doesn't exist
function initKeyStore() {
  if (!localStorage.getItem('generatedKeys')) {
    localStorage.setItem('generatedKeys', JSON.stringify([]));
  }
}

// Add a key to the store
function storeKey(key) {
  initKeyStore();
  const keys = JSON.parse(localStorage.getItem('generatedKeys'));
  keys.push({
    key: key,
    generatedAt: new Date().toISOString(),
    validated: false
  });
  localStorage.setItem('generatedKeys', JSON.stringify(keys));
  updateKeysJson();
}

// Check if a key exists in the store
function keyExists(key) {
  initKeyStore();
  const keys = JSON.parse(localStorage.getItem('generatedKeys'));
  return keys.some(entry => entry.key === key);
}

// Mark a key as validated
function validateKey(key) {
  initKeyStore();
  const keys = JSON.parse(localStorage.getItem('generatedKeys'));
  
  for (let i = 0; i < keys.length; i++) {
    if (keys[i].key === key) {
      keys[i].validated = true;
      keys[i].lastValidated = new Date().toISOString();
      localStorage.setItem('generatedKeys', JSON.stringify(keys));
      updateKeysJson();
      return true;
    }
  }
  
  return false;
}

// Get all stored keys
function getAllKeys() {
  initKeyStore();
  return JSON.parse(localStorage.getItem('generatedKeys'));
}

// Update the keys.json file with the latest keys
function updateKeysJson() {
  const keys = getAllKeys();
  const validKeys = keys.map(entry => entry.key);
  
  // Create the keys JSON structure
  const keysJson = {
    validKeys: validKeys,
    lastUpdated: new Date().toISOString()
  };
  
  // Save to localStorage as a backup for the JSON file
  localStorage.setItem('keysJson', JSON.stringify(keysJson));
  
  // In a real server environment, this would write to a file
  console.log("Updated keys.json with:", validKeys.length, "keys");
  
  // Create a downloadable file with the latest keys
  const blob = new Blob([JSON.stringify(keysJson, null, 2)], {type: 'application/json'});
  const downloadUrl = URL.createObjectURL(blob);
  
  // Update download link if it exists
  const downloadLink = document.getElementById('downloadKeysJson');
  if (downloadLink) {
    downloadLink.href = downloadUrl;
    downloadLink.download = 'keys.json';
  }
}

// Initialize the key store when the script loads
initKeyStore();
