import { Modal } from '../../../components/modal'
import UploadIcon from '@intermine/chromatin/icons/System/upload-line'

export const UploadModal = () => {
    return (
        <Modal
            isOpen={true}
            type="success"
            HeaderIcon={UploadIcon}
            onClose={() => {}}
        ></Modal>
    )
}
