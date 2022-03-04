import { Modal } from '../modal'

import {
    useStoreDispatch,
    useStoreSelector,
    globalModalSelector,
    closeGlobalModal
} from '../../store'

export const GlobalModal = () => {
    const storeDispatch = useStoreDispatch()
    const state = useStoreSelector(globalModalSelector)

    return (
        <Modal {...state} onClose={() => storeDispatch(closeGlobalModal())} />
    )
}
