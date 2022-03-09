import { useEffect } from 'react'
import { Controller } from 'react-hook-form'

import { DashboardForm as DForm } from '../../common/dashboard-form'
import {
    TUploadDatasetFormControl,
    TUploadDatasetFormResetFields
} from './form-utils'

type TGFFQuestionProps = {
    control: TUploadDatasetFormControl
    resetFields: TUploadDatasetFormResetFields
}

export const GFFQuestions = (props: TGFFQuestionProps) => {
    const { control, resetFields } = props

    useEffect(() => {
        return () => {
            resetFields('gff')
        }
    }, [])
    return (
        <>
            {/* <DForm.Label
                main="Describe your Dataset"
                sub="This will help other users to get an idea about
                        this dataset. You can write something like: A dataset 
                        having information about..."
            >
                <Controller
                    render={({ field }) => (
                        <DForm.Input
                            {...field}
                            rows={5}
                            Component="textarea"
                            placeholder="Description of your dataset"
                        />
                    )}
                    control={control}
                    name="description"
                />
            </DForm.Label> */}
            <DForm.Label main="GFF question" />
        </>
    )
}
