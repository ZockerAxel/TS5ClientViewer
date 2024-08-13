//@ts-check
import Viewer from "./Viewer.js";

export default class View {
    #viewer;
    
    /**
     * 
     * @param {Viewer} viewer 
     */
    constructor(viewer) {
        this.#viewer = viewer;
    }
    
    getViewer() {
        return this.#viewer;
    }
    
    propagateViewerUpdate() {
        throw new Error("Not Implemented: propagateViewerUpdate()");
    }
    
    onViewerUpdate() {
        //Do Nothing
    }
}