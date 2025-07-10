import axios from 'axios'
import apiConfig from 'src/@fake-db/api/api' // CommonJS export

const X_API_KEY = apiConfig.X_API_KEY

// Hàm lấy userId và userRole an toàn
const getUserInfo = () => {
  const userData = localStorage.getItem('userData')
  if (!userData) return { id: '', role: '' }
  try {
    const user = JSON.parse(userData)
    return { id: user.id || '', role: user.role || '' }
  } catch {
    return { id: '', role: '' }
  }
}
const getToken = () => localStorage.getItem('accessToken') || ''

const myAxios = axios.create({
  baseURL: 'http://localhost:3098/v1/api/', // Nếu muốn dùng mặc định
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
})

// Interceptor cho request
myAxios.interceptors.request.use(
  config => {
    config.headers['x-api-key'] = X_API_KEY

    const isAuthApi =
      config.url?.includes('/login') ||
      config.url?.includes('/register')

    if (!isAuthApi) {
      const { id: userId, role: userRole } = getUserInfo()
      config.headers['x-client-id'] = userId
      config.headers['authorization-v2'] = getToken()
      config.headers['userRole'] = userRole // Thêm userRole vào header cho mock API
      config.headers['userId'] = userId     // Thêm userId vào header cho mock API
    } else {
      delete config.headers['x-client-id']
      delete config.headers['authorization-v2']
      delete config.headers['userRole']
      delete config.headers['userId']
    }

    return config
  },
  error => Promise.reject(error)
)

export default myAxios
