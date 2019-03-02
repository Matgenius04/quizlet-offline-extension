//If popup button pressed, open popup
chrome.runtime.onInstalled.addListener(()=>{
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
          conditions: [new chrome.declarativeContent.PageStateMatcher({})
          ],
              actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
      });
});

//INDEXEDDB
altEval = x => {
  let request = indexedDB.open('sets',1);
  request.onerror = event => {
    alert("Database error: " + event.target.errorCode);
  }
  request.onsuccess = event => {
    let db = request.result;
    let name = x.name;
    let set = x.set;
    // db.transaction('x','readwrite').objectStore('x').get(0).onsuccess = e => {console.log(e.target.result)}
    db.transaction('x',"readwrite").objectStore('x').put({name:name,set:set,key:0}).onsuccess = e=>{};
  }
}
//INDEXEDDB END