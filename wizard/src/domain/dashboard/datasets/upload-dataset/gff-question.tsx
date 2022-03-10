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
            <DForm.Heading>
                We have some question related to the file you have selected.
            </DForm.Heading>
            <DForm.Label main="What is the NCBI taxonomy ID">
                <Controller
                    render={({ field }) => (
                        <DForm.Input {...field} placeholder="Taxonomy ID" />
                    )}
                    control={control}
                    name="gff.taxonId"
                />
            </DForm.Label>
            <DForm.Label main="Name of data source">
                <Controller
                    render={({ field }) => (
                        <DForm.Input
                            {...field}
                            placeholder="Name of data source"
                        />
                    )}
                    control={control}
                    name="gff.dataSourceName"
                />
            </DForm.Label>
            <DForm.Label
                main="What type of sequence features are in this file"
                sub="It can be 'Gene' or 'Chromosome' or ..."
            >
                <Controller
                    render={({ field }) => (
                        <DForm.Input
                            {...field}
                            placeholder="Sequence features"
                        />
                    )}
                    control={control}
                    name="gff.seqClsName"
                />
            </DForm.Label>
        </>
    )
}
