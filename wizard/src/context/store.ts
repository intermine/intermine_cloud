import { useContext } from 'react'
/* eslint-disable max-len */
import { useAdditionalSidebarReducer as _useAdditionalSidebarReducer } from './reducers/additional-sidebar-reducer'
import { useGlobalAlertReducer as _useGlobalAlertReducer } from './reducers/global-alert-reducer'
import { useGlobalModalReducer as _useGlobalModalReducer } from './reducers/global-modal-reducer'
import { usePreferencesReducer as _usePreferencesReducer } from './reducers/preferences-reducer'
import { useSidebarReducer as _useSidebarReducer } from './reducers/sidebar-reducer'
import { useProgressReducer as _useProgressReducer } from './reducers/progress-reducer'
import { useSharedReducer as _useSharedReducer } from './reducers/shared-reducer'
/* eslint-enable max-len */

import { AppContext } from './app-context'
import { TAppContext } from './types'

const store = () => useContext(AppContext)

export const useSidebarReducer = () => {
    return store().sidebarReducer
}

export const useGlobalAlertReducer = () => {
    return store().globalAlertReducer
}

export const useGlobalModalReducer = () => {
    return store().globalModalReducer
}

export const usePreferencesReducer = () => {
    return store().preferencesReducer
}

export const useAdditionalSidebarReducer = () => {
    return store().additionalSidebarReducer
}

export const useProgressReducer = () => {
    return store().progressReducer
}

export const useSharedReducer = () => {
    return store().sharedReducer
}

export const useStore = (): TAppContext => {
    return {
        preferencesReducer: _usePreferencesReducer(),
        sidebarReducer: _useSidebarReducer(),
        globalModalReducer: _useGlobalModalReducer(),
        additionalSidebarReducer: _useAdditionalSidebarReducer(),
        globalAlertReducer: _useGlobalAlertReducer(),
        progressReducer: _useProgressReducer(),
        sharedReducer: _useSharedReducer(),
    }
}
