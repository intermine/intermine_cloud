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
            You have selected a file whose file type is different from the
            previous file. It means you'll lose all the information you have
            added.
        </Modal>
    )
}
