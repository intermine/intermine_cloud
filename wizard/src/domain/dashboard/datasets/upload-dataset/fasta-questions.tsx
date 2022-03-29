import { useEffect } from 'react'
import { Controller } from 'react-hook-form'

import { DashboardForm as DForm } from '../../common/dashboard-form'
import {
    TUploadDatasetFormControl,
    TUploadDatasetFormResetFields
} from './form-utils'

type TFastaQuestionProps = {
    control: TUploadDatasetFormControl
    resetFields: TUploadDatasetFormResetFields
    formState: {
        isSubmitting: boolean
    }
}

export const FastaQuestions = (props: TFastaQuestionProps) => {
    const {
        control,
        resetFields,
        formState: { isSubmitting }
    } = props

    useEffect(() => {
        return () => {
            resetFields('fasta')
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
                        <DForm.Input
                            {...field}
                            isDisabled={isSubmitting}
                            placeholder="Taxonomy ID"
                        />
                    )}
                    control={control}
                    name="fasta.taxonId"
                />
            </DForm.Label>
            <DForm.Label main="Name of data source">
                <Controller
                    render={({ field }) => (
                        <DForm.Input
                            {...field}
                            isDisabled={isSubmitting}
                            placeholder="Name of data source"
                        />
                    )}
                    control={control}
                    name="fasta.dataSourceName"
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
                            isDisabled={isSubmitting}
                            placeholder="Sequence features"
                        />
                    )}
                    control={control}
                    name="fasta.classAttributes"
                />
            </DForm.Label>
            <DForm.Label main="First item is a">
                <Controller
                    render={({ field }) => (
                        <DForm.Input {...field} isDisabled={isSubmitting} />
                    )}
                    control={control}
                    name="fasta.className"
                />
            </DForm.Label>
        </>
    )
}
