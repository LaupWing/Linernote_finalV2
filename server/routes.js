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
    console.log(reformList)
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
                console.log(result)
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
                console.log('updated list')
                following = user.following
            },1000)
        })
    })
    if(req.session.user.ordered.length>0){
        const list = await getCorrespondingImg(req.session.user.ordered)
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
        console.log('no folowers')
        res.render('partials/following')
    }
})

router.get('/search', (req, res)=>{
    res.render('partials/search.ejs')
})

router.get('/homefeed', async (req, res)=>{
    const feed = following.map(async(fw)=>{
        const follower      = fw 
        const soundcloud    = await soundCloud(follower.artist)
        const spotify       = await spotifyApi.search(follower.artist, acces_token)
        const img           = spotify.artists.items[0].images[0].url
        follower.img        = img
        follower.soundCloud = soundcloud

        return follower
    })
    const artists = await Promise.all(feed)
    console.log(artists)
    // const feeds = following.map(async (fw)=>{
    //     const artistFeed = await ourDB.detail(fw.id)
    //     const posts ={
    //         twitter: artistFeed.tweets,
    //         instagram: artistFeed.instagramPosts,
    //         events: artistFeed.events,
    //         youtube: artistFeed['youtube-videos'],
    //         soundcloud,
    //         name: artistFeed.artist,
    //         img
    //     }
    //     return posts
    // })
    // const artists = await Promise.all(feeds)
    res.render('partials/homefeed', {artists})
})

router.get('/artist/:id', async(req,res)=>{
    const ids         = req.params.id
    const acces_token = req.session.acces_token
    
    const spotifyId   = ids.split('&')[0]
    const zekkieId    = ids.split('&')[1]

    const list    = await ourDB.list()
    
    const related    = await getCorrespondingImg(list)
    const related2   = related
        .map(r=>{
            let obj = r
            for(f of following){
                if(f.id === r.id){
                    obj.border = 'border'
                    return obj
                }
            }
            obj.border = 'noborder'
            return obj
        })
    const artist     = await spotifyApi.artist(spotifyId, acces_token)
    const data         = await ourDB.detail(zekkieId)
    const wikidata     = data.wikiDescription.wiki_description
    const topTracks  = await spotifyApi.topTracks(spotifyId, acces_token)
    const tracks = topTracks.tracks
        .slice(0,5)
        .map(x=>{
            return{
                song: x.name,
                prUrl: x.preview_url
            }
        })
    console.log(tracks)
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

    const soundcloud = await soundCloud(artistFeed.name)
    const posts ={
        twitter: artistFeed.tweets,
        instagram: artistFeed.instagramPosts,
        events: artistFeed.events,
        youtube: artistFeed['youtube-videos'],
        soundcloud
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
        .map(item=>item.artist)
        .filter(onlyUnique)  
    const spotify = list
        .map(item=>item.artist)
        .filter(onlyUnique)
        .map(name=>{
            return spotifyApi.search(name, acces_token)
        })
    const response   = await Promise.all(spotify)
    const images     = response
        .map(artists=>artists.artists.items[0].images[0].url)
    const spotifyID  = response
        .map(artists=>artists.artists.items[0].id)
    console.log(images)
    console.log(spotifyID)
    console.log(filteredList)
    const related = filteredList.map((a,index)=>{
        let artist       = {
            artist: a
        }
        artist.img       = images[index]
        artist.spotifyId = spotifyID[index]
        return artist
    })
    return related
}


module.exports = router