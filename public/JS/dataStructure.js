const display = document.querySelector('#fileExplorer');
const formDisplay = document.querySelector('#editing');
const options = document.querySelectorAll('.option');

let selected = [];
let route;

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

  let submitBtn = document.querySelector('.submitBtn');
  submitBtn.addEventListener('click', ()=>{
    console.log(submitBtn);
    setTimeout(()=>{ // check if there is no faster way to refresh that
      loadFiles();
    },300)
  });
}

async function loadFiles(path) {
  console.log('load files function started')
  
  //need to make direction doesnt change after refresh explorer

  if(path){
    route = '/' + path; //it works only for 1 depth explore
  }
  const response = await fetch('/fileMenager/structure', {
     method: 'POST',
      headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ direction: route }),
    });
    
    let userInfo = await fetch('fileMenager/userInfo');
    userInfo = await userInfo.json();
    selected = [];
    if(userInfo.expPath === undefined){
      userInfo.expPath = '';
    }
    console.log(userInfo)

  let download = await response.json();

  let files = download.files;
  let inner = '';

  function onFileSelect(tile) {
    if (selected.includes(tile)) {
      let index = selected.indexOf(tile);
      selected.splice(index, 1);
      tile.style.background = '#262626';
    } else {
      selected.push(tile);
      tile.style.background = '#07B';
    }
  }

  files.forEach((file) => {
    let displayIcon = `usersFiles/${userInfo.id}/${userInfo.expPath}/${file}`;
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