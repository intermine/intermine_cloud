import { DomElementIDs } from '../constants/ids'

const { Navbar, WorkspaceContainer } = DomElementIDs

export const resizeWorkSpaceContainer = () => {
    const navbar = document.querySelector('#' + Navbar)
    const workspace: HTMLDivElement | null = document.querySelector(
        '#' + WorkspaceContainer
    )

    if (navbar && workspace) {
        const { height: navbarHeight } = navbar.getBoundingClientRect()
        const { innerHeight: windowHeight } = window

        workspace.style.height = windowHeight - navbarHeight + 'px'
    }
}
