import axios from 'axios';
let ellieSettings = null;
export function ellieConnect(settings) {
    ellieSettings = settings;
}
export async function ellieModelImport(name, model) {
    if (!ellieSettings) {
        throw new Error('Please connect to Ellie before importing a model.');
    }
    model.model.name = name;
    const url = `https://${ellieSettings.organization}.ellie.ai/api/${ellieSettings.api_version}/models?token=${ellieSettings.token}`;
    return axios.post(url, model);
}
export async function ellieModelExport(modelId) {
    if (!ellieSettings) {
        throw new Error('Please connect to Ellie before exporting a model.');
    }
    const url = `https://${ellieSettings.organization}.ellie.ai/api/${ellieSettings.api_version}/models/${modelId}?token=${ellieSettings.token}`;
    return axios.get(url);
}
