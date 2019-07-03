import * as  artistPage from '../artistPage.js'

function soundCloudEmbeds(){
    const allEmbeds = document.querySelectorAll('.putTheWidgetHere')
    if(allEmbeds.length===0)    return
    allEmbeds.forEach((embed,i)=>{
        const url = embed.getAttribute('data-url')
        SC.oEmbed(url, {
            element: document.querySelector(`.putTheWidgetHere#id${i}`)
        });
    })
}

async function requestingFeed(id){
    const value = { id }
    const config = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(value)
        }
    const response = await fetch('/feed', config)
    const posts = await response.text()
    artistPage.renderPosts(posts)
    iframeActivate()
}

function iframeActivate(){
    instgrm.Embeds.process()
    // soundCloudEmbeds()
    twttr.widgets.load()
}

export {iframeActivate, soundCloudEmbeds, requestingFeed}
