let db;
let x;
let setI = 0;
let pq = "";
let currentTermIndex;
let quizletObjectStore;
let next = false;
const animTime = 500; //milleseconds
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
          loadedSet();
          // console.log(x);
        };
      }
    }
  }
  //INDEXEDDB END


  //add set on quizlet
  let addSet = function() {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        add: 'set'
      }, function(response) {
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
        loadedSet()
        // console.log(x)
      });
    });
  }

  //Creating button to add a quizlet set if on quizlet page
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      greeting: "hello"
    }, function(response) {
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

// Creates the dropdown menu
function loadedSet() {
  let inner = "";
  for (let i = 0; i < x.name.length; i++) {
    inner = inner + `<option value=${i}>${x.name[i]}</option>}`
  }
  document.getElementById("set").innerHTML = inner
}


// Changes set index
function changeI() {
  setI = parseInt(document.getElementById("set").value);
  console.log(setI);
  studyOptions();
}

document.getElementById("changeI").addEventListener("click", changeI)

let studyOptions = () => {
  let x = document.getElementById("flashcards-button");
  x.hidden = false;
  x.onclick = flashCardsOption;

  let y = document.getElementById("learn-button");
  y.hidden = false;
  y.onclick = learn;
}

let flashcard = document.createElement('div');
let term = true;
flashcard.onclick = () => {
  if (term == true) {
    flashCardFlip(x.set[setI].definitions[currentTermIndex]);
    setTimeout(() => {
      term = false;
    }, 10)
  }
  if (term == false) {
    flashCardShow(x.set[setI].terms[currentTermIndex], true);
    setTimeout(() => {
      term = true;
    }, 10)
  }
}
let flashCardShow = (string, transition) => {
  flashcard.id = 'flashcard';
  if (transition == true) {
    flashcard.style = `transform: none; transition-duration:${animTime}ms; height:100px;width:200px; border-style: solid; background-color:white;`;
    setTimeout(() => {
      flashcard.innerHTML = `<h3 style="text-align: center; position:relative;">${string}<h3>`;
    }, 3 * animTime / 10)
  } else if (transition == false) {
    flashcard.innerHTML = `<h3 style="text-align: center; position:relative;">${string}<h3>`;
    flashcard.style = `transform: rotate3d(0,0,0,180deg); transition-duration: ${animTime}ms; height:100px;width:200px; border-style: solid; background-color:white;`;
  } else {
    flashcard.innerHTML = `<h3 style="text-align: center; position:relative;">${string}<h3>`;
    flashcard.style = `transform: rotate3d(0,0,0,180deg); transition-duration: ${animTime}ms; height:100px;width:200px; border-style: solid; background-color:white;`;
    document.getElementById('flashcards').appendChild(flashcard)
  };
}
let flashCardFlip = string => {
  // flippedString = flipString(string.toLowerCase())
  flashcard.style = `transform: rotateX(180deg); transition-duration: ${animTime}ms; height:100px;width:200px; border-style: solid; background-color:white;`;
  setTimeout(() => {
    flashcard.innerHTML = `<h3 style="text-align: center; padding: 0px; position:relative; transform:rotateX(180deg);">${string}<h3>`;
  }, 3 * animTime / 10)
}
let flashCardsOption = () => {
  console.log('flashcard option selected')
  currentTermIndex = 0;
  flashCardShow(x.set[setI].terms[currentTermIndex]);
  let next = document.createElement('button');
  let back = document.createElement('button');
  let nextCard = () => {
    currentTermIndex += 1;
    console.log(currentTermIndex)
    document.getElementById('flashcard').style = `transform: translate(-100px,0px); transition-duration: ${animTime}ms`;
    flashCardShow(x.set[setI].terms[currentTermIndex]);
  }
  let prevCard = () => {
    currentTermIndex += -1;
    flashcard.style = `transform: translate(-100px,0px); transition-duration: ${animTime}ms`;
    flashCardShow(x.set[setI].terms[currentTermIndex]);
  }
  window.innerHeight / 3
  next.style = `height: 40px; width: 40px; border-radius: 20px;position:relative;margin-right:0px;margin-left:${window.innerHeight/3}px;margin-top:15px;margin-bottom:15px;`;
  next.innerHTML = ">";
  next.onclick = () => {
    nextCard();
  }
  back.style = `height: 40px; width: 40px; border-radius: 20px;position:relative;margin-right:0px;margin-left:${window.innerHeight/3}px;margin-top:15px;margin-bottom:15px;`;
  back.innerHTML = "<";
  back.onclick = () => {
    prevCard()
  }
  document.getElementById('flashcard-wrapper').appendChild(back);
  document.getElementById('flashcard-wrapper').appendChild(next);
  window.addEventListener('keypress', (e) => {
    alert(e)
  })
}


function learn() {
  document.getElementById("learn-wrapper").hidden = false;
  doLearnQ();
}

function doLearnQ() {
  document.getElementById("learn-questions").hidden = false;
  document.getElementById("correct").hidden = true;
  document.getElementById("wrong").hidden = true;
  let qs = [];
  let progress = 0;
  let questions = [];
  for (let i = 0; i < x.set[setI].terms.length; i++) {
    questions.push({
      q: x.set[setI].terms[i],
      a: x.set[setI].definitions[i],
      amt: 0
    });
  }
  let qi = randomI(questions);
  document.getElementById("question").innerHTML = questions[qi].q;
  let choices = document.getElementById("choices");
  choices.hidden = false
  let c = [questions[qi].a];
  for (let i = 0; i < 3; i++) {
    if (Math.random() < 0.5) {
      c.push(questions[randomI(questions)].a);
    } else {
      c.unshift(questions[randomI(questions)].a);
    }
  }

  for (let i = 1; i < choices.childNodes.length; i += 2) {
    choices.childNodes[i].innerHTML = c.pop();
    if (choices.childNodes[i].innerHTML == questions[qi].a) {
      choices.childNodes[i].removeEventListener("click", () => {
        learnRight();
      });
      choices.childNodes[i].addEventListener("click", () => {
        learnRight();
      })
    } else {
      choices.childNodes[i].removeEventListener("click", () => {
        learnWrong(pq);
      });
      choices.childNodes[i].addEventListener("click", () => {
        learnWrong(questions[qi].a);
      })
    }
  }
}

function learnRight() {
  let e = document.getElementById("correct");
  document.getElementById("learn-questions").hidden = true;
  e.hidden = false;
  let compliments = ["Good job!", "CORRECT!", "You seem to have proven me wrong", "You're doing great!"]
  e.innerHTML = compliments[randomI(compliments)];
  setTimeout(doLearnQ, 2000)
}

function learnWrong(a) {
  let e = document.getElementById("wrong");
  document.getElementById("learn-questions").hidden = true;
  e.hidden = false;
  let compliments = ["You seem to have proven me right", "Thats quite unfortunate", "OOF", "WRONG", "*insert wrong sound here*"];
  e.innerHTML = compliments[randomI(compliments)]+", the answer was actually "+a;
  setTimeout(doLearnQ, 5000);
  pq = a;
}

function randomI(a) {
  return Math.floor(Math.random() * a.length);
}
