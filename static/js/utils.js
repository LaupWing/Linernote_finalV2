export default function removeChilds(container){
    if(container===null)    return
    while(container.firstChild){
        container.removeChild(container.firstChild)
    }
}
