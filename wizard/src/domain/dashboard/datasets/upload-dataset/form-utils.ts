import { Data, ModelFile } from '@intermine/compose-rest-client'
import axios, { AxiosResponse } from 'axios'
import { Control, UseFormResetField } from 'react-hook-form'

import { dataApi } from '../../../../services/api'
import { ResponseStatus } from '../../../../shared/constants'
import {
    getResponseMessageUsingResponseStatus,
    getResponseStatus,
} from '../../../../utils/get'
import { getFileExt } from '../../utils/misc'

export type TUploadDatasetFormFields = {
    name: string
    description: string
    file: File
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

export const defaultUploadDatasetFormFields: Partial<TUploadDatasetFormFields> =
    {
        name: '',
        description: '',
        fasta: defaultFastaAnswers,
        gff: defaultGffAnswers,
        tsvOrCsv: defaultTsvOrCsvAnswers,
    }

type TServerResponse = {
    msg?: string
    items: {
        data_list?: Array<Data>
        file_list?: Array<ModelFile>
    }
}

type DatasetUploadSuccessfulResponse = AxiosResponse<TServerResponse>

export const onUploadDatasetFormSubmit = async (
    data: TUploadDatasetFormFields & { file: File }
): Promise<{
    fileList?: Array<ModelFile>
    dataList?: Array<Data>
    status: ResponseStatus
    message: string
}> => {
    const { name, file } = data

    try {
        const response = (await dataApi.dataPost({
            data_list: [
                {
                    ext: getFileExt(file),
                    file_type: file.type ? file.type : getFileExt(file),
                    name,
                },
            ],
        })) as DatasetUploadSuccessfulResponse

        const { file_list, data_list } = response.data.items

        return {
            fileList: file_list,
            dataList: data_list,
            status: getResponseStatus(response),
            message: getResponseMessageUsingResponseStatus(
                response,
                getResponseStatus(response)
            ),
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return {
                status: getResponseStatus(error.response),
                message: getResponseMessageUsingResponseStatus(
                    error.response,
                    getResponseStatus(error.response)
                ),
            }
        }

        return {
            status: getResponseStatus(error),
            message: getResponseMessageUsingResponseStatus({}, 500),
        }
    }
}
