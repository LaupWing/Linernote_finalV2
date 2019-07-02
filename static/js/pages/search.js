import removeChilds from '../utils.js'
import {socket} from '../socket.js'
import * as navigation from '../pages/page-parts/navigation.js'

const consoleStyling = 'color: white; background: #171717'

function renderSearchResults(result){
    console.log("%c searchPage- rendering search results", consoleStyling)
    const container = document.querySelector('section.search-main')
    removeChilds(container)
    const item = result.result
    if(result.foundSomething){
        const img = item.img ? item.img : '/img/placeholder.png'
        const newElement =`
        <div data-id="${item.id}" class="result-item">
            <a class="result-link" href="/artist/${item.spotifyId}&${item.id}">
            <img class="result-img ${result.followed}" src="${img}" alt="">
            <p class="result-name">${item.artist}</p>
            </a>
        </div>
        `
        container.insertAdjacentHTML('beforeend', newElement)
        document.querySelector('a.result-link')
        navigation.events(document.querySelector('a.result-link'))
    }else{
        const newElement =`
        <div class="error">
            <h3 class="nothing">${item}</h3>
        </div>
        `
        container.insertAdjacentHTML('beforeend', newElement)
    }
}

function events(){
    console.log("%c searchPage- adding events", consoleStyling)
    const input = document.querySelector('#search')
    const deleteInput = document.querySelector('.input-container i')
    deleteInput.addEventListener('click', clearSearch)
    input.addEventListener('input', getSearchResults)
}

function getSearchResults(){
    console.log("%c searchPage- typing", consoleStyling)
    const input = document.querySelector('#search')
    if(input.value.length === 0){
        const container = document.querySelector('section.search-main')
        document.querySelector('.input-container i').classList.remove('reveal')
        removeChilds(container)
    }
    else if(input.value.length > 0){
        document.querySelector('.input-container i').classList.add('reveal')
    }
    if(input.value.length >3){
        console.log("emitting search")
        socket.emit('sending searchvalue', input.value)
    }
}

function clearSearch(){
    console.log("%c searchPage- clearing", consoleStyling)
    const input = document.querySelector('#search')
    input.value = ''
    removeChilds(document.querySelector('section.search-main'))
}

export {events, clearSearch, getSearchResults, renderSearchResults}