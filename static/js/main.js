import homepage from '/pages/homepage.js'
const socket = io()

socket.on('sending artistinfo', (data)=>searchPage.renderSearchResults(data))
socket.on('change artistpage', (obj)=>renderArtistPage(obj))
socket.on('followers info', (list)=>renderFollowingList(list))

const init = {
    consoleStyling: 'background: #222; color: #bada55',
    firstEnter: ()=>{
        init.addingEventsToNavLinks()
        navigation.navState()
        if(document.querySelector('section#homeFeed')){
            console.log('%c requesting homefeed', init.consoleStyling)
            navigation.events(document.querySelectorAll('ul.list a'))  
            homepage.requestHomeFeed()
        }
    },
    addingEventsToNavLinks: ()=> {
        console.log('%c Adding navigation click events', init.consoleStyling)
        const links = Array.from(document.querySelectorAll('nav#nav a'))
        if(document.querySelector('.addNew a')){
            links.push(document.querySelector('.addNew a'))
        }
        if(document.querySelectorAll('ul.list a')){
            navigation.events(document.querySelectorAll('ul.list a'))    
        }
        navigation.events(links)
    }
}

// const homePage ={
//     requestHomeFeed: async ()=>{
//         const homefeed = await fetch('http://localhost:3001/homefeed')
//         const html     = await homefeed.text()
//         const container = document.querySelector('section#homeFeed')
//         removeChilds(container)
//         container.insertAdjacentHTML('beforeend', html)
//         feed.iframeActivate()
//     }
// }

const states = {
    url: 'http://localhost:3001/home',
    prevState: [],
    getPrevState: ()=>{
        const container = document.querySelector('main')
        let state = states.prevState[states.prevState.length-1]
        states.prevState = states.prevState.filter(state=>state!==null && state!==states.prevState[states.prevState.length-1])
        container.classList.add('fadeAway')
        if(state ==='http://localhost:3001/search') {
            container.classList.remove('artist-page')
        }
        fetchHTML.getElement(state)
    }
}



const navigation = {
    consoleStyling: 'color: orange',
    navState: ()=>{
        const navItems = document.querySelectorAll('.mainNav-item a')
        navItems.forEach(item=>{
            item.addEventListener('click', function(){
                document.querySelector('main').classList.remove('artist-page')
                navItems.forEach(item=>item.classList.remove('active'))
                this.classList.add('active')
            })
        })
        if(navItems[0]===undefined) return
        navItems[0].classList.add('active')
    },
    events: (links)=>{
        console.log('%c Adding events to links or link', navigation.consoleStyling)
        if(links.length){
            links.forEach(link=>{
                link.addEventListener('click', switchingPage.renderNewPage)
            })
        }else{
            links.addEventListener('click', switchingPage.renderNewPage)
        }
    }
}

const searchPage= {
    consoleStyling: 'color: white; background: #171717',
    renderSearchResults:(result)=>{
        console.log("%c searchPage- rendering search results", searchPage.consoleStyling)
        console.log(result.followed)
        const container = document.querySelector('section.search-main')
        removeChilds(container)
        const item = result.result
        if(result.foundSomething){
            const img = item.img ? item.img : '/img/placeholder.png'
            const newElement =`
            <div data-id="${item.id}" class="result-item">
                <a class="result-link" href="/artist/${item.spotifyId}&${item.id}">
                <img class="result-img ${result.followed}" src="${img}" alt="">
                <p class="result-name">${item.name}</p>
                </a>
            </div>
            `
            container.insertAdjacentHTML('beforeend', newElement)
            document.querySelector('a.result-link')
            navigation.events(document.querySelector('a.result-link'))
        }else{
            const newElement =`
            <div class="error">
                <h3 class="nothing">${item}</h3>
            </div>
            `
            container.insertAdjacentHTML('beforeend', newElement)
        }
    },
    events: ()=>{
        console.log("%c searchPage- adding events", searchPage.consoleStyling)
        const input = document.querySelector('#search')
        const deleteInput = document.querySelector('.input-container i')
        deleteInput.addEventListener('click', searchPage.clearSearch)
        input.addEventListener('input', searchPage.getSearchResults)
    },
    getSearchResults: ()=>{
        console.log("%c searchPage- typing", searchPage.consoleStyling)
        const input = document.querySelector('#search')
        if(input.value.length === 0){
            const container = document.querySelector('section.search-main')
            document.querySelector('.input-container i').classList.remove('reveal')
            removeChilds(container)
        }
        else if(input.value.length > 0){
            document.querySelector('.input-container i').classList.add('reveal')
        }
        if(input.value.length >3){
            console.log("emitting search")
            socket.emit('sending searchvalue', input.value)
        }
    },
    clearSearch: ()=>{
        console.log("%c searchPage- clearing", searchPage.consoleStyling)
        const input = document.querySelector('#search')
        input.value = ''
        removeChilds(document.querySelector('section.search-main'))
    }
}

function removeChilds(container){
    if(container===null)    return
    while(container.firstChild){
        container.removeChild(container.firstChild)
    }
}

const switchingPage = {
    consoleStyling: 'color: white; background: blue',
    renderNewPage: function(){
        console.log("%c switchingPage- rendering new page", preventError.consoleStyling)
        event.preventDefault()
        if(this.href === 'javascript:void(0);')   return
        states.prevState.push(states.url)
        states.url = this.href
        console.log(states.url)
        const main = document.querySelector('main')
        main.classList.add('fadeAway')
        preventError.turnOffLink(true)
        main.addEventListener('transitionend',switchingPage.transitionBridge)
    },
    transitionBridge: () =>{
        const container = document.querySelector('main')
        if(event.propertyName === 'opacity'){  
            fetchHTML.getElement(states.url)
            container.removeEventListener('transitionend',switchingPage.transitionBridge)
        }
    }
}

const preventError = {
    consoleStyling: 'color: red; background: yellow',
    turnOffLink: (disable)=>{
        console.log("%c preventError- disable nav links", preventError.consoleStyling)
        const links = document.querySelectorAll('nav#nav a')
        links.forEach((link,index)=>{
            if(disable){
                link.href="javascript:void(0);"
            }
            else{
                if(index===0)      link.href="/home"
                else if(index===1) link.href="/search"
                else if(index===2) link.href="/info"
            }
        })
    }
}



const fetchHTML = {
    consoleStyling: 'color: white; background: black',
    getElement: (href)=>{
        console.log("%c fetchHTML- Creating new elements", fetchHTML.consoleStyling)
        const container = document.querySelector('main')
        if(href === 'javascript:void(0);')   return
        fetch(href)
        .then(data=>data.text())
        .then(body=>{
            removeChilds(container)
            container.insertAdjacentHTML('beforeend',body)
            container.classList.remove('fadeAway')
            fetchHTML.checkWhichPage()
        })    
    },
    checkWhichPage: ()=>{
        console.log("%c fetchHTML- Checking Which page user is on", fetchHTML.consoleStyling)
        preventError.turnOffLink(false)
        // If the id search excist that means that we are on the searchpage
        if(document.querySelector('input#search')){
            searchPage.events()
        }
        // If the class addNew excist that means that we are on the homepage
        if(document.querySelector('.addNew a')){
            navigation.events(document.querySelectorAll('.addNew a'))
        }
        else if(document.querySelector('section#homeFeed')){
            navigation.events(document.querySelectorAll('ul.list a'))
            homepage.requestHomeFeed()
        }
        else if(document.querySelector('.image-container-following')){
            navigation.events(document.querySelectorAll('ul.list a'))
        }
        // If the class artist-header excist that means that we are on the artistpage
        if(document.querySelector('header.artist-header')!==null){
            document.querySelector('main').classList.add("artist-page")
            artistPage.events()
        }
    }
}

const artistPage = {
    events: ()=>{
        document.querySelector('i.fas.fa-chevron-left').addEventListener('click', states.getPrevState)
        navigation.events(document.querySelectorAll('li.related-item a'))
        const zekkieid = document.querySelector('header.artist-header').dataset.zekkieid
        feed.requestingFeed(zekkieid)
        document.querySelector('.click-left-overlay').addEventListener('click', artistPage.headerEvents.minus)
        document.querySelector('.click-right-overlay').addEventListener('click', artistPage.headerEvents.plus)
        artistPage.checkFollowing()
        document.querySelectorAll('.track i').forEach(x=>{
            x.addEventListener('click', artistPage.headerEvents.music)
        })
    },
    headerEvents: {
        index: 0,
        minus: ()=>{
            const headers = document.querySelectorAll('.header-section')
            const i = document.querySelectorAll('nav.header i')
            console.log(artistPage.headerEvents.index)
            if(artistPage.headerEvents.index ===0) return
            artistPage.headerEvents.index--
            headers.forEach(x=>x.classList.remove('visible'))
            headers[artistPage.headerEvents.index].classList.add('visible')
            i.forEach(x=>x.classList.remove('visible'))
            i[artistPage.headerEvents.index].classList.add('visible')
        },
        plus: ()=>{
            console.log('right overlay transition', artistPage.headerEvents.index)
            const headers = document.querySelectorAll('.header-section')
            const i = document.querySelectorAll('nav.header i')
            console.log(artistPage.headerEvents.index)
            if(artistPage.headerEvents.index ===2) return
            artistPage.headerEvents.index++
            headers.forEach(x=>x.classList.remove('visible'))
            headers[artistPage.headerEvents.index].classList.add('visible')
            i.forEach(x=>x.classList.remove('visible'))
            i[artistPage.headerEvents.index].classList.add('visible')
        },
        music: function(){
            const all = document.querySelectorAll('.header-section.topTracks .track')
            all.forEach(x=>x.querySelector('audio').pause())
            this.parentElement.querySelector('audio').play()   
        }
    },
    renderPosts: (posts)=>{
        const feed = document.querySelector('section#feed')
        removeChilds(feed)
        feed.insertAdjacentHTML('beforeend', posts)
    },
    followEvent: ()=>{
        const btn = document.querySelector('a.btn.btn-follow')
        if(btn.classList.contains('following')){
            btn.removeEventListener('click', artistPage.follow) 
            btn.addEventListener('click', artistPage.unfollow) 
        }else{
            btn.removeEventListener('click', artistPage.unfollow) 
            btn.addEventListener('click', artistPage.follow)
        }

    },
    follow: ()=>{
        event.preventDefault()
        const zekkieid = document.querySelector('header.artist-header').dataset.zekkieid
        const xhr = new XMLHttpRequest();
        xhr.open("POST",`http://185.57.8.62:3000/api/v1/user/follow?userId=1&artistId=${zekkieid}`);
        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        xhr.send();
        const btn = document.querySelector('a.btn.btn-follow')
        btn.textContent = 'unfollow'
        btn.classList.add('following')
        artistPage.followEvent()
        socket.emit('update list')
    },
    unfollow: ()=>{
        const btn = document.querySelector('a.btn.btn-follow')
        const xhr = new XMLHttpRequest();
        const zekkieid = document.querySelector('header.artist-header').dataset.zekkieid

        const params = `userId=1&artistId=${zekkieid}`
        xhr.open("DELETE", "http://185.57.8.62:3000/api/v1/user/unfollow");
        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        xhr.send(params);

        btn.textContent = 'follow'
        btn.classList.remove('following')
        artistPage.followEvent()
        socket.emit('update list')
    },
    checkFollowing: async ()=>{
        const res  = await fetch('http://185.57.8.62:3000/api/v1/user?id=1')
        const user = await res.json()
        console.log(user)
        const id   = document.querySelector('header.artist-header').dataset.zekkieid
        const btn = document.querySelector('a.btn.btn-follow')
        for(let fw of user.following){
            console.log(fw.id,id)
            if(Number(fw.id) === Number(id)){
                btn.textContent = 'unfollow'
                btn.classList.add('following')
            }
        }
        artistPage.followEvent()
    }
}



const feed = {
    requestingFeed: async (id)=>{
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
        feed.iframeActivate()
    },
    soundCloudEmbeds: ()=>{
        const allEmbeds = document.querySelectorAll('.putTheWidgetHere')
        if(allEmbeds.length===0)    return
        allEmbeds.forEach((embed,i)=>{
            const url = embed.getAttribute('data-url')
            SC.oEmbed(url, {
                element: document.querySelector(`.putTheWidgetHere#id${i}`)
            });
        })
    },
    iframeActivate: ()=>{
        instgrm.Embeds.process()
        feed.soundCloudEmbeds()
        twttr.widgets.load()
    }
}




// Prevent the user from clicking the link 2 times

window.addEventListener('load', ()=>init.firstEnter())