// ** Mock
import mock from 'src/@fake-db/mock'
import axios from 'src/utils/myAxios'

mock.onGet('/apps/district/list').reply(async config => {
  const { cityId } = config.params || {}
  const { data } = await axios.post('district/all', { cityId })
  return [200, data]
})
