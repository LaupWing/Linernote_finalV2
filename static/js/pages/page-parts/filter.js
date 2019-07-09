let prevConfig = null
let allPosts = null
const iframeContainer = document.querySelector('#feed') || document.querySelector('#homeFeed') 
function event(){
    document.querySelector('.filter-btn').addEventListener('click', showFilters)
    prevConfig = checkFilters()
    allPosts = Array.from(iframeContainer.querySelectorAll('.iframe-wrapper'))
    console.log(prevConfig, allPosts)
}

function showFilters(){
    if(this.classList.contains('open')){
        // Closes filter screen
        checkFilters()
        btnEvents('remove')
        document.querySelector('.filter-screen').classList.remove('reveal')
        this.classList.remove('open')
        adjustContent()
        this.querySelector('img').src = '/img/filter.png'
    }else{
        document.querySelector('.filter-screen').classList.add('reveal')
        this.classList.add('open')
        this.querySelector('img').src = '/img/checkmark.png'
        btnEvents('add')
    }
}

function toggleBtn(){
    this.classList.toggle('active')
}

function btnEvents(state){
    document.querySelectorAll('.keywords button').forEach(btn=>{
        if(state === 'add') btn.addEventListener('click', toggleBtn)
        else                btn.removeEventListener('click', toggleBtn)
    })
}

function checkFilters(){
    const valueBy = document.querySelector('input[name="by"]:checked').value
    const keywords = Array.from(document.querySelectorAll('.keywords button'))
        .filter(btn=>btn.classList.contains('active'))
        .map(btn=>btn.textContent.toLocaleLowerCase())
    const config = {
        valueBy,
        keywords
    }
    return config
}


function adjustContent(){
    const config = checkFilters()
    let posts = null
    if(allPosts!==null){
        posts = allPosts 
    }else{
        posts = Array.from(iframeContainer.querySelectorAll('.iframe-wrapper'))
    }
    const filtered = posts.filter(post=>{
        for(let keyword of config.keywords){
            if(keyword.toLowerCase()===post.dataset.artist.toLowerCase()){
                console.log(post.dataset.artist)
                for(let keyword of config.keywords){
                    if(keyword===post.dataset.platform) return post
                }
            }
        }
    })
    if(config.valueBy === 'recent'){
        const sortedAndFilterd = filtered.sort((a,b)=>{
            if (a.dataset.timestamp > b.dataset.timestamp) {
                return -1;
            }
            if (a.dataset.timestamp < b.dataset.timestamp) {
                return 1;
            }
            // a must be equal to b
            return 0;
        })
        reRenderFeed(sortedAndFilterd)
    }else{
        const sortedAndFilterd = filtered.sort((a,b)=>{
            if (a.dataset.timestamp < b.dataset.timestamp) {
                return -1;
            }
            if (a.dataset.timestamp > b.dataset.timestamp) {
                return 1;
            }
            // a must be equal to b
            return 0;
        })
        reRenderFeed(sortedAndFilterd)
    }
}

function reRenderFeed(posts){
    removePosts()
    posts.forEach(post=>{
        console.log(post)
        iframeContainer.insertAdjacentElement('beforeend', post)
    })
}
function removePosts(){
    if(iframeContainer===null)    return
    while(iframeContainer.querySelector('.iframe-wrapper')){
        iframeContainer.removeChild(iframeContainer.querySelector('.iframe-wrapper'))
    }
}

export {event}