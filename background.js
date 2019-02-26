chrome.runtime.onInstalled.addListener(()=>{
    chrome.storage.sync.set({quizlet_sets: {}}, ()=>{

    })
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
          conditions: [new chrome.declarativeContent.PageStateMatcher({})
          ],
              actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
      });
})
