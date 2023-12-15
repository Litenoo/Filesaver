let display = document.querySelector('#fileExplorer');
const userId = document.querySelector('#path').innerHTML;

loadFiles()
    .then(() => { setup() })

const formDisplay = document.querySelector('#editing');
const options = document.querySelectorAll('#optionButtons div');
let delDisplay;

options.forEach(element => {
    element.addEventListener('click', async () => {
        await btnC(element.id);
        console.log(element.id)
        if (element.id == 'delete') {
            console.log('del clicked')
            delDisplay = document.querySelector('#filesToDel');
            console.log(delDisplay)
        }
    });
})
let selected = [];

async function btnC(option) { // Make request handler on serwer which will return that json, becouse it wont work otherwise
    let response = await fetch('/fileMenager/getForm');
    response = await response.json();
    formDisplay.innerHTML = response[option];
}

async function loadFiles(path) { // for future -- User can input "../<rest of path>"  in html and acces to server files.
    let response = await fetch('/fileMenager/structure', { method: "POST", body: { path: path } });
    let files = await response.json();

    files = files.files;
    let inner = '';
    files.forEach(file => {
        let path = `usersFiles/${userId}/${file}`;
        let cls = 'file';

        if (path.split('.')[1] == undefined) {
            path = `images/folder.png`;
            cls = 'folder';
        }
        inner = inner + `<div name="${cls}" class="element"><img src="${path}"></img><div>${file}</div></div>`;
    });
    display.innerHTML = inner;
}

function setup() {
    let tiles = document.querySelectorAll('.element');

    tiles.forEach(element => {
        element.addEventListener('click', () => {
            if (!selected.includes(element.textContent)) {
                selected.push(element.textContent);
            } else {
                selected.forEach((arrayElem, index) => {
                    if (arrayElem === element.textContent) {
                        selected.splice(index, 1);
                    }
                });
            }
            if (delDisplay != undefined) {
                console.log(selected)
                delDisplay.innerHTML = selected;
            }
        });
    });
}

async function deleteFiles() { //repair this
    console.log('client req to delete files sent >'); 
    await fetch('/fileMenager/deleteFiles', {body:{delFiles:selected}, method:'POST'}); //change method to delete
    selected = [];
}