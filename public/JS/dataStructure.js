console.log('its me Frontend JavaScript !');

async function getFiles(path){ // for future -- User can input ../<rest of path>  in html and acces to server files.
    let response = await fetch('/fileMenager/structure', {method:"POST", body:{path:path}});
    console.log(await response.json());
}