//@ts-check
export default class RemoteAppConnection {
    #config;
    
    /**
     * 
     * @param {{api: {host: string, port: number, key?: string}, app: {identifier: string, name: string, description: string, version: string}}} config 
     */
    constructor(config) {
        this.#config = config;
    }
}