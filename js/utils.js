/**
 * Returns the entered value or the default value if the entered value is null or undefined
 * 
 * @param {*} value The Value to get
 * @param {*} defaultValue The Default Value to use if the value is null or undefined
 * @returns {*} If it is non-null and non-undefined, the Value. If not, the default value
 */
export function getOrDefault(value, defaultValue) {
    return (value !== null && value !== undefined) ? value : defaultValue;
}

/**
 * Creates a string with length * fill
 * 
 * @param {number} length The Length of the new string
 * @param {string} fill The value to fill it with
 * @returns {string} A string that has the fill string length amount
 */
export function createLengthString(length, fill) {
    let text = "";
    
    for(let i = 0; i < length; i++) {
        text += fill;
    }
    
    return text;
}