const display = document.querySelector('#fileExplorer');
const formDisplay = document.querySelector('#editing');
const options = document.querySelectorAll('.option');
const routeDisp = document.querySelector('#path');
const returnBtn = document.querySelector('#back');
const fileDisp = document.querySelector('#fileDisplay');
const closeBtn = document.querySelector('#closeBtn');

let selected = [];

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

async function showFile(FName, element) {
  const ext = FName.split('.')[1];
  if (['txt', 'js', 'cpp', 'c', 'py', 'cs', 'json', 'html', 'ejs', 'css', 'docx', 'doc'].includes(ext)) {
    let response = await fetch('/fileMenager/getFile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: FName }),
    });
    response = await response.text();
    fileDisp.innerHTML = response;
    fileDisp.style.display = 'flex';
  } else if (['jpg', 'img', 'jpeg', 'webp', 'png', 'svg', 'gif'].includes(ext)) {
    fileDisp.innerHTML = `File : <img src='${element.querySelector('img').attributes.src.nodeValue}' class="displayImg"></img>`;
    fileDisp.style.display = 'flex';
  } else {
    fileDisp.innerHTML = `Files with ${ext} extension are not supported`;
    fileDisp.style.display = 'flex';
  }
}

async function loadFiles(routeUpd) {
  function displayTiles(files, pth) {
    selected = [];
    let displayIcon;
    let inner = '';

    files.forEach((file) => {
      displayIcon = `usersFiles/${pth}/${file}`;
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
      element.addEventListener('click', () => { onFileSelect(element); });
      if (element.attributes.name.nodeValue === 'folder') {
        element.addEventListener('dblclick', () => { loadFiles(element.innerText); });
      } else if (element.attributes.name.nodeValue === 'file') {
        element.addEventListener('dblclick', () => { showFile(element.innerText, element); });
      }
    });
  }

  await fetch('/fileMenager/pathChange', {
    method: 'POST',
    body: JSON.stringify({ pathUpdt: routeUpd }),
    headers: { 'Content-Type': 'application/json' },
  });

  let response = await fetch('/fileMenager/structure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ direction: routeUpd }),
  });

  response = await response.json();
  displayTiles(response.files, response.route);
  routeDisp.innerHTML = response.route;
}

async function btnC(option) {
  let response = await fetch('/fileMenager/getForm');
  response = await response.json();

  formDisplay.innerHTML = response[option];

  const submitBtn = document.querySelector('.submitBtn');
  submitBtn.addEventListener('click', () => {
    setTimeout(() => {
      loadFiles();
    }, 100);
  });
}

function setup() {
  options.forEach((element) => {
    console.log(element);
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
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filesToDel: selected }),
    });
  }
}

returnBtn.addEventListener('click', () => {
  fetch('/fileMenager/pathChange', {
    method: 'POST',
    body: JSON.stringify({ pathUpdt: '..' }),
    headers: { 'Content-Type': 'application/json' },
  });
  loadFiles();
});
