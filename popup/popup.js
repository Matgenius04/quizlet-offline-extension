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
   function flipString(aString) {
    var last = aString.length - 1;
    var result = new Array(aString.length)
    for (var i = last; i >= 0; --i) {
     var c = aString.charAt(i)
     var r = flipTable[c]
     result[last - i] = r != undefined ? r : c
    }
    return result.join('')
   }
   var flipTable = {
   a : '\u0250',
   b : 'q',
   c : '\u0254', 
   d : 'p',
   e : '\u01DD',
   f : '\u025F', 
   g : '\u0183',
   h : '\u0265',
   i : '\u0131', 
   j : '\u027E',
   k : '\u029E',
   //l : '\u0283',
   m : '\u026F',
   n : 'u',
   r : '\u0279',
   t : '\u0287',
   v : '\u028C',
   w : '\u028D',
   y : '\u028E',
   '.' : '\u02D9',
   '[' : ']',
   '(' : ')',
   '{' : '}',
   '?' : '\u00BF',
   '!' : '\u00A1',
   "\'" : ',',
   '<' : '>',
   '_' : '\u203E',
   ';' : '\u061B',
   '\u203F' : '\u2040',
   '\u2045' : '\u2046',
   '\u2234' : '\u2235',
   '\r' : '\n' 
   }
   for (i in flipTable) {
     flipTable[flipTable[i]] = i
   }

  let flashcard = document.createElement('div');
  let flashCardShow = string => {
    flashcard.innerHTML = `<h3 style="margin:auto;width:50%;text-align: center; padding: 10px; position:relative;">${string}<h3>`;
    flashcard.style = "transform: rotate3d(0);height:100px;width:200px;";
    document.getElementById('flashcard-wrapper').appendChild(flashcard);
  }
  let flashCardFlip = string => {
    // flippedString = flipString(string.toLowerCase())
    flashcard.style = "transform: rotate3d(1,0, 0, 0.50turn);transform: rotate(180deg); transition-duration: 3s;height:100px;width:200px;";
    setTimeout(()=>{flashcard.innerHTML = `<h3 style="margin:auto;width:50%;text-align: center; padding: 10px; position:relative;">${string}<h3>`;},900)
  }

flashCardShow('test')
setTimeout(()=>{flashCardFlip('testing')},3000)

  //add set on quizlet
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