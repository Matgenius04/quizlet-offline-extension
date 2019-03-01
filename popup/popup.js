let db;
let x;
let quizletObjectStore;
    // x = {
    //   number: 0,
    //   name: [],
    //   set: []
    // }
window.addEventListener('load',()=>{
  let request = indexedDB.open('sets',1);
  request.onerror = event => {
    alert("Database error: " + event.target.errorCode);
  }
  request.onsuccess = event => {
    db = event.target.result;
    db.transaction('x','readwrite').objectStore('x').getAll().onsuccess = event => {
      console.log(event.target.result);
    };
  }
  // request.onupgradeneeded = event => {
  //   db = event.target.result;
  //   console.log(db);
  //   let objectStore = db.createObjectStore("x", {keyPath: "number"});
  //   objectStore.transaction.oncomplete = event=>{
  //   quizletObjectStore = db.transaction("x","readwrite").objectStore("x");
  //   quizletObjectStore.add(x);
  //   }
  // }

  let addSet = function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {add: 'set'},function(response) {
          let obj = {
            terms: [],
            definitions: []
          };
      for (let n=0;n<response.terms.length;n++) {
      obj.terms.push(response.terms[n]);
      obj.definitions.push(response.definitions[n]);
}      
      if (x.name.includes(response.name) == true){
        console.log('updating set')
        let existingPos = `${x.name.indexOf(response.name)}`
        x.set[Number(existingPos)] = obj;
      } else {
        x.name.push(response.name);
        x.set.push(obj);
      }
      console.log(x)
        });
    });
}
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
          if (response.alive == "true"){
              let button = document.createElement('button');
              button.id = 'getQuizletSet';
              button.innerHTML = 'Add this Quizlet Set';
              document.getElementsByTagName('body')[0].appendChild(button);
              document.getElementsByTagName('button')[0].onclick = addSet
          }
        });
      });
})
window.addEventListener('onunload', ()=>{
  
})