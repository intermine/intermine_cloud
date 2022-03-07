export type TSelectOption = {
    label: string
    value: string
}

export const subDomainNameValidator = (url?: string) => {
    if (!url) return 'Sub Domain name required'
    if (url.search(/^[\dA-Za-z][\d.A-Za-z-]+[\dA-Za-z]$/) !== 0) {
        return `Please enter a valid sub domain. Don't add special characters.`
    }

    return true
}

export const templateValidator = (_template: TSelectOption) => {
    if (_template === undefined) return 'Template is required'
    if (_template.label && _template.value) return true

    return 'Template is required'
}

export const datasetsValidator = (_datasets: TSelectOption[]) => {
    if (_datasets === undefined) return 'Dataset is required'
    return _datasets.length > 0
}
