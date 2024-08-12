//@ts-check
import { interfaceCustomAppId, interfaceDiv, interfaceHideChannel, interfaceScale, interfaceScaleSlider, interfaceServer, interfaceServerList, interfaceServerName, interfaceUseCustomId, interfaceViewerMode } from "../PreloadedElements.js";
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
        
        this.#initDynamicInterface();
    }
    
    #initDynamicInterface() {
        interfaceUseCustomId.addEventListener("change", function() {
            interfaceCustomAppId.disabled = !interfaceUseCustomId.checked;
        });
        
        interfaceServer.addEventListener("change", function() {
            const serverNameChoosable = interfaceServer.value === "by_name";
            
            interfaceServerName.disabled = !serverNameChoosable;
            interfaceServerList.disabled = !serverNameChoosable;
        });
        
        interfaceServerList.addEventListener("change", function() {
            interfaceServerName.value = interfaceServerList.value;
        });
        
        interfaceViewerMode.addEventListener("change", function() {
            const channelHideable = interfaceViewerMode.value === "channel";
            
            interfaceHideChannel.disabled = !channelHideable;
        });
        
        interfaceScaleSlider.addEventListener("input", function() {
            interfaceScale.value = interfaceScaleSlider.value;
        });
        
        interfaceScale.addEventListener("input", function() {
            interfaceScaleSlider.value = `${Math.max(0, Math.min(4, Number.parseFloat(interfaceScale.value)))}`;
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