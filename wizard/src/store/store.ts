import { configureStore } from '@reduxjs/toolkit'
import additionalSidebarReducer from './slices/additional-sidebar-slice'
import authReducer from './slices/auth-slice'
import globalAlertReducer from './slices/global-alert'
import progressReducer from './slices/progress'
import sidebarReducer from './slices/sidebar'
import preferencesReducer from './slices/preferences'
import sharedReducer from './slices/shared'
import globalModalReducer from './slices/global-modal'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        additionalSidebar: additionalSidebarReducer,
        globalAlert: globalAlertReducer,
        progress: progressReducer,
        sidebar: sidebarReducer,
        preferences: preferencesReducer,
        shared: sharedReducer,
        globalModal: globalModalReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type StoreDispatch = typeof store.dispatch
