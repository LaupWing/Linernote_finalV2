import * as homepage from './pages/homepage.js'
import * as navigation from './pages/page-parts/navigation.js'

const init = {
    consoleStyling: 'background: #222; color: #bada55',
    firstEnter: ()=>{
        init.addingEventsToNavLinks()
        navigation.navState()
        if(document.querySelector('section#homeFeed')){
            console.log('%c requesting homefeed', init.consoleStyling)
            navigation.events(document.querySelectorAll('ul.list a'))  
            homepage.requestHomeFeed()
        }
    },
    addingEventsToNavLinks: ()=> {
        console.log('%c Adding navigation click events', init.consoleStyling)
        const links = Array.from(document.querySelectorAll('nav#nav a'))
        if(document.querySelector('.addNew a')){
            links.push(document.querySelector('.addNew a'))
        }
        if(document.querySelectorAll('ul.list a')){
            navigation.events(document.querySelectorAll('ul.list a'))    
        }
        navigation.events(links)
    }
}

window.addEventListener('load', ()=>init.firstEnter())