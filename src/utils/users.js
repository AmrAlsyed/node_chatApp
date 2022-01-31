const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id,username,room}) => {
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    //Check for existing user in the room

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username // if both these are true it will return that user to existingUser variable, meaning there's already a user in that room with the same username
    })

    //Validate username
    if(existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user 
    const user = {id, username, room}

    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user) =>  user.id === id) //findIndex returns the position of the item in the array instead of the name of the item

    if(index !== -1) {
        return users.splice(index, 1)[0] //we use splice to remove an item from an array, index is the position of the item we want to remove, 1 is the number of items we want to remove, in this case 1, that will return an array with the removed item, use [0] to extract that and return it
    }
}


const getUser = (id) => {
    return users.find((user) => user.id === id)
  }

  const getUsersInRoom = (room) => {
      return users.filter((user) => user.room === room)
  }


  module.exports = {
      addUser,
      removeUser,
      getUser,
      getUsersInRoom
  }