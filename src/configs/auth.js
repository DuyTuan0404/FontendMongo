export default {
  meEndpoint: '/auth/me',
  loginEndpoint: '/jwt/login',
  logoutEndpoint: '/jwt/logout',
  registerEndpoint: '/jwt/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken' // logout | refreshToken
}
