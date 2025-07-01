/**
 *  Set Home URL based on User Roles
 */
const getHomeRoute = role => {
  if (role === 'employee') return '/acl'
  else return '/dashboards/analytics'
}

export default getHomeRoute
