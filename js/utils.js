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