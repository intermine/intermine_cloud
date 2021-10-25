import { useContext } from 'react'

import { AuthStates } from '../../constants/auth'
import { AppContext } from '../../context'

const Dashboard = () => {
    const store = useContext(AppContext)
    const { updateAuthState } = store.authReducer

    return (
        <div>
            <p>Dashboard Page</p>
            <button onClick={() => updateAuthState(AuthStates.NotAuthorize)}>
                Logout
            </button>
        </div>
    )
}

export default Dashboard
