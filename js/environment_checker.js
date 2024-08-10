//@ts-check

/**
 * Gets the environment the page is being run in
 * 
 * @returns {"browser" | "obs"}
 */
export function getEnvironment() {
    if("obsstudio" in Window) {
        return "obs";
    }
    return "browser";
}