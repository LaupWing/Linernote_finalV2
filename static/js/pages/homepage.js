import removeChilds from '../utils.js'
import * as feed from './page-operators/feed.js'
import * as filter from './page-parts/filter.js'

async function requestHomeFeed (){
    const homefeed = await fetch('http://localhost:3001/homefeed')
    const html     = await homefeed.text()
    const container = document.querySelector('section#homeFeed')
    removeChilds(container)
    container.insertAdjacentHTML('beforeend', html)
    feed.iframeActivate()
    filter.event()
}

export {requestHomeFeed}