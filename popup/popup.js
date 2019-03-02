let db;
let x;
let quizletObjectStore;
x = {
  name: [],
  set: []
}
window.addEventListener('load', () => {

  // INDEXEDDB
  let request = indexedDB.open('sets');
  let dbExist = true;
  request.onupgradeneeded = event => {
    event.target.transaction.abort()
    dbExist = false;
    if (dbExist == false) {
      // console.log('DB DOES NOT EXIST')
      let req = indexedDB.open('sets', 1);
      req.onupgradeneeded = event => {
        db = event.target.result;
        let objectStore = db.createObjectStore("x", {
          keyPath: "key"
        });
        objectStore.transaction.oncomplete = event => {
          quizletObjectStore = db.transaction('x', 'readwrite').objectStore('x');
          let name = x.name;
          let set = x.set;
          quizletObjectStore.put({
            name: name,
            set: set,
            key: 0
          });
        }
      }
    }
  }
  request.onsuccess = event => {
    if (dbExist == true) {
      // console.log('DB EXISTS')
      let req = indexedDB.open('sets', 1);
      req.onsuccess = event => {
        db = event.target.result;
        db.transaction('x', 'readwrite').objectStore('x').get(0).onsuccess = event => {
          x = event.target.result;
          if (x.name == undefined) {
            x.name = [];
          }
          if (x.set == undefined) {
            x.set = [];
          }
          // console.log(x);
        };
      }
    }
  }
  //INDEXEDDB END

  let addSet = function () {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        add: 'set'
      }, function (response) {
        let obj = {
          terms: [],
          definitions: []
        };
        for (let n = 0; n < response.terms.length; n++) {
          obj.terms.push(response.terms[n]);
          obj.definitions.push(response.definitions[n]);
        }
        // console.log(x.name); //for testing
        if (x.name.includes(response.name) == false) {
          x.name.push(response.name);
          x.set.push(obj);
        } else {
          // console.log('updating set')
          let existingPos = `${x.name.indexOf(response.name)}`
          x.set[Number(existingPos)] = obj;
        }
        // console.log(x)
      });
    });
  }

  //Creating button to add a quizlet set if on quizlet page
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      greeting: "hello"
    }, function (response) {
      if (response.alive == "true") {
        let button = document.createElement('button');
        button.id = 'getQuizletSet';
        button.innerHTML = 'Add this Quizlet Set';
        document.getElementsByTagName('body')[0].appendChild(button);
        document.getElementsByTagName('button')[0].onclick = addSet
      }
    });
  });

})

window.addEventListener('unload', () => {
  let background = chrome.extension.getBackgroundPage();
  background.altEval(x) //send data for background script to process
})