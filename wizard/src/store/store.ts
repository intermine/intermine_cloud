import { configureStore } from '@reduxjs/toolkit'
import additionalSidebarSlice from './slices/additional-sidebar-slice'
import authSlice from './slices/auth-slice'

export const store = configureStore({
    reducer: {
        auth: authSlice,
        additionalSidebar: additionalSidebarSlice,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type StoreDispatch = typeof store.dispatch
