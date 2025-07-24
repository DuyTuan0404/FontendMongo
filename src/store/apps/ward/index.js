import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchWards = createAsyncThunk('appWard/fetchWards', async (idDistrict) => {
  const response = await axios.get('/apps/ward/list', {
    params: { idDistrict }
  })
  return response.data
})

const appWardSlice = createSlice({
  name: 'appWard',
  initialState: { data: [], loading: false },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchWards.pending, state => { state.loading = true })
    builder.addCase(fetchWards.fulfilled, (state, action) => {
      state.data = action.payload
      state.loading = false
    })
    builder.addCase(fetchWards.rejected, state => { state.loading = false })
  }
})

export default appWardSlice.reducer
