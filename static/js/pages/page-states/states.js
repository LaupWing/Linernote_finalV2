let url         = 'http://localhost:3001/home'
const prevState = []

function getPrevState(){
    const container = document.querySelector('main')
    let state = prevState[prevState.length-1]
    prevState = prevState.filter(state=>state!==null && state!==prevState[prevState.length-1])
    container.classList.add('fadeAway')
    if(state ==='http://localhost:3001/search') {
        container.classList.remove('artist-page')
    }
    fetchHTML.getElement(state)
}

function setUrl(value){
    url = value
}

export {url,prevState,getPrevState, setUrl}