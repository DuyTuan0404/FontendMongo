import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

// ** Fetch Customers
export const fetchData = createAsyncThunk('appCustomers/fetchData', async params => {
  const response = await axios.get('/apps/customers/list', {
    params
  })

  return response.data
})

// ** Add Customer
export const addCustomer = createAsyncThunk('appCustomers/addCustomer', async (data, { getState, dispatch }) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })

  const response = await axios.post('/apps/customers/add-customer', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  dispatch(fetchData(getState().customer.params))
  return response.data
})

// ** Delete Customer
export const deleteCustomer = createAsyncThunk('appCustomers/deleteCustomer', async (data, { getState, dispatch }) => {
  const response = await axios.delete('/apps/customers/delete', {
    data
  })
  dispatch(fetchData(getState().customer.params))

  return response.data
})

export const appCustomersSlice = createSlice({
  name: 'appCustomers',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: []
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.data = action.payload.customers
      state.total = action.payload.total
      state.params = action.payload.params
      state.allData = action.payload.allData
    })
  }
})

export default appCustomersSlice.reducer