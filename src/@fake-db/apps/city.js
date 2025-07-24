// ** Mock
import mock from 'src/@fake-db/mock'
import axios from 'src/utils/myAxios'

mock.onGet('/apps/city/list').reply(async config => {


  const { data } = await axios.post('city/all')

  return [200, data]
})
