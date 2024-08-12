//@ts-check
import { interfaceDiv, interfaceServerList } from "../PreloadedElements.js";
import Handler from "../ts/Handler.js";
import Server from "../ts/Server.js";
import Viewer from "../viewer/Viewer.js";

export default class Interface {
    #handler;
    #viewer;
    
    /**
     * 
     * @param {Handler} handler
     * @param {Viewer} viewer 
     */
    constructor(handler, viewer) {
        this.#handler = handler;
        this.#viewer = viewer;
        
        this.#init();
    }
    
    #init() {
        const self = this;
        
        for(const server of this.#handler.getServers()) {
            this.#registerServer(server);
        }
        
        this.#handler.onNewServer(function(server) {
            self.#registerServer(server);
        });
    }
    
    /**
     * 
     * @param {Server} server The Server to register
     */
    #registerServer(server) {
        const option = document.createElement("option");
        option.value = server.getName();
        option.textContent = server.getName();
        
        interfaceServerList.appendChild(option);
        
        server.onDelete(function() {
            option.remove();
        });
    }
    
    getViewer() {
        return this.#viewer;
    }
    
    show() {
        interfaceDiv.classList.add("active");
    }
    
    hide() {
        interfaceDiv.classList.remove("active");
    }
}