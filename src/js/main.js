"use strict";
// const say = require("say");
// https://github.com/lukePeavey/quotable/blob/master/README.md
// https://docs.google.com/spreadsheets/d/1nonN5nXNe9cbVJKJsNHXE3h2ECXyEwWfDIrknJAa8jA/edit#gid=0
const btnUnKnown = document.querySelector(".un-known-words");
const btnKnown = document.querySelector(".known-words");
const btnRight = document.querySelector(".right");
const btnLeft = document.querySelector(".left");
const lblWord = document.querySelector(".word");
const quote = document.querySelector(".quote");
const img = document.querySelector(".image");
let translation = "";
let knownWords = false;
const sheetId = "1nonN5nXNe9cbVJKJsNHXE3h2ECXyEwWfDIrknJAa8jA";
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const sheetName = "list";
const query = encodeURI("Select *");
const url = `${base}&sheet=${sheetName}&tq=${query}`;
let wordList = null;
console.log(url);
const getSheetData = async url => {
  const response = await fetch(url);
  const text = await response.text();
  const listObj = JSON.parse(text.match(/{[\s\S]+}/)).table.rows;
  wordList = listObj;
  console.log(wordList.length);
  document.querySelector("#w").innerHTML = JSON.stringify(
    getRandomRow(wordList),
    null,
    4
  );
  updateWord(Math.random() < 0.5);
};
updateQuote();
btnLeft.addEventListener("click", e => updateWord(Math.random() < 0.5));
btnRight.addEventListener("click", e => updateWord(Math.random() < 0.5));
lblWord.addEventListener("click", e => {
  [translation, e.target.innerHTML] = [e.target.innerHTML, translation];
});
btnKnown.addEventListener("click", e => (knownWords = true));
btnUnKnown.addEventListener("click", e => (knownWords = false));
function updateWord(isEnglish) {
  const row = getRandomRow(wordList, knownWords);
  console.log(lblWord);
  lblWord.innerHTML = isEnglish ? row.c[0].v : row.c[1].v;
  translation = isEnglish ? row.c[1].v : row.c[0].v;
}
function getRandomRow(wordList, known) {
  const filterWordList = wordList.filter(row =>
    known ? row.c[2].v : !row.c[2].v
  );
  const randomRow = filterWordList[~~(Math.random() * filterWordList.length)];
  return randomRow;
  //   console.log(JSON.stringify(filterWordList) );
}
async function updateQuote() {
  let response = await fetch("https://api.quotable.io/random?&maxLength=50");
  let data = await response.json();
  quote.innerHTML = data.content;
  document.querySelector(".author").innerHTML = data.author;
}
getSheetData(url);
