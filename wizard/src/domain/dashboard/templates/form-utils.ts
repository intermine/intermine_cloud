import { Template, ModelFile } from '@intermine/compose-rest-client'
import axios, { AxiosResponse } from 'axios'

import { templateApi } from '../../../services/api'
import { ResponseStatus } from '../../../shared/constants'
import {
    getResponseMessageUsingResponseStatus,
    getResponseStatus,
} from '../../../utils/get'

export type TUploadTemplateFormFields = {
    name: string
    description: string
    file: File
}

// eslint-disable-next-line max-len
export const defaultUploadTemplateFormFields: Partial<TUploadTemplateFormFields> =
    {
        name: '',
        description: '',
        file: undefined,
    }

type TServerResponse = {
    msg?: string
    items: {
        template_list?: Array<Template>
        file_list?: Array<ModelFile>
    }
}

type TemplateUploadSuccessfulResponse = AxiosResponse<TServerResponse>

export const onUploadTemplateFormSubmit = async (
    template: TUploadTemplateFormFields & { file: File }
): Promise<{
    fileList?: Array<ModelFile>
    templateList?: Array<Template>
    status: ResponseStatus
    message: string
}> => {
    const { name, description } = template

    try {
        const response = (await templateApi.templatePost({
            template_list: [
                {
                    template_vars: [],
                    description,
                    name,
                },
            ],
        })) as TemplateUploadSuccessfulResponse

        const { file_list, template_list } = response.data.items

        return {
            fileList: file_list,
            templateList: template_list,
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
