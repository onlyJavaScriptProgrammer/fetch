import fetch from 'node-fetch'
import { writeFile } from 'fs'
import config from './config.js'

const isSuccsessfullyUsers = async (data, response) => {
  let users = []
  if(data.status === 200) {
    let parsedResult = await data.json()
    parsedResult.forEach((item) => {
      const { id, name, email, website } = item
      const { street, suite, city } = item.address
      const nameCompany = Object.values(item.company)
      const obj = {
        id: id,
        name: name,
        email: email,
        address: `${city}, ${street}, ${suite}`,
        website: 'https://' + website,
        company: nameCompany[0],
        posts: []
      }
      users.push(obj)
    })
    return users
  } else {
    response.send(`Ошибка: ${data.status}`)
  }
}

const isSuccsessfullyPosts = async (data, response) => {
  let posts = []
  if(data.status === 200) {
    let parsedResult = await data.json()
    parsedResult.forEach((item) => {
      const { userId, id, title, body } = item
      let title_crop = title
      if(title.length > 20) {
        title_crop = title.substr(0, 20) + '...'
      }
      const obj = {
        userId: userId,
        id: id,
        title: title,
        title_crop: title_crop,
        body: body,
        comments: []
      }
      posts.push(obj)
    })
    return posts
  } else {
    response.send(`Ошибка: ${data.status}`)
  }
}

const findUsersPosts = (users, userId) => {
  let postsId = []
  let filtredDataUsers = users.filter(user => user.id === userId)
  filtredDataUsers.forEach(filtredUser => {
    const id = filtredUser.posts.map(post => post.id)
    postsId = [...id]
  })
  return postsId
}

class Controller {

  async getData(req, res) {
    try {
      let result = await fetch(config.urlUsers)
      let resultPosts = await fetch(config.urlPosts)
      const dataUsers = await isSuccsessfullyUsers(result, res)
      const dataPosts = await isSuccsessfullyPosts(resultPosts, res)
      dataUsers.forEach(user => {
        dataPosts.forEach(post => {
          if(user.id == post.userId) {
            delete(post.userId)
            user.posts.push(post)
          }
        })
      })
      const idPosts = findUsersPosts(dataUsers, 2)
      for(let idPost of idPosts) {
        let resultComments = await fetch(`https://jsonplaceholder.typicode.com/posts/${idPost}/comments`)
        let parsedResultComments = await resultComments.json()
        dataUsers.forEach(user => {
          user.posts.forEach(post => {
            if(post.id == idPost) {
              parsedResultComments.forEach(comment => {
                post.comments.push(comment)
              })
            }
          })
        })
      }
      const data = JSON.stringify(dataUsers)
      writeFile('src/data/data.json', data, (err) => {
        if(err) {
          console.log(err)
        } else {
          console.log('Запись данных в файл прошла успешно')
        }
      })
      res.send('Данные о пользователях получены, загляни в data :)')
    } catch (error) {
      console.log(error)
    }
  }
}

export default new Controller()