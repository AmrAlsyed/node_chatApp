const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocaitonButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const mapurlTemplate = document.querySelector('#mapurl-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    //  New message element (we grab the new message)
    const $newMessage = $messages.lastElementChild

    // Height of the new message (we get the margin value)
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)

    //we add the margin to the height of the new message, resulting in us getting the total height of the message
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height of the chat container
    const visibleHeight = $messages.offsetHeight

    //Total height of the messages container, which includes the visible height and all the height that is scrollable
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled? - scrolltop: gives us the amount of distance we scrolled from the top
    const scrollOffset = $messages.scrollTop + visibleHeight

    // here we make sure we were scrolled to the bottom before the last message was added
    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (locationObject) => {
    console.log(locationObject)
    const html = Mustache.render(mapurlTemplate, {
        username: locationObject.username,
        url: locationObject.url,
        createdAt: moment(locationObject.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

} )

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //disable form button while message is being sent
    $messageFormButton.setAttribute('disabled', 'disabled')


    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        //enable form button after aknowledgement callback returns from the server, then clear the form input
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
     if(error) {
         return console.log(error)
     }

     console.log('Message delivered!')
    })
})

$sendLocaitonButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    //disable while being sent to the server
    $sendLocaitonButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const {latitude, longitude} = position.coords

        socket.emit('sendLocation', latitude, longitude , () => {
            $sendLocaitonButton.removeAttribute('disabled')

            console.log('Location shared!')
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})