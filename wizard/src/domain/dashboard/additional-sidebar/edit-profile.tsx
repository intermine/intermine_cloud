import { Input, IconButton, Box, Label } from '@intermine/chromatin'
import CheckIcon from '@intermine/chromatin/icons/System/check-line'

import { ActionSection } from './action-section'

export const EditProfile = () => {
    return (
        <ActionSection heading="Edit Profile">
            <ActionSection.Content>
                <Box>
                    <Label>
                        Username
                        <Box display="flex">
                            <Input
                                color="neutral.30"
                                // csx={{ inputRoot: { borderRadius: 0 } }}
                                LeftIcon={<CheckIcon />}
                            />
                            {/* <IconButton
                                csx={{
                                    root: { borderRadius: '0', height: 'auto' }
                                }}
                                variant="normal"
                                color="primary"
                                Icon={<CheckIcon />}
                                isDense
                            /> */}
                        </Box>
                    </Label>
                </Box>
            </ActionSection.Content>
        </ActionSection>
    )
}
