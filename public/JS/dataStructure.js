const display = document.querySelector('#fileExplorer');
const userId = document.querySelector('#path').innerHTML;
const formDisplay = document.querySelector('#editing');
const options = document.querySelectorAll('.option');

let selected = [];
let currentOption = '';

function setup() {
  const tiles = document.querySelectorAll('.element');
  tiles.forEach(tile =>{
    tile.addEventListener('click', ()=>{
      console.log(tile);
      if(currentOption === 'delete'){
        if(!selected.includes(tile)){
          selected.push(tile);
        }else{
          selected.splice(selected.indexOf(tile),1);
        }
        tiles.forEach(element => element.style.background = "#262626");
        selected.forEach(element => element.style.background = '#1255AD');
      }
      if(currentOption === 'edit'){
        console.log('editor opens* ', tile);
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
  currentOption = option;
  formDisplay.innerHTML = response[option];
}

async function loadFiles(path) {
  // for future -- User can input "../<rest of path>"  in html and acces to server files.
  const response = await fetch('/fileMenager/structure', { method: 'POST', body: { path } });
  let files = await response.json();

  files = files.files;
  let inner = '';
  files.forEach((file) => {
    let path = `usersFiles/${userId}/${file}`;
    let cls = 'file';

    if (path.split('.')[1] === undefined) {
      path = 'images/folder.png';
      cls = 'folder';
    }
    inner += `<div name="${cls}" class="element"><img src="${path}"></img><div>${file}</div></div>`;
  });
  display.innerHTML = inner;
}

loadFiles()
  .then(() => { setup(); });

options.forEach((element) => {
  element.addEventListener('click', async () => {
    await btnC(element.id);
    if (element.id === 'delete') {
      delDisplay = document.querySelector('#filesToDel');
    }
  });
});

document.querySelector('#reload').addEventListener('click', () => { loadFiles(); });

async function deleteFiles() { //Refactorize
  let filesRoutes = [];
  for(i = 0; i<selected.length; i++ ){
    filesRoutes.push(selected[i].querySelector('img').src);
  }
  console.log('SENDING:', filesRoutes);

  try {
    const response = await fetch('/fileMenager/deleteFiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filesToDel: filesRoutes }),
    });

    // Handle the response as needed
    if (response.ok) {
      console.log('Files deleted successfully');
      selected = [];
    } else {
      console.error('Failed to delete files');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}