export const scrollIntoView = (id: string) => {
    const element = document.querySelector('#' + id)
    if (element) {
        element.scrollIntoView()
    }
}

export const scrollToTop = (id: string) => {
    const element = document.querySelector('#' + id)
    if (element) {
        element.scrollTo(0, 0)
    }
}
