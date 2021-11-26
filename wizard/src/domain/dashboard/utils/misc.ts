export const handleOnBeforeUnload = (event: Event) => {
    event.preventDefault()

    // @ts-expect-error Chrome requires returnValue to be set
    event.returnValue = ''

    return 'Are you sure? Some file(s) are still uploading.'
}
