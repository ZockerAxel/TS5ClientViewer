//@ts-check
import { TSRemoteAppWrapper } from "../libs/ts5-remote-apps-wrapper.min.js";

export class Handler {
    #apiKey;
    #api;
    
    /**
     * Creates a new Handler
     * 
     * @param {string | null} apiKey The TS API Key, use null to generate a new one
     */
    constructor(apiKey) {
        this.#apiKey = apiKey;
    }
    
    async connect() {
        if(this.#apiKey == null) return await this.#connectWithoutAPIKey();
        else return await this.#connectWithAPIKey();
    }
    
    /**
     * 
     * @returns {Promise<string>} The promise for the API Key
     */
    async #connectWithoutAPIKey() {
        /**@type {(value: any) => void} */
        let resolveFunction;
        /**@type {(value: any) => void} */
        let rejectFunction;
        const promise = new Promise(function(resolve, reject) {
            resolveFunction = resolve;
            rejectFunction = reject;
        });
        
        this.#api = new TSRemoteAppWrapper.TSAPIWrapper();
        
        this.#api.on("apiReady", function(/** @type {{ payload: { apiKey: string; }; }} */ data) {
            resolveFunction(data.payload.apiKey);
        });
        
        this.#api.on("apiError", function(data) {
            rejectFunction(data.exception.message);
        });
        
        return promise;
    }
    
    async #connectWithAPIKey() {
        /**@type {(value: any) => void} */
        let resolveFunction;
        /**@type {(value: any) => void} */
        let rejectFunction;
        const promise = new Promise(function(resolve, reject) {
            resolveFunction = resolve;
            rejectFunction = reject;
        });
        
        const apiKey = this.#apiKey;
        this.#api = new TSRemoteAppWrapper.TSAPIWrapper({
            api: {
                key: this.#apiKey,
            },
        });
        
        this.#api.on("apiReady", function(/** @type {{ payload: { apiKey: string; }; }} */ data) {
            resolveFunction(data.payload.apiKey);
        });
        
        this.#api.on("apiError", function(data) {
            rejectFunction(data.exception.message);
        });
        
        return promise;
    }
}