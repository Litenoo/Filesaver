const display = document.querySelector('#fileExplorer');
const formDisplay = document.querySelector('#editing');
const options = document.querySelectorAll('.option');
const routeDisp = document.querySelector('#path');
const backBtn = document.querySelector('#back');



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
      if (element.attributes.name.nodeValue === 'folder') {
        element.addEventListener('dblclick', () => {loadFiles(element.innerText)});
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

function showEditor() {

}

async function btnC(option) {
  selected = [];
  let response = await fetch('/fileMenager/getForm');
  response = await response.json();

  formDisplay.innerHTML = response[option];

  let submitBtn = document.querySelector('.submitBtn');
  submitBtn.addEventListener('click', () => {
    setTimeout(()=>{
      loadFiles();
    },100)
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

async function deleteFiles() {
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