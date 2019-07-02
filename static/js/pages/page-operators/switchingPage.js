import * as preventError from '../error-preventing/preventError.js' 
import * as states from '../page-states/states.js'
import * as fetchHTML from '../page-operators/fetchHTML.js'

console.log(states.url)

const consoleStyling = 'color: white; background: blue'

function renderNewPage(){
    console.log("%c switchingPage- rendering new page", consoleStyling)
    event.preventDefault()
    if(this.href === 'javascript:void(0);')   return
    states.prevState.push(states.url)
    states.setUrl(this.href)
    console.log(states.url)
    const main = document.querySelector('main')
    main.classList.add('fadeAway')
    preventError.turnOffLink(true)
    main.addEventListener('transitionend', transitionBridge)
}

function transitionBridge(){
    const container = document.querySelector('main')
    if(event.propertyName === 'opacity'){  
        fetchHTML.getElement(states.url)
        container.removeEventListener('transitionend', transitionBridge)
    }
}

export {renderNewPage, transitionBridge}