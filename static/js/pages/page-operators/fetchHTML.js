import * as searchPage from '../search.js'
import * as navigation from '../page-parts/navigation.js'
import * as artistPage from '../artistPage.js'
import * as homepage from '../homepage.js'
import * as preventError from '../error-preventing/preventError.js'
import removeChilds from '../../utils.js' 

const consoleStyling=  'color: white; background: black'

function getElement(href){
    console.log("%c fetchHTML- Creating new elements", consoleStyling)
    const container = document.querySelector('main')
    if(href === 'javascript:void(0);')   return
    fetch(href)
        .then(data=>data.text())
        .then(body=>{
            removeChilds(container)
            container.insertAdjacentHTML('beforeend',body)
            container.classList.remove('fadeAway')
            checkWhichPage()
        })    
}

function checkWhichPage(){
    console.log("%c fetchHTML- Checking Which page user is on", consoleStyling)
    preventError.turnOffLink(false)
    // If the id search excist that means that we are on the searchpage
    if(document.querySelector('input#search')){
        searchPage.events()
    }
    // If the class addNew excist that means that we are on the homepage
    if(document.querySelector('.addNew a')){
        navigation.events(document.querySelectorAll('.addNew a'))
    }
    else if(document.querySelector('section#homeFeed')){
        navigation.events(document.querySelectorAll('ul.list a'))
        console.log("%c fetchHTML- Requesting Homefeed", consoleStyling)
        homepage.requestHomeFeed()
    }
    else if(document.querySelector('.image-container-following')){
        navigation.events(document.querySelectorAll('ul.list a'))
    }
    // If the class artist-header excist that means that we are on the artistpage
    if(document.querySelector('header.artist-header')!==null){
        document.querySelector('main').classList.add("artist-page")
        artistPage.events()
    }
}

export {checkWhichPage, getElement}