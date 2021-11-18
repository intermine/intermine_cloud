import { useHistory } from 'react-router-dom'

import { WorkspaceHeading } from '../../common/workspace-heading'

type TUploadPageHeadingProps = {
    prevPageUrl: string
    heading: string
}

export const UploadPageHeading = (props: TUploadPageHeadingProps) => {
    const history = useHistory()

    const { prevPageUrl, heading } = props

    return (
        <WorkspaceHeading
            heading={{ variant: 'h2', children: heading }}
            backAction={{
                onClick: () => {
                    history.push(prevPageUrl)
                }
            }}
        />
    )
}
