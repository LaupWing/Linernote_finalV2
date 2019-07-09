import * as states from './page-states/states.js'
import * as navigation from './page-parts/navigation.js'
import * as filter from './page-parts/filter.js'
import * as feed from './page-operators/feed.js'
import removeChilds from '../utils.js'
import {socket} from '../socket.js'

function events(){
    document.querySelector('i.fas.fa-chevron-left').addEventListener('click', states.getPrevState)
    navigation.events(document.querySelectorAll('li.related-item a'))
    const zekkieid = document.querySelector('header.artist-header').dataset.zekkieid
    feed.requestingFeed(zekkieid)
    document.querySelector('.click-left-overlay').addEventListener('click', headerEvents.minus)
    document.querySelector('.click-right-overlay').addEventListener('click', headerEvents.plus)
    checkFollowing()
    document.querySelectorAll('.track i').forEach(x=>{
        x.addEventListener('click', headerEvents.music)
    })
}


const headerEvents=  {
    index: 0,
    minus: ()=>{
        const headers = document.querySelectorAll('.header-section')
        const i = document.querySelectorAll('nav.header i')
        console.log(headerEvents.index)
        if(headerEvents.index ===0) return
        headerEvents.index--
        headers.forEach(x=>x.classList.remove('visible'))
        headers[headerEvents.index].classList.add('visible')
        i.forEach(x=>x.classList.remove('visible'))
        i[headerEvents.index].classList.add('visible')
    },
    plus: ()=>{
        console.log('right overlay transition', headerEvents.index)
        const headers = document.querySelectorAll('.header-section')
        const i = document.querySelectorAll('nav.header i')
        console.log(headerEvents.index)
        if(headerEvents.index ===2) return
        headerEvents.index++
        headers.forEach(x=>x.classList.remove('visible'))
        headers[headerEvents.index].classList.add('visible')
        i.forEach(x=>x.classList.remove('visible'))
        i[headerEvents.index].classList.add('visible')
    },
    music: function(){
        const all = document.querySelectorAll('.header-section.topTracks .track')
        all.forEach(x=>x.querySelector('audio').pause())
        this.parentElement.querySelector('audio').play()   
    }
}

function renderPosts(posts){
    const feed = document.querySelector('section#feed')
    removeChilds(feed)
    feed.insertAdjacentHTML('beforeend', posts)
    filter.event()
}

function followEvent(){
    const btn = document.querySelector('a.btn.btn-follow')
    if(btn.classList.contains('following')){
        btn.removeEventListener('click', follow) 
        btn.addEventListener('click', unfollow) 
    }else{
        btn.removeEventListener('click', unfollow) 
        btn.addEventListener('click', follow)
    }
}

function follow(){
    event.preventDefault()
    const zekkieid = document.querySelector('header.artist-header').dataset.zekkieid
    const xhr = new XMLHttpRequest();
    xhr.open("POST",`http://185.57.8.62:3000/api/v1/user/follow?userId=1&artistId=${zekkieid}`);
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xhr.send();
    const btn = document.querySelector('a.btn.btn-follow')
    btn.textContent = 'unfollow'
    btn.classList.add('following')
    followEvent()
    socket.emit('update list')
}

function unfollow(){
    const btn = document.querySelector('a.btn.btn-follow')
    const xhr = new XMLHttpRequest();
    const zekkieid = document.querySelector('header.artist-header').dataset.zekkieid
    
    const params = `userId=1&artistId=${zekkieid}`
    xhr.open("DELETE", "http://185.57.8.62:3000/api/v1/user/unfollow");
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xhr.send(params);
    
    btn.textContent = 'follow'
    btn.classList.remove('following')
    followEvent()
    socket.emit('update list')
}

async function checkFollowing(){
    const res  = await fetch('http://185.57.8.62:3000/api/v1/user?id=1')
    const user = await res.json()
    const id   = document.querySelector('header.artist-header').dataset.zekkieid
    const btn = document.querySelector('a.btn.btn-follow')
    for(let fw of user.following){
        if(Number(fw.id) === Number(id)){
            btn.textContent = 'unfollow'
            btn.classList.add('following')
        }
    }
    followEvent()
}

export {
    checkFollowing, 
    unfollow, 
    follow, 
    events, 
    renderPosts, 
    followEvent, 
    headerEvents
}