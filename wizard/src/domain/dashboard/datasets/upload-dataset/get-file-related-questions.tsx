import { FileTypes } from '../../common/constants'
import { FastaQuestions } from './fasta-questions'
import {
    TUploadDatasetFormControl,
    TUploadDatasetFormResetFields
} from './form-utils'
import { GFFQuestions } from './gff-question'
import { TsvOrCsvQuestions } from './tsv-or-csv-questions'

type TGetFileRelatedQuestionsProps = {
    control: TUploadDatasetFormControl
    fileType: FileTypes
    resetFields: TUploadDatasetFormResetFields
}

const { Csv, Fasta, Gff, Tsv } = FileTypes

export const GetFileRelatedQuestions = (
    props: TGetFileRelatedQuestionsProps
) => {
    const { fileType, ...rest } = props

    switch (fileType) {
        case Fasta:
            return <FastaQuestions {...rest} />

        case Gff:
            return <GFFQuestions {...rest} />

        case Tsv:
        case Csv:
            return <TsvOrCsvQuestions {...rest} />

        default:
            return <></>
    }
}
