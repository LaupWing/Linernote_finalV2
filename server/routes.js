const express       = require('express')
const router        = express.Router()
const {spotifyApi}  = require('./api.js')
const {soundCloud}  = require('./api.js')
const {wikipedia}   = require('./api.js')
const {ourDB}       = require('./api.js')
const {musicBrainz} = require('./api.js')
const {onlyUnique} = require('./utils.js')

let following       

router.get('/', (req, res)=>{
    res.render('login', {
        script:false
    })
})

async function getFollowerInfo(list){
    const following = list.map(async (a)=>{
        const artist      = await spotifyApi.artist(a.id, acces_token)
        return artist
    })
    const response   = await Promise.all(following)
    const reformList = response.map(item=>{
        return{
            name:   item.name,
            id:     item.id,
            image:  item.images[0].url
        }
    })
    return reformList 
}

router.get('/index', async (req, res)=>{
    acces_token = req.session.acces_token
    const io = req.app.get('socketio')
    req.session.user = await ourDB.userInfo()
    following = req.session.user.ordered
    io.on('connection', socket=>{
        socket.on('sending searchvalue',async (value)=>{
            try{
                const result        = await ourDB.nameQuery(value)
                const searchSpotify = await spotifyApi.search(result.artist,acces_token)
                const img           = searchSpotify.artists.items[0].images[0].url
                const spotifyId     = searchSpotify.artists.items[0].id
                result.img          = img
                result.spotifyId    = spotifyId

                let followed        = 'noborder'
                for(fw of following){
                    if(fw.id===result.id){
                        followed = 'border'
                    }
                }
                socket.emit('sending artistinfo', {
                    result,
                    foundSomething: true,
                    followed
                })            
            }catch{
                socket.emit('sending artistinfo', {
                    result          : 'Found nothing!',
                    foundSomething  : false
                })
            }
        })
        socket.on('update list', async ()=>{
            setTimeout(async()=>{
                const user = await ourDB.userInfo()
                req.session.user = user
                following = user.ordered
            },1000)
        })
    })
    if(req.session.user.ordered.length>0){
        const artists = await getCorrespondingImg(req.session.user.ordered)
        const test = artists.map(async item=>{
            const follower      = item
            const id            = await ourDB.nameQuery(follower.artist)
            follower.id         = id.id
            return follower
        })
        const list = await Promise.all(test)
        res.render('index',{
            currentPage: 'partials/followingList.ejs',
            list,
            script: true
        })
    }else{
        res.render('index',{
            currentPage: 'partials/following.ejs',
            script: true
        })
    }
})

router.get('/home', async (req, res)=>{
    if(following.length>0){
        const list = await getCorrespondingImg(following)
        res.render('partials/followingList',{list})
    }else{
        res.render('partials/following')
    }
})

router.get('/search', (req, res)=>{
    res.render('partials/search.ejs')
})

router.get('/homefeed', async (req, res)=>{
    const feed = following.map(async(fw)=>{
        const follower      = fw 
        // const soundcloud    = await soundCloud(follower.artist)
        const spotify       = await spotifyApi.search(follower.artist, acces_token)
        const img           = spotify.artists.items[0].images[0].url
        follower.img        = img
        // follower.soundCloud = soundcloud
        return follower
    })
    const response = await Promise.all(feed)
    const artists   = response.map(dateFormatter)
    res.render('partials/homefeed', {artists})
})

function dateFormatter(item){
    const post     = item 
    const raw_date = new Date(post.timestamp)
    const date     =  String(raw_date).split('GMT')[0]
    post.date      = date
    return post
}



router.get('/artist/:id', async(req,res)=>{
    const ids         = req.params.id
    const acces_token = req.session.acces_token
    
    const spotifyId   = ids.split('&')[0]
    const zekkieId    = ids.split('&')[1]

    const list       = await ourDB.list()
    const imgRes     = await getCorrespondingImg(list)
    
    const related   = imgRes
        .map(r=>{
            let obj = r
            for(f of following.filter(onlyUnique)){
                if(f.artist === r.artist){
                    obj.border = 'border'
                    return obj
                }
            }
            obj.border = 'noborder'
            return obj
        })
        .sort((a,b)=>{
            for(f of following.filter(onlyUnique)){
                if(f.artist === a.artist){
                    return -1
                }else{
                    return 1
                }
            }
        })
    const artist     = await spotifyApi.artist(spotifyId, acces_token)
    const data       = await ourDB.detail(zekkieId)
    const wikidata   = data.wikiDescription.wiki_description
    const topTracks  = await spotifyApi.topTracks(spotifyId, acces_token)
    const tracks = topTracks.tracks
        .slice(0,5)
        .map(x=>{
            return{
                song: x.name,
                prUrl: x.preview_url
            }
        })
    res.render('partials/artist',{
        artist,
        related,
        tracks,
        zekkieId,
        wikidata
    })
})

router.post('/feed', async(req,res)=>{
    const id         = req.body.id
    const artistFeed = await ourDB.detail(id)
    console.log(artistFeed.artist)
    const spotify    = await spotifyApi.search(artistFeed.artist, req.session.acces_token)
    const img        = spotify.artists.items[0].images[0].url

    const soundcloud = await soundCloud(artistFeed.name)
    const posts ={
        twitter: artistFeed.twitterPosts.map(dateFormatter),
        instagram: artistFeed.instagramPosts.map(dateFormatter),
        events: artistFeed.events.map(dateFormatter),
        youtube: artistFeed.youtubeVideos.map(dateFormatter),
        soundcloud,
        img,
        artist: artistFeed.artist
    }
    res.render('partials/artist-partials/feeds', posts)
})



router.get('/testing', async(req,res)=>{
    const data = await musicBrainz.artistLinks('post malone')
    res.send(data)
})

async function getCorrespondingImg(list){
    // Getting corresponding img from
    const filteredList = list
        .map(item=>checkProperty(item))
        .filter(onlyUnique)
          
    const spotify = list
        .map(item=>checkProperty(item))
        .filter(onlyUnique)
        .map(name=>{
            return spotifyApi.search(name, acces_token)
        })
    const response   = await Promise.all(spotify)
    const images     = response
        .map(artists=>artists.artists.items[0].images[0].url)
    const spotifyID  = response
        .map(artists=>artists.artists.items[0].id)
    
    const ourData   =  filteredList.map(name=>{
        return ourDB.nameQuery(name)
    })
    const response2 = await Promise.all(ourData)
    const zekkieId  = response2.map(res=>res.id)

    const related = filteredList.map((a,index)=>{
        let artist       = {
            artist: a
        }
        artist.img       = images[index]
        artist.spotifyId = spotifyID[index]
        artist.id        = zekkieId[index]
        return artist
    })
    return related
}

function checkProperty(item){
    if(item.artist !== undefined){
        return item.artist
    }else{
        return item.name
    }
}



module.exports = router