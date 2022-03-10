import { FormControlLabel } from '@intermine/chromatin/form-control-label'
import { Checkbox } from '@intermine/chromatin/checkbox'
import { useEffect } from 'react'
import { Controller } from 'react-hook-form'

import { DashboardForm as DForm } from '../../common/dashboard-form'
import {
    TUploadDatasetFormControl,
    TUploadDatasetFormResetFields
} from './form-utils'

type TTsvOrCsvQuestionProps = {
    control: TUploadDatasetFormControl
    resetFields: TUploadDatasetFormResetFields
}

export const TsvOrCsvQuestions = (props: TTsvOrCsvQuestionProps) => {
    const { control, resetFields } = props

    useEffect(() => {
        return () => {
            resetFields('tsvOrCsv')
        }
    }, [])

    return (
        <>
            <DForm.Heading>
                We have some question related to the file you have selected.
            </DForm.Heading>

            <DForm.Label main="Name of data source">
                <Controller
                    render={({ field }) => (
                        <DForm.Input
                            {...field}
                            placeholder="Name of data source"
                        />
                    )}
                    control={control}
                    name="tsvOrCsv.dataSourceName"
                />
            </DForm.Label>
            <Controller
                render={({ field: { value, ...rest } }) => (
                    <FormControlLabel
                        csx={{
                            root: ({ spacing }) => ({
                                marginBottom: spacing(8)
                            })
                        }}
                        label="Does it have a header?"
                        control={<Checkbox {...rest} isChecked={value} />}
                    />
                )}
                control={control}
                name="tsvOrCsv.hasHeader"
            />
        </>
    )
}
