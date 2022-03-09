import { Modal } from '../../../../components/modal'

type TFileChangeWarningModalProps = {
    onClose: () => void
    isOpen: boolean
    primaryAction: () => void
}

export const FileChangeWarningModal = (props: TFileChangeWarningModalProps) => {
    const { isOpen, onClose, primaryAction } = props

    return (
        <Modal
            isOpen={isOpen}
            type="warning"
            heading="Are you sure?"
            primaryAction={{ children: 'Proceed', onClick: primaryAction }}
            secondaryAction={{ children: 'Cancel', onClick: onClose }}
            onClose={onClose}
        >
            You have answered some questions related to current file. If you
            change file whose file type is different to current file then you'll
            lose all the answers you have added.
        </Modal>
    )
}
