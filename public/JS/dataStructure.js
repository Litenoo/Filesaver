const display = document.querySelector('#fileExplorer');
const userId = document.querySelector('#path').innerHTML; //change that, so it will take user ID from session
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

async function loadFiles(path) {
  // for future -- User can input "../<rest of path>"  in html and acces to server files.
  selected = [];

  function onTileClck(file){
    if(selected.includes(file)){
      let index = selected.indexOf(file);
      selected.splice(index, 1);
      file.style.background = '#262626';
    }else{
      selected.push(file);
      file.style.background = '#07B';
    }
  }
  const response = await fetch('/fileMenager/structure', { method: 'POST', body: { path } });
  let download = await response.json();
  
  files = download.files;
  let inner = '';

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

  let filesDisp = document.querySelectorAll('#fileExplorer div');
  filesDisp.forEach(element =>{
    element.addEventListener('click', ()=>{onTileClck(element)});
  })
}


loadFiles()
  .then(() => { setup(); });

document.querySelector('#reload').addEventListener('click', () => { // replace it with auto reload after action done
  loadFiles();
 });

async function deleteFiles() { //Remake
  // let filesRoutes = [];
  // for (i = 0; i < selected.length; i++) {
  //   let item = selected[i].querySelector('img').src.split('usersFiles')[1];
  //   if(item === undefined){
  //     item = `${userId}/${selected[i].querySelector('div').innerHTML}`; // It wont work when direction exploring system will be implemented.
  //     // Instead of it get it from route variable.
  //   }
  //   filesRoutes.push(item);
  // }
  // console.log('SENDING:', filesRoutes);

  // const response = await fetch('/fileMenager/deleteFiles', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ filesToDel: filesRoutes }),
  // });
}