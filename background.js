chrome.runtime.onInstalled.addListener(()=>{
    chrome.storage.sync.set({quizlet_sets: {}}, ()=>{

    })
})
