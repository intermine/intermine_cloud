import {
    useStoreDispatch,
    updateAuthState,
    updateAdditionalSidebar,
    updateSharedState,
} from '../store'
import { AuthStates, AdditionalSidebarTabs } from '../shared/constants'

export const useAppReset = () => {
    const storeDispatch = useStoreDispatch()

    const resetApp = () => {
        // Resetting auth state
        storeDispatch(updateAuthState(AuthStates.NotAuthorize))

        // Resetting additional sidebar tab
        storeDispatch(
            updateAdditionalSidebar({
                isOpen: false,
                activeTab: AdditionalSidebarTabs.None,
            })
        )

        // Resetting shared state
        storeDispatch(
            updateSharedState({
                isEditingAnyForm: false,
                isUploadingAnyFile: false,
                cbIfEditingFormAndUserRequestLogout: () => false,
                cbIfUploadingFileAndUserRequestLogout: () => false,
            })
        )
    }

    return {
        resetApp,
    }
}
