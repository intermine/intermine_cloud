import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/auth-slice'

export const store = configureStore({
    reducer: {
        auth: authSlice,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type StoreDispatch = typeof store.dispatch
