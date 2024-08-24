//@ts-check

/**
 * Returns the entered value or the default value if the entered value is null or undefined
 * 
 * @param {T | null | undefined} value The Value to get
 * @param {T} defaultValue The Default Value to use if the value is null or undefined
 * @returns {T} If it is non-null and non-undefined, the Value. If not, the default value
 * @template T The Type used
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

/**
 * Reads the Avatar URL from the Avatar field
 * 
 * @param {string} avatarField The Avatar Field in the client properties
 * @returns {string | null} The URL
 */
export function readMyTsAvatarURL(avatarField) {
    if(!avatarField || avatarField === "") return null;
    
    const entries = avatarField.split(";");
    
    if(entries.length === 0) return null;
    
    const lastEntry = entries[entries.length - 1];
    
    if(!lastEntry) return null;
    
    const url = lastEntry.split(",")[1];
    
    if(!url) return null;
    
    return url;
}