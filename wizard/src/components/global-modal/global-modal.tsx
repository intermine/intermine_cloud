import { Modal } from '../modal'

import { useGlobalModalReducer } from '../../context'

export const GlobalModal = () => {
    const globalModalReducer = useGlobalModalReducer()
    const { state, closeGlobalModal } = globalModalReducer

    return <Modal {...state} onClose={closeGlobalModal} />
}
