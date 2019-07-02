const socket = io()
import * as searchPage from'./pages/search.js'

socket.on('sending artistinfo', (data)=>searchPage.renderSearchResults(data))
export {socket}