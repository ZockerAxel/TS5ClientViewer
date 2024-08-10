//@ts-check

/**@type {Map<string, string>} */
const lookupMap = new Map();

function init() {
    const params = location.search.substring(1);
    
    const paramList = params.split("&");
    
    for(const param of paramList) {
        const data = param.split("=");
        const key = data[0];
        const value = data[1];
        
        lookupMap.set(key, value);
    }
}

/**
 * Gets a parameter value by it's key
 * 
 * @param {string} key The Key to lookup
 * @returns {string | undefined} The set value
 */
export function getParam(key) {
    return lookupMap.get(key);
}

/**
 * Gets a parameter value as an int by it's key
 * 
 * @param {string} key The Key to lookup
 * @returns {number | undefined} The set value
 */
export function getParamInt(key) {
    const value = getParam(key);
    if(!value) return undefined;
    return Number.parseInt(value);
}

/**
 * Gets a parameter value as a float by it's key
 * 
 * @param {string} key The Key to lookup
 * @returns {number | undefined} The set value
 */
export function getParamFloat(key) {
    const value = getParam(key);
    if(!value) return undefined;
    return Number.parseFloat(value);
}

/**
 * Gets a parameter value as a boolean by it's key.
 * Assumes false for unset params.
 * Assumes true for set params without a value.
 * 
 * @param {string} key The Key to lookup
 * @returns {boolean} The set value
 */
export function getParamBoolean(key) {
    if(!isParamSet(key)) return false;//If unset, assume false
    const value = getParam(key);
    if(!value) return true;//If set, but no value, assume true
    return value.toLowerCase() === "true";
}

/**
 * Checks whether a parameter is set
 * 
 * @param {string} key The Key to lookup
 * @returns {boolean} Whether the param is set
 */
export function isParamSet(key) {
    return lookupMap.has(key);
}


init();