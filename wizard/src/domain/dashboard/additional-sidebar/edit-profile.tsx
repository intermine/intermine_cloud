import { Button, Typography } from '@intermine/chromatin'
import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { nanoid } from 'nanoid'

import { FormGroup } from '../../../components/form'
import { userApi } from '../../../services/api'
import { getCurrentUserDetails } from '../../../services/utils'
import {
    AdditionalSidebarTabs,
    ResponseStatus
} from '../../../shared/constants'

// eslint-disable-next-line max-len
import {
    useStoreSelector,
    additionalSidebarSelector,
    useStoreDispatch,
    addGlobalAlert
} from '../../../store'
import { ActionSection } from './action-section'

type TUserDetails = {
    id: string
    email: string
    name: string
    organisation: string
}

const enum FetchingStatus {
    Fetching,
    Fetched,
    Failed
}

export const EditProfile = () => {
    const { activeTab } = useStoreSelector(additionalSidebarSelector)
    const storeDispatch = useStoreDispatch()

    const [loadingUserDetails, setLoadingUserDetails] =
        useState<FetchingStatus>(FetchingStatus.Fetching)

    const {
        control,
        getValues,
        handleSubmit,
        formState: { isDirty, isSubmitting },
        reset
    } = useForm<TUserDetails>()

    const fetchUserDetails = async () => {
        const user = await getCurrentUserDetails()

        if (user.status === ResponseStatus.Ok) {
            reset(user)
            setLoadingUserDetails(FetchingStatus.Fetched)
            return
        }

        setLoadingUserDetails(FetchingStatus.Failed)
    }

    const onSubmit = async (data: TUserDetails) => {
        try {
            await userApi.userPut([
                {
                    user_id: data.id,
                    name: data.name,
                    organisation: data.organisation
                }
            ])

            // Fetching user details again to update view.
            fetchUserDetails()

            storeDispatch(
                addGlobalAlert({
                    id: nanoid(),
                    isOpen: true,
                    message: 'Profile updated successfully',
                    type: 'success'
                })
            )
        } catch {
            storeDispatch(
                addGlobalAlert({
                    id: nanoid(),
                    isOpen: true,
                    message: 'Failed to updated profile. Please try again',
                    type: 'error'
                })
            )
        }
    }

    useEffect(() => {
        if (activeTab === AdditionalSidebarTabs.EditProfileTab) {
            fetchUserDetails()
        }
    }, [activeTab])

    return (
        <ActionSection
            heading="Edit Profile"
            isActive={activeTab === AdditionalSidebarTabs.EditProfileTab}
        >
            {loadingUserDetails === FetchingStatus.Fetching && (
                <Typography color="neutral.30">Loading...</Typography>
            )}
            {loadingUserDetails === FetchingStatus.Failed && (
                <Typography color="neutral.30">
                    Failed to load user profile
                </Typography>
            )}
            {loadingUserDetails === FetchingStatus.Fetched && (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FormGroup
                        label="Email"
                        inputProps={{
                            value: getValues('email'),
                            isDisabled: true
                        }}
                    />
                    <Controller
                        render={({ field }) => (
                            <FormGroup
                                label="Name"
                                inputProps={{
                                    ...field
                                }}
                            />
                        )}
                        control={control}
                        name="name"
                    />

                    <Controller
                        render={({ field }) => (
                            <FormGroup
                                label="Organisation"
                                inputProps={{
                                    ...field
                                }}
                            />
                        )}
                        control={control}
                        name="organisation"
                    />
                    <Button
                        type="submit"
                        color="primary"
                        size="small"
                        isDisabled={!isDirty}
                        isLoading={isSubmitting}
                    >
                        Save changes
                    </Button>
                </form>
            )}
        </ActionSection>
    )
}
