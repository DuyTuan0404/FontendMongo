// ** JWT import
import jwt from 'jsonwebtoken'
import { X_API_KEY, API_BACKEND } from 'src/@fake-db/api/api'
import axios from 'src/utils/myAxios'

// ** Mock Adapter
import mock from 'src/@fake-db/mock'

// ** Default AuthConfig
import defaultAuthConfig from 'src/configs/auth'

const users = [
  {
    id: 1,
    role: 'admin',
    password: 'admin',
    fullName: 'John Doe',
    username: 'johndoe',
    email: 'tvdt04042001@gmail.com'
  },
  {
    id: 2,
    role: 'client',
    password: 'client',
    fullName: 'Jane Doe',
    username: 'janedoe',
    email: 'client@vuexy.com'
  }
]

// ! These two secrets should be in .env file and not in any other file
const jwtConfig = {
  secret: process.env.NEXT_PUBLIC_JWT_SECRET,
  expirationTime: process.env.NEXT_PUBLIC_JWT_EXPIRATION,
  refreshTokenSecret: process.env.NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET
}
mock.onPost('/jwt/login').reply(async request => {
  const { email, password } = JSON.parse(request.data)

  let error = {
    email: ['Có gì đó đã sai']
  }

  try {
    const { data: user } = await axios.post(`auth/signin`, { email, password })
    console.log('user:: ', user);

    if (user.data) {
      const accessToken = user.data.tokens.accessToken
      const refreshToken = user.data.tokens.refreshToken
      console.log('user.data:: ', user.data.user);

      const response = {
        accessToken,
        refreshToken,
        userData: { ...user.data.user }
      }

      return [200, response]
    } else {
      error = {
        email: [user.error.message]
      }

      return [400, { error }]
    }
  } catch (err) {
    return [400, { error }]
  }
})
mock.onPost('/jwt/register').reply(request => {
  if (request.data.length > 0) {
    const { email, password, username } = JSON.parse(request.data)
    const isEmailAlreadyInUse = users.find(user => user.email === email)
    const isUsernameAlreadyInUse = users.find(user => user.username === username)

    const error = {
      email: isEmailAlreadyInUse ? 'This email is already in use.' : null,
      username: isUsernameAlreadyInUse ? 'This username is already in use.' : null
    }
    if (!error.username && !error.email) {
      const { length } = users
      let lastIndex = 0
      if (length) {
        lastIndex = users[length - 1].id
      }

      const userData = {
        id: lastIndex + 1,
        email,
        password,
        username,
        avatar: null,
        fullName: '',
        role: 'admin'
      }
      users.push(userData)
      const accessToken = jwt.sign({ id: userData.id }, jwtConfig.secret)
      const user = { ...userData }
      delete user.password
      const response = { accessToken }

      return [200, response]
    }

    return [200, { error }]
  } else {
    return [401, { error: 'Invalid Data' }]
  }
})
mock.onGet('/auth/me').reply(async config => {
  // ** Get token from header
  // @ts-ignore
  const token = config.headers.Authorization
  const user_id = config.headers.userId

  // ** Default response
  let response = [200, {}]

  try {
    const user = await axios.get(`user/me`)
    console.log(user);

    if (user.data) {
      window.localStorage.setItem(defaultAuthConfig.storageTokenKeyName, token)
      response = [200, { userData: { ...user.data, role: 'admin' } }]
    } else {
      response = [401, { error: { error: 'Invalid User' } }]
    }
    return response
  } catch (err) {
    response = [401, { error: { error: 'Invalid User' } }]
    return response
  }
})

mock.onGet('/jwt/logout').reply(async config => {
  const token = config.headers.Authorization
  const user_id = config.headers.userId

  try {
    const { data: user } = await axios.get(`${API_BACKEND}auth/logout`, {
      headers: {
        'x-client-id': user_id,
        'authorization-v2': token
      }
    })
    return [200, user]
  } catch (err) {
    return [200, { error: 'Logout failed' }]
  }
})
