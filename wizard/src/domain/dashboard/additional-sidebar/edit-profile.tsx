import { Input, IconButton, Box } from '@intermine/chromatin'
import CheckIcon from '@intermine/chromatin/icons/System/check-line'

import { ActionSection } from './action-section'

export const EditProfile = () => {
    return (
        <ActionSection heading="Edit Profile">
            <ActionSection.Content>
                <Box isContentCenter>
                    <Input RightIcon={<CheckIcon />} />
                    {/* <IconButton
                        csx={{ root: { borderRadius: '0' } }}
                        variant="normal"
                        color="neutral"
                        Icon={<CheckIcon />}
                    /> */}
                </Box>
            </ActionSection.Content>
        </ActionSection>
    )
}
