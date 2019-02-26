let all = document.getElementsByClassName("TermText");
let terms = [];
let definitions = [];
window.addEventListener('load',()=>{
    for (x>all.length;;) {
    if (x%2) {
        terms.push(document.getElementsByClassName("TermText")[x])
    } else {
        definitions.push(document.getElementsByClassName("TermText")[x])
    }
    if (x%10){
        console.log(terms[1] + definitions[1])
    }
}

})
