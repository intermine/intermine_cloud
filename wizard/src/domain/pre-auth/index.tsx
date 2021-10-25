import { useContext } from 'react'
import { AuthStates } from '../../constants/auth'
import { AppContext } from '../../context'

const PreAuth = () => {
    const store = useContext(AppContext)
    const { updateAuthState } = store.authReducer

    return (
        <div>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <p>Pre Auth Page</p>

            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <p>Pre Auth Page</p>
            <button onClick={() => updateAuthState(AuthStates.Authorize)}>
                Login
            </button>
        </div>
    )
}

export default PreAuth
