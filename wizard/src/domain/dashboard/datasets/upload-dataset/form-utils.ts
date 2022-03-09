import { Control, UseFormResetField } from 'react-hook-form'

export type TUploadDatasetFormFields = {
    name: string
    description: string

    fasta?: {
        taxonId: string
        dataSourceName: string
        className: string
        classAttributes: string
        includes: string
    }

    gff?: {
        taxonId: string
        dataSourceName: string
        seqClsName: string
    }

    tsvOrCsv?: {
        dataSourceName: string
        hasHeader: boolean
    }
}

export type TUploadDatasetFormControl = Control<TUploadDatasetFormFields>
export type TUploadDatasetFormResetFields =
    UseFormResetField<TUploadDatasetFormFields>

export const defaultFastaAnswers: TUploadDatasetFormFields['fasta'] = {
    classAttributes: 'Gene',
    className: '',
    dataSourceName: '',
    includes: '',
    taxonId: '',
}

export const defaultGffAnswers: TUploadDatasetFormFields['gff'] = {
    dataSourceName: '',
    taxonId: '',
    seqClsName: 'Chromosome',
}

export const defaultTsvOrCsvAnswers: TUploadDatasetFormFields['tsvOrCsv'] = {
    dataSourceName: '',
    hasHeader: false,
}

export const defaultUploadDatasetFormFields: TUploadDatasetFormFields = {
    name: '',
    description: '',
    fasta: defaultFastaAnswers,
    gff: defaultGffAnswers,
    tsvOrCsv: defaultTsvOrCsvAnswers,
}
