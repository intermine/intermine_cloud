import { ModelFile } from '@intermine/compose-rest-client'

import { fileApi } from '../../../services/api'
import { FileTypes } from '../common/constants'

const { Csv, Fasta, Gff, Tar, Tsv, Unknown, Zip } = FileTypes

export const handleOnBeforeUnload = (event: Event) => {
    event.preventDefault()

    // @ts-expect-error Chrome requires returnValue to be set
    event.returnValue = ''

    return 'Are you sure? Some file(s) are still uploading.'
}

export type TFileIds = Record<'file_id', string>

export const extractAllFileIdsObjFromList = (list: TFileIds[]): TFileIds[] => {
    const fileIds: Record<'file_id', string>[] = []

    for (const data of list) {
        if (data.file_id) {
            fileIds.push({
                file_id: data.file_id,
            })
        }
    }
    return fileIds
}

/**
 * @summary
 *
 * Make sure to wrap this component in try catch block.
 * No error catching is here.
 */
export const fetchAllFileUsingFileIds = async (
    fileIds: TFileIds[]
): Promise<Record<string, ModelFile>> => {
    const res = await fileApi.filePut({
        // @ts-expect-error This will be fixed when we use fileApi.fileGet
        file_list: fileIds,
    })

    const { file_list: fileList } = res.data.items

    const fileListObj: Record<string, ModelFile> = {}

    for (const file of fileList) {
        fileListObj[file.file_id] = file
    }

    return fileListObj
}

export const getFileExt = (file: File): string => {
    return file.name.slice(file.name.lastIndexOf('.') + 1, file.name.length)
}

export const getFileTypeUsingExt = (ext: string): FileTypes => {
    switch (ext) {
        case 'fasta':
            return Fasta
        case 'gff':
            return Gff
        case 'csv':
            return Csv
        case 'tsv':
            return Tsv
        case 'tar':
            return Tar
        case 'zip':
            return Zip
        default:
            return Unknown
    }
}

export const getFileType = (file: File): FileTypes => {
    const ext = getFileExt(file).toLowerCase()
    return getFileTypeUsingExt(ext)
}

type TAreFileTypeSameOption = {
    firstFileType: FileTypes
    secondFileType: FileTypes
}

export const areFileTypeSame = (option: TAreFileTypeSameOption) => {
    const { firstFileType, secondFileType } = option

    if (firstFileType === secondFileType) return false

    /**
     * Question for csv and tsv are same. So we can
     * consider csv and tsv as same file.
     */
    if (
        (firstFileType === Csv || firstFileType === Tsv) &&
        (secondFileType === Csv || secondFileType === Tsv)
    ) {
        return false
    }

    return true
}
