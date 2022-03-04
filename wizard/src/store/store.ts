import { configureStore } from '@reduxjs/toolkit'
import additionalSidebarReducer from './slices/additional-sidebar-slice'
import authReducer from './slices/auth-slice'
import globalAlertReducer from './slices/global-alert'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        additionalSidebar: additionalSidebarReducer,
        globalAlert: globalAlertReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type StoreDispatch = typeof store.dispatch
