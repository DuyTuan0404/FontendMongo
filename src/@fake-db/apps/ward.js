import mock from 'src/@fake-db/mock'
import axios from 'src/utils/myAxios'

mock.onGet('/apps/ward/list').reply(async config => {
  const { idDistrict } = config.params || {}
  const { data } = await axios.post('ward/all', { idDistrict })
  return [200, data]
})
