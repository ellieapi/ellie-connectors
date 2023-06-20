import axios, { AxiosResponse } from 'axios'

/**
 * Connection settings for Ellie
 * @typedef {Object} EllieSettings
 * @property {string} organization - Organization short name slug (e.g., 'company' in https://company.ellie.ai).
 * @property {string} token - API token from the Ellie API Settings panel.
 * @property {string} api_version - Ellie API version (currently only 'v1' is available).
 */
interface EllieSettings {
    organization: string,
    api_version: string,
    token: string
}

let ellieSettings: EllieSettings | null = null

/**
 * Make a new connection to Ellie. The connection is kept up and commands can be sent.
 *
 * @param {EllieSettings} ellieSettings - The settings object containing the connection settings to Ellie.
 * @returns {void}
 */
export function ellieConnect(settings: EllieSettings): void {
    ellieSettings = settings
}

/**
 * Import a model exported from a database to Ellie.
 *
 * @param {string} modelName - Model name that will be used in Ellie when the new model is created.
 * @param {Object} modelData - Model data for creating the new model, in Ellie model format.
 * @returns {Object} Requests return object.
 */
export async function ellieModelImport(name: string, model: any): Promise<AxiosResponse> {
    if (!ellieSettings) {
        throw new Error('Please connect to Ellie before importing a model.')
    }
    
    model.model.name = name
    const url = `https://${ellieSettings.organization}.ellie.ai/api/${ellieSettings.api_version}/models?token=${ellieSettings.token}`
    return axios.post(url, model)
}

/**
 * Export a model from Ellie.
 *
 * @param {number} modelId - The ID of the model to be exported.
 * @returns {Object} Model data in Ellie data format.
 */
export async function ellieModelExport(modelId: number): Promise<AxiosResponse> {
    if (!ellieSettings) {
        throw new Error('Please connect to Ellie before exporting a model.')
    }
    
    const url = `https://${ellieSettings.organization}.ellie.ai/api/${ellieSettings.api_version}/models/${modelId}?token=${ellieSettings.token}`
    return axios.get(url)
}