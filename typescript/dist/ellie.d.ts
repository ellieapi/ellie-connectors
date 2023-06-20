import { AxiosResponse } from 'axios';
interface EllieSettings {
    organization: string;
    api_version: string;
    token: string;
}
export declare function ellieConnect(settings: EllieSettings): void;
export declare function ellieModelImport(name: string, model: any): Promise<AxiosResponse>;
export declare function ellieModelExport(modelId: number): Promise<AxiosResponse>;
export {};
