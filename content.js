let terms = [];
let definitions = [];
let name;
window.addEventListener('load',()=>{
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          console.log(sender.tab ?
                      "from a content script:" + sender.tab.url :
                      "from the extension");
          if (request.greeting == "hello") {
              sendResponse({alive: 'true'})
          }
          if (request.add == 'set') {
              sendResponse({name:name,terms:terms,definitions:definitions})
          }
        });
  if ($('.SetPageTerms-seeMore').children('button')){
        $('.SetPageTerms-seeMore').children('button').click();
    }
    let n = $('.TermText').filter('span').length;
    for (let x=0;x<n;x++){
        if (x%2==0) {
            terms.push($('.TermText').filter('span').eq(x).text());
        } else if (x%2==1) {
            definitions.push($('.TermText').filter('span').eq(x).text());
        }
    }
    name = document.getElementsByTagName('h1')[0].textContent;

    console.log(terms[0] + ": " + definitions[0]);
})
