// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'

// ** Defaults
const defaultProvider = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}
const AuthContext = createContext(defaultProvider)

const AuthProvider = ({ children }) => {
  // ** States
  const [user, setUser] = useState(defaultProvider.user)
  const [loading, setLoading] = useState(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
      const dataUserId = window.localStorage.getItem('userData')
      let userId = JSON.parse(dataUserId)

      if (storedToken) {
        setLoading(true)
        await axios
          .get(authConfig.meEndpoint, {
            headers: {
              Authorization: storedToken,
              userId: userId.id
            }
          })
          .then(async response => {
            setLoading(false)
            setUser({ ...response.data.userData })
          })
          // .catch(() => {
          //   localStorage.removeItem('userData')
          //   localStorage.removeItem('refreshToken')
          //   localStorage.removeItem('accessToken')
          //   setUser(null)
          //   setLoading(false)
          //   if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
          //     router.replace('/login')
          //   }
          // })
      } else {
        setLoading(false)
      }
    }
    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = (params, errorCallback) => {
    axios
      .post(authConfig.loginEndpoint, params)
      .then(async response => {
        params.rememberMe
          ? window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.accessToken)
          : null
        params.rememberMe ? window.localStorage.setItem(authConfig.onTokenExpiration, response.data.refreshToken) : null
        const returnUrl = router.query.returnUrl
        setUser({ ...response.data.userData })
        params.rememberMe ? window.localStorage.setItem('userData', JSON.stringify(response.data.userData)) : null
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        router.replace(redirectURL)
      })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = async () => {
    const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
    const dataUserId = window.localStorage.getItem('userData')
    let userId = JSON.parse(dataUserId)
    await axios
      .get(authConfig.logoutEndpoint, {
        headers: {
          Authorization: storedToken,
          userId: userId.id
        }
      })
      .then(async response => {
        setUser(null)
        window.localStorage.removeItem('userData')
        window.localStorage.removeItem(authConfig.storageTokenKeyName)
        window.localStorage.removeItem(authConfig.onTokenExpiration)
        router.push('/login')
      })
      .catch(() => {
        localStorage.removeItem('userData')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('accessToken')
        setUser(null)
        setLoading(false)
        if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
          router.replace('/login')
        }
      })
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
