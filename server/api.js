const fetch = require("node-fetch")
const puppeteer = require("puppeteer")
const {searchObj} = require('./utils')
const {removeAllNonAlpha} = require('./utils')
const {onlyUnique} = require('./utils')

function getDataWithToken({url,acces_token}){
    return fetch(url,
    {
        headers:
        {
        'Authorization': 'Bearer ' + acces_token
        }
    })
        .then(response=> response.json())
}

function getData(url){
    return fetch(url)
        .then(response=> response.json())
}

const ourDB ={
    nameQuery: (name)=>{
        const url = `http://185.57.8.62:3000/api/v1/artist?name=${name}`
        return getData(url)
    },
    list: ()=>{
        const url = `http://185.57.8.62:3000/api/v1/artists`
        return getData(url)
    },
    detail: (id)=>{
        const url = `http://185.57.8.62:3000/api/v1/artist?id=${id}`
        return getData(url)
    },
    userInfo: ()=>{
        const url = 'http://185.57.8.62:3000/api/v1/user?id=1'
        return getData(url)   
    }

}


const musicBrainz = {
    artistLinks: async name => {
        console.log(name)
        const artist = await getData(`http://musicbrainz.org/ws/2/artist/?query=artist:${name}&fmt=json`)
        const artistId = artist.artists[0].id
        const artistLinks = await getData(`http://musicbrainz.org/ws/2/artist/${artistId}?inc=url-rels&fmt=json`)
        // return artistLinks.relations
        //     .map(rel=>{
        //         return{
        //             type:       rel.type,
        //             urlrsc:     rel.url.resource
        //         }
        //     })
        return artistLinks
    },
}

const soundCloud = async (name) =>{
    try{
        const allLinks  = await musicBrainz.artistLinks(removeAllNonAlpha(name))
        const soundcloudLink = allLinks.filter(searchObj('soundcloud'))[0].urlrsc
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(soundcloudLink)
        const allA = await page.evaluate(()=>{
            let elements = Array.from(document.querySelectorAll('.soundList__item a'))
            let links = elements
            .map(el=>el.href)
            return links
        })
        await browser.close()
        return allA
            .filter(onlyUnique)
            .filter(i=>!i.includes('comments'))
            .filter(i=>!i.includes('tags'))
            .filter(i=>i.includes('soundcloud'))

    }catch{
        console.log('no soundcloud')
    }
}

const wikipedia = async(name)=>{
    try{
        console.log(name)
        const allLinks  = await musicBrainz.artistLinks(removeAllNonAlpha(name))
        const getLink = allLinks.filter(searchObj('wikipedia'))
        const hardCodedLink = `https://en.wikipedia.org/api/rest_v1/page/summary/${name}`

        const wikiLink  = (getLink.length===0) ? hardCodedLink : `https://en.wikipedia.org/api/rest_v1/page/summary/${getLink[0].urlrsc.split('https://en.wikipedia.org/wiki/')[1]}`

        const data = await getData(`${wikiLink}`)
        return data.extract
    }catch{
        console.log('error wikipedia data isnt loading')
    }
}


const instagram = async (name)=>{
    try{
        const allLinks  = await musicBrainz.artistLinks(removeAllNonAlpha(name))
        console.log(allLinks)
        const instaLink = allLinks.filter(searchObj('instagram'))[0].urlrsc
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(instaLink)
        const allA = await page.evaluate(()=>{
            let elements = Array.from(document.querySelectorAll('article a'))
            let links = elements
            .map(el=>el.href)
    
            return links
        })
        await browser.close()
        const getEmbed = allA.map(async(link)=>{
            const api = await fetch(`https://api.instagram.com/oembed/?url=${link}`)
            const json = await api.json()
            return json
        })
        const embeds = await Promise.all(getEmbed)
        return embeds 
    }catch{
        console.log('no insta')
    }
}

const spotifyApi ={
    search: (name, acces_token) =>{
        const config = {
            url: `https://api.spotify.com/v1/search?q=${name}&type=artist&limit=5&offset=0`,
            acces_token
        }
        return getDataWithToken(config)
    },
    artist: (id, acces_token)=>{
        const config = {
            url: `https://api.spotify.com/v1/artists/${id}`,
            acces_token
        }
        return getDataWithToken(config)
    },
    related: (id, acces_token) =>{
        const config= {
            url: `https://api.spotify.com/v1/artists/${id}/related-artists`,
            acces_token
        }
        return getDataWithToken(config)
    },
    topTracks: (id, acces_token) =>{
        const config = {
            url: `https://api.spotify.com/v1/artists/${id}/top-tracks?country=NL`,
            acces_token
        }
        return getDataWithToken(config)
    }
}


module.exports = {
    spotifyApi, 
    musicBrainz, 
    instagram, 
    soundCloud, 
    wikipedia,
    ourDB
}