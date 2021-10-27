import { Link } from 'react-router-dom'
import { CardContent } from '@intermine/chromatin/card-content'
import { CardAction } from '@intermine/chromatin/card-action'
import { CardHeader } from '@intermine/chromatin/card-header'
import { createStyle } from '@intermine/chromatin/styles'

export const Register = () => {
    return (
        <div>
            Register <Link to="/">Go to Login</Link>
        </div>
    )
}
