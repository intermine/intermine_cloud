import { List, ListItem } from '@intermine/chromatin'
import { ActionSection } from './action-section'

export const Progress = () => {
    return (
        <ActionSection heading="Progress">
            <List
                listItemProps={{
                    isButtonLike: true,
                    csx: { root: { padding: '0.5rem 0.5rem' } }
                }}
            >
                <ListItem>Progress 1</ListItem>
                <ListItem>Progress 2</ListItem>
                <ListItem>Progress 3</ListItem>
            </List>
        </ActionSection>
    )
}
