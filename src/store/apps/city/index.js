import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchCities = createAsyncThunk('appCity/fetchCities', async () => {
  const response = await axios.get('/apps/city/list')
  return response.data
})

const appCitySlice = createSlice({
  name: 'appCity',
  initialState: { data: [], loading: false },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchCities.pending, state => { state.loading = true })
    builder.addCase(fetchCities.fulfilled, (state, action) => {
      state.data = action.payload
      state.loading = false
    })
    builder.addCase(fetchCities.rejected, state => { state.loading = false })
  }
})

export default appCitySlice.reducer
