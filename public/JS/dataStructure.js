const display = document.querySelector('#fileExplorer');
const formDisplay = document.querySelector('#editing');
const options = document.querySelectorAll('.option');

let selected = [];

function setup() {
  options.forEach((element) => {
    element.addEventListener('click', async () => {

      await btnC(element.id);
      if (element.id === 'delete') {
        delDisp = document.querySelector('#filesToDel');
      }

    });
  });
}

function showEditor() {

}

async function btnC(option) {
  let response = await fetch('/fileMenager/getForm');
  response = await response.json();
  selected = [];
  formDisplay.innerHTML = response[option];
}

async function loadFiles(path) { // works but look at it :P
  let userId = await fetch('fileMenager/userId');
  userId = await userId.json();
  selected = [];
  let route; // remake that
  if(path){
    route = '/' + path; //it works only for 1 depth explore
  }
  const response = await fetch('/fileMenager/structure', {
     method: 'POST',
      headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ direction: route }), //Remember about it ! Its needed to stringify body send to server.
    });
  let download = await response.json();

  let files = download.files;
  let inner = '';

  function onFileSelect(file) {
    if (selected.includes(file)) {
      let index = selected.indexOf(file);
      selected.splice(index, 1);
      file.style.background = '#262626';
    } else {
      selected.push(file);
      file.style.background = '#07B';
    }
  }

  files.forEach((file) => {
    let displayIcon = `usersFiles/${userId}/${file}`;
    let cls = 'file';

    if (file.split('.')[1] === undefined) {
      displayIcon = 'images/folder.png';
      cls = 'folder';
    }
    inner += `<div name="${cls}" class="element"><img src="${displayIcon}"></img><div>${file}</div></div>`;
  });

  display.innerHTML = inner;

  const filesDisp = document.querySelectorAll('#fileExplorer .element');
  filesDisp.forEach(element => {
    element.addEventListener('click', () => { onFileSelect(element) });
    if (element.attributes.name.nodeValue === 'folder') {
      element.addEventListener('dblclick', () => {
        selected = [];
        loadFiles(element.innerText);
        console.dir(element.innerText);
      });
    }
  });
}

loadFiles('')
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
}