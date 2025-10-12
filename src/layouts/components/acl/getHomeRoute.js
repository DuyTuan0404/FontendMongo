/**
 *  Set Home URL based on User Roles
 */
const getHomeRoute = role => {
  if (role === 'customer ') return '/acl'
  else return '/apps/user/list'
}

export default getHomeRoute
