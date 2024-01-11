const display = document.querySelector('#fileExplorer');
const formDisplay = document.querySelector('#editing');
const options = document.querySelectorAll('.option');
const routeDisp = document.querySelector('#path');
const backBtn = document.querySelector('#back');
const fileDisp = document.querySelector('#fileDisplay');
const closeBtn = document.querySelector('#closeBtn');



let selected = [];
let route;

async function loadFiles(routeUpd) {

  function displayTiles(files, route) {

    selected = [];
    let displayIcon;
    let inner = '';

    files.forEach((file) => {
      displayIcon = `usersFiles/${route}/${file}`;
      let cls = 'file';

      if (file.split('.')[1] === undefined) {
        displayIcon = 'images/folder.png';
        cls = 'folder';
      }
      inner += `<div name="${cls}" class="element"><img src="${displayIcon}"></img><div>${file}</div></div>`;
    });

    display.innerHTML = inner;

    const filesDisp = document.querySelectorAll('#fileExplorer .element');

    filesDisp.forEach((element) => {
      element.addEventListener('click', () => { onFileSelect(element) });
      switch (element.attributes.name.nodeValue) {
        case 'folder': element.addEventListener('dblclick', () => { loadFiles(element.innerText) });
          break;
        case 'file': element.addEventListener('dblclick', () => { showFile(element.innerText, element) });
        break;
      }
    });

    routeDisp.innerHTML = route;
  }

  function onFileSelect(tile) {
    if (selected.includes(tile)) {
      const index = selected.indexOf(tile);
      selected.splice(index, 1);
      tile.style.background = '#262626';
    } else {
      selected.push(tile);
      tile.style.background = '#07B';
    }
  }

  await fetch('/fileMenager/pathChange', {
    method: 'POST',
    body: JSON.stringify({ pathUpdt: routeUpd }),
    headers: { 'Content-Type': 'application/json' },
  });

  let response = await fetch('/fileMenager/structure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ direction: route }),
  });

  response = await response.json();
  displayTiles(response.files, response.route);
}

async function showFile(FName, element) {
  let ext = FName.split('.')[1];
  console.log(ext)
  if(['txt','js','cpp','c','py','json'].includes(ext)){
  let response = await fetch('/fileMenager/getFile', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({fileName : FName}),
  });
  response = await response.text();
  console.log(response);
  fileDisp.innerHTML = response;
  fileDisp.style.display = 'flex';
  }else if(['jpg','img','jpeg','webp','vaw','png','svg','gif']){
    console.dir(element.querySelector('img').attributes.src.nodeValue)
    fileDisp.innerHTML = `File : <img src='${element.querySelector('img').attributes.src.nodeValue}' class="displayImg"></img>`;
    fileDisp.style.display = 'flex';
  }else{
    fileDisp.innerHTML = `Files with ${ext} extension are not supported`;
    fileDisp.style.display = 'flex';
  }
}

async function btnC(option) {
  let response = await fetch('/fileMenager/getForm');
  response = await response.json();

  formDisplay.innerHTML = response[option];

  let submitBtn = document.querySelector('.submitBtn');
  submitBtn.addEventListener('click', () => {
    setTimeout(() => {
      loadFiles();
    }, 100)
  });
}

function setup() {
  options.forEach((element) => {
    element.addEventListener('click', async () => {
      await btnC(element.id);
    });
  });
}

loadFiles()
  .then(() => { setup(); });

document.querySelector('#reload').addEventListener('click', () => { // replace it with auto reload after action done
  loadFiles();
});

async function deleteFiles() { // IMP. DELETE button from text over the button to delete items
  if (selected != null) {
    selected.forEach((element, index) => {
      selected[index] = element.outerText;
    });
    fetch('/fileMenager/deleteFiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filesToDel: selected }),
    });
  } else {
    console.log('There is no any files selected');
  }
};


backBtn.addEventListener('click', () => {
  console.log('GOING BACK GOING BACK GOING BACK GOING BACK GOING BACK ');
  fetch('/fileMenager/pathChange', {
    method: 'POST',
    body: JSON.stringify({ pathUpdt: '..' }),
    headers: { 'Content-Type': 'application/json' },
  });
  loadFiles();
});

//make users id doenst show on fileexporer route
//add close window option on showing file