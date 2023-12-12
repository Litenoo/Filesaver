let display = document.querySelector('#fileExplorer');
const userId = document.querySelector('#path').innerHTML;

async function loadFiles(path) { // for future -- User can input ../<rest of path>  in html and acces to server files.
    let response = await fetch('/fileMenager/structure', { method: "POST", body: { path: path } });
    let files = await response.json();
    files = files.files;
    let inner = '';

    files.forEach(file =>{
        let path = `usersFiles/${userId}/${file}`;
        if(path.split('.')[1] == undefined){
            path = `images/folder.png`;
        }
        inner = inner + `<div class="file"><img src="${path}"></img>${file}</div>`;
        display.innerHTML = inner;
    });
}

loadFiles();