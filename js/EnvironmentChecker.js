//@ts-check
import { getParam, isParamSet } from "./UrlParamReader.js";

/**
 * @typedef EnvironmentType
 * @type {"browser" | "obs" | "standalone"}
 */


/**@type {EnvironmentType[]} */
const VALID_ENVIRONMENTS = ["browser", "obs", "standalone"];
const DEFAULT_ENVIRONMENT = VALID_ENVIRONMENTS[0];

/**
 * Gets the environment the page is being run in
 * 
 * @returns {EnvironmentType}
 */
export function getEnvironment() {
    if("obsstudio" in window) {
        return "obs";
    }
    
    if(isParamSet("display")) {
        return getEnvironmentByParam();
    }
    
    return DEFAULT_ENVIRONMENT;
}

/**
 * Gets the environment by the url param
 * 
 * @returns {EnvironmentType}
 */
function getEnvironmentByParam() {
    const environment = getParam("display");
    if(environment) {
        // @ts-ignore
        const index = VALID_ENVIRONMENTS.indexOf(environment);
        
        if(index !== -1) {
            return VALID_ENVIRONMENTS[index];
        }
    }
    
    return DEFAULT_ENVIRONMENT;
}

const LOCAL_HOSTS = [
    "localhost",
    "127.0.0.1",
];

/**
 * Gets whether the host is local
 * 
 * @returns {boolean} Whether the host is local 
 */
export function isLocal() {
    return LOCAL_HOSTS.indexOf(location.hostname) !== -1;
}

/**
 * Get the Api Key Local Storage Key
 * 
 * @param {EnvironmentType} environment The environment used
 * @param {string | undefined} customIdSuffix The Custom ID Suffix to use
 * @returns {string} The Storage Key
 */
export function getApiKeyLocalStorageKeyByEnvironment(environment, customIdSuffix) {
    if(environment === "browser") return "ts5viewer.apiKey";//Backwards-compatible API Keys
    
    return `ts5viewer.${environment}${customIdSuffix}.apiKey`;
}