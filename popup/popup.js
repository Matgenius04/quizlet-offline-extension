let db;
let x;
let setI = 0;
let currentTermIndex;
let quizletObjectStore;
let keydownListener;
let questionies;
const animTime = 500; //milleseconds
document.getElementById('openInNewTab').onclick = ()=>{
  let background = chrome.extension.getBackgroundPage();
  background.openInNewTab();
}
//for reference this commented out code get's rid of the option buttons

// if (document.getElementById('flashcards-option')){
//   document.getElementById('flashcards-option').remove()
// }
// if (document.getElementById('learn-option')){
//   document.getElementById('learn-option').remove()
// }
// if (document.getElementById('matching-option')){
//   document.getElementById('matching-option').remove()
// }
// if (document.getElementById('studying-options-text')){
//   document.getElementById('studying-options-text').remove()
// }


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
        loadedSet()
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

// Creates the dropdown menu
function loadedSet() {
  let inner = "";
  for (let i = 0; i < x.name.length; i++) {
    inner = inner+`<option value=${i}>${x.name[i]}</option>}`
  }
  document.getElementById("set").innerHTML = inner
}

function changeI() {
  setI = parseInt(document.getElementById("set").value);
  console.log(setI);
  studyOptions();
}

document.getElementById("changeI").addEventListener("click", changeI)

//lists all of the studying options
let studyOptions = () => {
  //remove all previous studying html

  //get rid of buttons
  if (document.getElementById('flashcards-option')){
    document.getElementById('flashcards-option').remove()
  }
  if (document.getElementById('learn-option')){
    document.getElementById('learn-option').remove()
  }
  if (document.getElementById('matching-option')){
    document.getElementById('matching-option').remove()
  }
  if (document.getElementById('studying-options-text')){
    document.getElementById('studying-options-text').remove()
  }
  if (document.getElementById('flashcard')){
      document.getElementById('flashcard').remove()
  }
  if (document.getElementById('next')){
    document.getElementById('next').remove()
  }
  if (document.getElementById('back')){
    document.getElementById('back').remove();
  }
  if (document.getElementById('learn-wrapper').hidden == false) {
    document.getElementById('learn-wrapper').hidden = true;
  }
  if (keydownListener==true) {
    window.removeEventListener('keydown',function (e) {sigh(e);},false)
    keydownListener = false;
  }
  let flashCardOption = document.createElement('button');
  let matchingOption = document.createElement('button');
  let learnOption = document.createElement('button');
  //studying options
  flashCardOption.innerHTML = "Flashcards";
  learnOption.innerHTML = "Learn";
  matchingOption.innerHTML = "Matching";
  flashCardOption.id = 'flashcards-option';
  learnOption.id = 'learn-option';
  matchingOption.id = 'matching-option';
  flashCardOption.onclick = ()=>{flashCardMode()};
  learnOption.onclick = ()=>{learnMode()};
  matchingOption.onclick = ()=>{matchingMode()};
  let text = document.createElement('h4');
  text.innerHTML = 'Studying Options';
  text.id = 'studying-options-text'
  document.getElementsByTagName('body')[0].appendChild(text)
  document.getElementsByTagName('body')[0].appendChild(flashCardOption);
  document.getElementsByTagName('body')[0].appendChild(learnOption);
  document.getElementsByTagName('body')[0].appendChild(matchingOption);
  //end of options
}
//FLASHCARDS MODE
  let flashcard = document.createElement('div');
  let term = true;
  let flashCardHeight;
  let flashCardWidth;
  let flashCardTextSize;
  let flashCardButtonSize = {height:40,width:40};
  if (window.innerHeight<400 || window.innerWidth<400) {
    flashCardHeight = 100;
    flashCardWidth = 200;
    flashCardTextSize = '';
    flashCardButtonSize.height = 40;
    flashCardButtonSize.width = 40;
  } else {
    if (window.innerHeight>window.innerWidth) {
      flashCardButtonSize.height = window.innerWidth/5;
      flashCardButtonSize.width = window.innerWidth/5;
      flashCardTextSize = `${window.innerWidth/16}px`;
      flashCardHeight = 1/2 * window.innerWidth;
      flashCardWidth = 2*flashCardHeight;
    } else {
    flashCardButtonSize.height = window.innerHeight/5;
    flashCardButtonSize.width = window.innerHeight/5;
    flashCardTextSize = `${window.innerHeight/16}px`;
    flashCardHeight = 1/2 * window.innerHeight;
    flashCardWidth = 2*flashCardHeight;
    }
  }
  flashcard.onclick = ()=>{
    if (term == true){
      flashCardFlip(x.set[setI].definitions[currentTermIndex]);
      setTimeout(()=>{term = false;},1)
      setTimeout(()=>{document.getElementById('flashcard').scrollTop = document.getElementById('flashcard').clientHeight+100;},animTime*3/10)
    }
    if (term == false){
      flashCardShow(x.set[setI].terms[currentTermIndex],true);
      setTimeout(()=>{term = true;},1)
      setTimeout(()=>{document.getElementById('flashcard').scrollTop = 1;},animTime*3/10)
    }
  }
  let flashCardShow = (string,transition) => {
    flashcard.id = 'flashcard';
    if (transition==true) {

      flashcard.style = `transform: none; transition-duration:${animTime}ms; height:${flashCardHeight}px;width:${flashCardWidth}px; border-style: solid; background-color:white; overflow-y:scroll !important;`;
      setTimeout(()=>{flashcard.innerHTML = `<h3 style="text-align: center; position:relative; font-size:${flashCardTextSize}">${string}</h3>`;},3*animTime/10)
    } else if (transition==false){
      flashcard.innerHTML = `<h3 style="text-align: center; position:relative; font-size:${flashCardTextSize}">${string}</h3>`;
      flashcard.style = `transform: rotate3d(0,0,0,180deg); transition-duration: ${animTime}ms; height:${flashCardHeight}px;width:${flashCardWidth}px; border-style: solid; background-color:white; overflow-y:scroll !important;`;
    } else {
      flashcard.innerHTML = `<h3 style="text-align: center; position:relative; font-size:${flashCardTextSize}">${string}</h3>`;
      flashcard.style = `transform: rotate3d(0,0,0,180deg); transition-duration: ${animTime}ms; height:${flashCardHeight}px;width:${flashCardWidth}px; border-style: solid; background-color:white; overflow-y:scroll !important;`;
    document.getElementById('flashcards').appendChild(flashcard)
  };
  }
  let flashCardFlip = string => {
    // flippedString = flipString(string.toLowerCase())
    flashcard.style = `transform: rotateX(180deg); transition-duration: ${animTime}ms; height:${flashCardHeight}px;width:${flashCardWidth}px; border-style: solid; background-color:white; overflow-y:scroll !important;`;
    setTimeout(()=>{flashcard.innerHTML = `<h3 style="text-align: center; padding: 0px; position:relative; transform:rotateX(180deg); font-size:${flashCardTextSize}">${string}</h3>`;},3*animTime/10)
  }
let flashCardMode = () => {
  if (document.getElementById('flashcards-option')){
    document.getElementById('flashcards-option').remove()
  }
  if (document.getElementById('learn-option')){
    document.getElementById('learn-option').remove()
  }
  if (document.getElementById('matching-option')){
    document.getElementById('matching-option').remove()
  }
  if (document.getElementById('studying-options-text')){
    document.getElementById('studying-options-text').remove()
  }
  console.log('flashcard option selected')
  currentTermIndex = 0;
  flashCardShow(x.set[setI].terms[currentTermIndex]);
  let next = document.createElement('button');
  let back = document.createElement('button');
  let nextCard = ()=>{
    if (term == false) {
    currentTermIndex +=1;
    currentTermIndex==x.set[setI].terms.length ? prevCard(): null;
    document.getElementById('flashcard').style = `transform: translate(-100px,0px); transition-duration: ${animTime}ms`;
    flashCardShow(x.set[setI].terms[currentTermIndex]);
    document.getElementById('flashcard').scrollTop = 1;
    } else {
    currentTermIndex +=1;
    currentTermIndex==x.set[setI].terms.length ? prevCard(): null;
    document.getElementById('flashcard').style = `transform: translate(-100px,0px); transition-duration: ${animTime}ms`;
    flashCardShow(x.set[setI].terms[currentTermIndex]);
    document.getElementById('flashcard').scrollTop = 1;
    }

  }
  let prevCard = ()=>{
    currentTermIndex += -1;
    currentTermIndex==-1 ? nextCard(): null;
    flashcard.style = `transform: translate(-100px,0px); transition-duration: ${animTime}ms`;
    flashCardShow(x.set[setI].terms[currentTermIndex]);
    document.getElementById('flashcard').scrollTop = 1;
  }
  next.style = `height: ${flashCardButtonSize.height}px; width: ${flashCardButtonSize.width}px; border-radius: ${flashCardButtonSize.height/2}px;position:relative;margin-right:${window.innerWidth/3 - flashCardButtonSize.height}px;margin-left:0px;margin-top:15px;margin-bottom:15px;float:right;font-size:${flashCardTextSize}`;
  next.innerHTML = ">";
  next.id = 'next';
  next.onclick = ()=>{nextCard();}
  back.style = `height: ${flashCardButtonSize.height}px; width: ${flashCardButtonSize.width}px; border-radius: ${flashCardButtonSize.height/2}px;position:relative;margin-right:0px;margin-left:${window.innerWidth/3 - flashCardButtonSize.height}px;margin-top:15px;margin-bottom:15px;font-size:${flashCardTextSize}`;
  back.innerHTML = "<";
  back.id = 'back';
  back.onclick = ()=>{prevCard()}
  document.getElementById('flashcard-wrapper').appendChild(back);
  document.getElementById('flashcard-wrapper').appendChild(next);

let sigh = (e) => {
  keydownListener = true;
      if(e.keyCode==37){
        //left
        // alert('left') //for testing
        prevCard()
      } else if (e.keyCode==38){
        //up
        // alert('up') //for testing
        if (term == true){
          flashCardFlip(x.set[setI].definitions[currentTermIndex]);
          term = false;
          // setTimeout(()=>{term = false;},1)
          setTimeout(()=>{document.getElementById('flashcard').scrollTop = document.getElementById('flashcard').clientHeight+100;},animTime*3/10);
        } else if (term == false){
          flashCardShow(x.set[setI].terms[currentTermIndex],true);
          setTimeout(()=>{term = true;},1)
          setTimeout(()=>{document.getElementById('flashcard').scrollTop = 1;},animTime*3/10);
        }
      } else if (e.keyCode==39){
        //right
        // alert('right') //for testing
        nextCard()
      } else if (e.keyCode==40){
        //down
        // alert('down') //for testing
        if (term == true){
          flashCardFlip(x.set[setI].definitions[currentTermIndex]);
          setTimeout(()=>{term = false;},1)
          setTimeout(()=>{document.getElementById('flashcard').scrollTop = document.getElementById('flashcard').clientHeight+100;;},animTime*3/10)
        }
        if (term == false){
          flashCardShow(x.set[setI].terms[currentTermIndex],true);
          setTimeout(()=>{term = true;},1)
          setTimeout(()=>{document.getElementById('flashcard').scrollTop = 1;},animTime*3/10)
        }
      }
  }
  window.addEventListener('keydown',function (e){
    sigh(e);
  })
}
//END FLASHCARDS

//LEARN MODE
function learnMode() {
  document.getElementById("learn-wrapper").hidden = false;
  //get rid of option buttons
  if (document.getElementById('flashcards-option')){
    document.getElementById('flashcards-option').remove()
  }
  if (document.getElementById('learn-option')){
    document.getElementById('learn-option').remove()
  }
  if (document.getElementById('matching-option')){
    document.getElementById('matching-option').remove()
  }
  if (document.getElementById('studying-options-text')){
    document.getElementById('studying-options-text').remove()
  }
  questionies = [];
  for (let i = 0; i < x.set[setI].terms.length; i++) {
    questionies.push({
      q: x.set[setI].terms[i],
      a: x.set[setI].definitions[i],
      amt: 0
    });
  }
  doLearnQ(questionies);
}

function doLearnQ(questions) {
  document.getElementById("learn-questions").hidden = false;
  document.getElementById("correct").hidden = true;
  document.getElementById("wrong").hidden = true;
  let qs = [];
  let progress = 0;
  let random = [];
  for (let i = 0; i < questions.length; i++) {
    progress+=questions[i].amt;
    for (let j = 0; j < 2-questions[i].amt; j++) {
      random.push(i);
    }
  }

  progress /= questions.length*2;
  document.getElementById("progress").innerHTML = Math.round(progress*1000)/10+"%";

  if (random.length <= 0) {
    return;
  }
  let qi = random[randomI(random)];
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
      choices.childNodes[i].onclick = ()=>{learnRight(qi)}
    } else {
      choices.childNodes[i].onclick = ()=>{learnWrong(questions[qi].a, qi)}
    }
  }
}

function learnRight(qi) {
  let e = document.getElementById("correct");
  document.getElementById("learn-questions").hidden = true;
  e.hidden = false;
  let compliments = ["Good job!", "CORRECT!", "You seem to have proven me wrong", "You're doing great!"]
  e.innerHTML = compliments[randomI(compliments)];
  questionies[qi].amt++;
  setTimeout(() => {
    doLearnQ(questionies);
  }, 2000)
}

function learnWrong(a, qi) {
  let e = document.getElementById("wrong");
  document.getElementById("learn-questions").hidden = true;
  e.hidden = false;
  let compliments = ["You seem to have proven me right", "Thats quite unfortunate", "OOF", "WRONG", "*insert wrong sound here*"];
  e.innerHTML = compliments[randomI(compliments)]+", the answer was actually "+'<br><br>' + `'${a}'`;
  questionies[qi].amt--;
  setTimeout(() => {
    doLearnQ(questionies);
  }, 4000);
  pq = a;
}

function randomI(a) {
  return Math.floor(Math.random() * a.length);
}
//END LEARN MODE

//MATCHING MODE
function matchingMode() {
  if (document.getElementById('flashcards-option')){
    document.getElementById('flashcards-option').remove()
  }
  if (document.getElementById('learn-option')){
    document.getElementById('learn-option').remove()
  }
  if (document.getElementById('matching-option')){
    document.getElementById('matching-option').remove()
  }
  if (document.getElementById('studying-options-text')){
    document.getElementById('studying-options-text').remove()
  }
  document.getElementById('matching-wrapper').style = 'display:block;height:500px;width:1280px';
  let matchingQuestionsDone = 0;
  let matchingTermsLength = x.set[setI].length;
  if (matchingTermsLength > 15){
    matchingTermsLength = 15;
  } else {
    matchingTermsLength = x.set[setI].terms.length;
  }
  for (let x=0;x<matchingTermsLength;x++){
    let div = document.createElement('div');
    div.className = 'matching-div';
    matchingTermsLength = x.set[setI].length;
    div.innerHTML =
    document.getElementById('matching-wrapper').appendChild(div)
  }

}

window.addEventListener('resize',()=>{
  if (window.innerHeight<300 || window.innerWidth<400) {
    flashCardHeight = 100;
    flashCardWidth = 200;
    flashCardTextSize = '';
    flashCardButtonSize.height = 40;
    flashCardButtonSize.width = 40;
  } else {
    if (window.innerHeight>window.innerWidth) {
      flashCardButtonSize.height = window.innerWidth/5;
      flashCardButtonSize.width = window.innerWidth/5;
      flashCardTextSize = `${window.innerWidth/16}px`;
      flashCardHeight = 1/2 * window.innerWidth;
      flashCardWidth = 2*flashCardHeight;
    } else {
    flashCardButtonSize.height = window.innerHeight/5;
    flashCardButtonSize.width = window.innerHeight/5;
    flashCardTextSize = `${window.innerHeight/16}px`;
    flashCardHeight = 1/2 * window.innerHeight;
    flashCardWidth = 2*flashCardHeight;
    }
  }
  document.getElementById('next').style = `height: ${flashCardButtonSize.height}px; width: ${flashCardButtonSize.width}px; border-radius: ${flashCardButtonSize.height}px;position:relative;margin-left:0px;margin-right:${window.innerWidth/3 - flashCardButtonSize.height}px;margin-top:15px;margin-bottom:15px;font-size:${flashCardTextSize};float:right`;
  document.getElementById('back').style = `height: ${flashCardButtonSize.height}px; width: ${flashCardButtonSize.width}px; border-radius: ${flashCardButtonSize.height}px;position:relative;margin-right:0px;margin-left:${window.innerWidth/3 - flashCardButtonSize.height}px;margin-top:15px;margin-bottom:15px;font-size:${flashCardTextSize}`;
  document.getElementById('flashcard').style.height = flashCardHeight;
  document.getElementById('flashcard').style.width = flashCardWidth;
})
