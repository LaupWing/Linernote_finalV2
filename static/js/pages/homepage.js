export const homepage ={
    requestHomeFeed: async ()=>{
        const homefeed = await fetch('http://localhost:3001/homefeed')
        const html     = await homefeed.text()
        const container = document.querySelector('section#homeFeed')
        removeChilds(container)
        container.insertAdjacentHTML('beforeend', html)
        feed.iframeActivate()
    }
}
