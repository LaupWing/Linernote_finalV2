function event(){
    console.log('start')
    document.querySelector('.filter-btn').addEventListener('click', showFilters)
}

function showFilters(){
    if(this.classList.contains('open')){
        // Closes filter screen
        checkFilters()
        btnEvents('remove')
        document.querySelector('.filter-screen').classList.remove('reveal')
        this.classList.remove('open')
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
    const valueOrder = document.querySelector('input[name="order"]:checked').value
    const keywords = Array.from(document.querySelectorAll('.keywords button'))
        .filter(btn=>btn.classList.contains('active'))
        .map(btn=>btn.textContent)
    const config = {
        valueBy,
        valueOrder,
        keywords
    }
    return config
}

function adjustContent(){
    const config = checkFilters()

}

export {event}