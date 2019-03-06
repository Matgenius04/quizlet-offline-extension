chrome.runtime.onInstalled.addListener(()=>{
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
          conditions: [new chrome.declarativeContent.PageStateMatcher({})
          ],
              actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
      });
});
openInNewTab = () => {
    chrome.tabs.create({'url': chrome.extension.getURL('popup/popup.html')}, function(tab) {}); 
}
altEval = x => {
  console.log(x);
  let request = indexedDB.open('sets',1);
  request.onerror = event => {
    alert("Database error: " + event.target.errorCode);
  }
  request.onsuccess = event => {
    let db = request.result;
    db.transaction('x',"readwrite").objectStore('x').put(x);
  }
}