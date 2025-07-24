import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchDistricts = createAsyncThunk('appDistrict/fetchDistricts', async (cityId) => {
  const response = await axios.get('/apps/district/list', {
    params: { cityId }
  })
  return response.data
})

const appDistrictSlice = createSlice({
  name: 'appDistrict',
  initialState: { data: [], loading: false },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchDistricts.pending, state => { state.loading = true })
    builder.addCase(fetchDistricts.fulfilled, (state, action) => {
      state.data = action.payload
      state.loading = false
    })
    builder.addCase(fetchDistricts.rejected, state => { state.loading = false })
  }
})

export default appDistrictSlice.reducer
