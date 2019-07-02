import * as switchingPage from '../page-operators/switchingPage.js'

const consoleStyling =  'color: orange'

function navState(){
    const navItems = document.querySelectorAll('.mainNav-item a')
    navItems.forEach(item=>{
        item.addEventListener('click', function(){
            document.querySelector('main').classList.remove('artist-page')
            navItems.forEach(item=>item.classList.remove('active'))
            this.classList.add('active')
        })
    })
    if(navItems[0]===undefined) return
    navItems[0].classList.add('active')
}

function events(links){
    console.log('%c Adding events to links or link', consoleStyling)
    if(links.length){
        links.forEach(link=>{
            link.addEventListener('click', switchingPage.renderNewPage)
        })
    }else{
        links.addEventListener('click', switchingPage.renderNewPage)
    }
}

export {events, navState}