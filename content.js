let terms = [];
let definitions = [];
let name;
let quizletStudyType = window.location.pathname.split('/')[2];
if (quizletStudyType == "match" || quizletStudyType == "gravity" || quizletStudyType == "test" || quizletStudyType == "spell" || quizletStudyType == "write" || quizletStudyType == "learn" || quizletStudyType == "flashcards") {
    throw new Error(`Cannot get terms or definitions from this page`);
} else {

}
window.addEventListener('load', () => {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            //   console.log(sender.tab ?
            //               "from a content script:" + sender.tab.url :
            //               "from the extension");
            if (request.greeting == "hello") {
                sendResponse({
                    alive: 'true'
                })
            }
            if (request.add == 'set') {
                sendResponse({
                    name: name,
                    terms: terms,
                    definitions: definitions
                })
            }
        });
    //automatically extend to see all of the terms and definitions on a quizlet set
    if ($('.SetPageTerms-seeMore').children('button')) {
        $('.SetPageTerms-seeMore').children('button').click();
    }
    let n = $('.TermText').filter('span').length;
    //filtering and organizing quizlet terms and definitions
    for (let x = 0; x < n; x++) {
        if (x % 2 == 0) {
            terms.push($('.TermText').filter('span').eq(x).text());
        } else if (x % 2 == 1) {
            definitions.push($('.TermText').filter('span').eq(x).text());
        }
    }
    //get the name of the quizlet set
    name = document.getElementsByTagName('h1')[0].textContent;

    // console.log(terms[0] + ": " + definitions[0]); //for testing purposes
})