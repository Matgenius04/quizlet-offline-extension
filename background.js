chrome.runtime.onInstalled.addListener(()=>{
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
          conditions: [new chrome.declarativeContent.PageStateMatcher({})
          ],
              actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
      });
});
altEval = x => {
  console.log(x);
  let request = indexedDB.open('sets',1);
  request.onerror = event => {
    alert("Database error: " + event.target.errorCode);
  }
  request.onsuccess = event => {
    let db = request.result;
    let transaction = db.transaction('x','readwrite');
    transaction.oncomplete = e => {
      alert('opened transaction')
    }
  let objectStore = transaction.objectStore('x');
  let objectStoreRequest = objectStore.get('0');
  objectStoreRequest.onsuccess = e => {
    objectStoreRequest.add(x);
    alert('hope')
  }
    db.transaction('x',"readwrite").objectStore('x')
  }
}