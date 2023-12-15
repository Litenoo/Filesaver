let display = document.querySelector('#fileExplorer');
const userId = document.querySelector('#path').innerHTML;
loadFiles();
const route = document.querySelector('#path');
const formDisplay = document.querySelector('#editing');
const options = document.querySelectorAll('#optionButtons div');

options.forEach(element =>{
    element.addEventListener('click', ()=>{btnC(element.id)});
})

async function btnC(option){ // Make request handler on serwer which will return that json, becouse it wont work otherwise
    let response = await fetch('/fileMenager/getForm');
    response = await response.json();
    formDisplay.innerHTML = response[option];
}

async function loadFiles(path) { // for future -- User can input "../<rest of path>"  in html and acces to server files.
    let response = await fetch('/fileMenager/structure', { method: "POST", body: { path: path } });
    let files = await response.json();

    files = files.files;
    let inner = '';
    files.forEach(file =>{
        let path = `usersFiles/${userId}/${file}`;
        let cls = 'file';
        
        if(path.split('.')[1] == undefined){
            path = `images/folder.png`;
            cls = 'folder';
        }
        inner = inner + `<div name="${cls}" class="element"><img src="${path}"></img><div>${file}</div></div>`;
    });
    display.innerHTML = inner;
}