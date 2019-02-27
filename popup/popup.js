window.addEventListener('load',()=>{
    let x;
  let addSet = function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {add: 'set'},function(response) {
          x[1].terms = response.terms;
          x[1].definitions = response.definitions;
          console.log(x[1]);
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