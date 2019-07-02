const consoleStyling =  'color: red; background: yellow'
function turnOffLink(disable){
    console.log("%c preventError- disable nav links", consoleStyling)
    const links = document.querySelectorAll('nav#nav a')
    links.forEach((link,index)=>{
        if(disable){
            link.href="javascript:void(0);"
        }
        else{
            if(index===0)      link.href="/home"
            else if(index===1) link.href="/search"
            else if(index===2) link.href="/info"
        }
    })
}

export {turnOffLink}