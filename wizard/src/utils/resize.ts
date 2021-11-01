import { DomElementIDs } from '../constants/ids'

const { Navbar, WorkspaceContainer } = DomElementIDs

export const resizeWorkSpaceContainer = () => {
    const navbar = document.querySelector('#' + Navbar)
    const workspace: HTMLDivElement | null = document.querySelector(
        '#' + WorkspaceContainer
    )

    if (workspace) {
        let navbarHeight = 0
        if (navbar) {
            const { height } = navbar.getBoundingClientRect()
            navbarHeight = height
        }
        const { innerHeight: windowHeight } = window

        workspace.style.height = windowHeight - navbarHeight + 'px'
    }
}
