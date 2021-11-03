import { useState } from 'react'
import { Collapsible } from '@intermine/chromatin/collapsible'
import { Box } from '@intermine/chromatin/box'
import { IconButton } from '@intermine/chromatin/icon-button'
import UpIcon from '@intermine/chromatin/icons/System/arrow-up-s-line'

export const Progress = () => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <Box>
            <Box
                csx={{
                    root: {
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0 3rem',
                        transform: 'translateY(0.25rem)'
                    }
                }}
            >
                Progress
                <IconButton
                    Icon={<UpIcon />}
                    onClick={() => setIsOpen(!isOpen)}
                    hasHighlightOnFocus={false}
                    csx={{
                        root: {
                            transition: '0.3s',
                            transform: isOpen
                                ? 'rotate(180deg)'
                                : 'rotate(180deg)(0deg)'
                        }
                    }}
                />
            </Box>
            <Collapsible in={isOpen}>
                <Box
                    csx={{
                        root: {
                            maxHeight: '20rem',
                            overflow: 'auto',
                            padding: '3rem'
                        }
                    }}
                >
                    <Box csx={{ root: { height: '40rem' } }}>
                        Content of progress
                    </Box>
                </Box>
            </Collapsible>
        </Box>
    )
}
