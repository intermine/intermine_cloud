export const getFileFromOnChangeEvent = (
    event: React.FormEvent<HTMLInputElement>
): File | undefined => {
    try {
        const files = event.currentTarget.files
        if (files && files.length > 0) {
            return files[0]
        }
    } catch (error) {
        console.error(error)
    }
}

export const getFileOnDropEvent = (
    event: React.DragEvent
): File | undefined => {
    try {
        const files = event.dataTransfer.files
        if (files) {
            return files[0]
        }
    } catch (error) {
        console.error(error)
    }
}
