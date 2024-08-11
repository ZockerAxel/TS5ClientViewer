//@ts-check

/**
 * @typedef ViewerMode
 * @type {"tree" | "used_channels" | "own_channel" | "talking"}
 */

export default class Viewer {
    #mode;
    
    
    /**
     * 
     * @param {{mode: ViewerMode}} options 
     */
    constructor({mode = "tree"}) {
        this.#mode = mode;
    }
    
    createTree() {
        
    }
}