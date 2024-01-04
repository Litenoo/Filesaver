const display = document.querySelector('#fileExplorer');
const formDisplay = document.querySelector('#editing');
const options = document.querySelectorAll('.option');

let selected = [];
let route;

async function loadFiles(routeUpd) {
  selected = [];
  let displayIcon;
  let inner = '';

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

  console.log('route update : ', routeUpd);
  await fetch('/fileMenager/pathChange', { //send route actualisation
    method: 'POST',
    body: JSON.stringify({ pathUpdt: routeUpd }),
    headers: { 'Content-Type': 'application/json' },
  });

  let response = await fetch('/fileMenager/structure', { //getting acctual position in directory
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ direction: route }),
  });

  response = await response.json();

  const files = response.files;
  const resRoute = response.route;

  files.forEach((file) => {
    displayIcon = `usersFiles/${resRoute}/${file}`;
    let cls = 'file';
    console.log(displayIcon);

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

    if (element.attributes.name.nodeValue === 'folder') { // important. changes route
      element.addEventListener('dblclick', () => {
        selected = [];
        loadFiles(element.innerText);
        console.dir(element.innerText);
      });
    }
  });

  function showEditor() {

  }
}

async function btnC(option) {
  let response = await fetch('/fileMenager/getForm');
  response = await response.json();
  selected = [];
  formDisplay.innerHTML = response[option];

  let submitBtn = document.querySelector('.submitBtn');
  submitBtn.addEventListener('click', () => {
    setTimeout(() => { // check if there is no faster way to refresh that
      loadFiles();
    }, 300);
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