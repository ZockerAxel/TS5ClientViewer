//@ts-check
import { interfaceAlignment, interfaceCustomAppId, interfaceDisableLocalClientColor, interfaceDisplayMode, interfaceDiv, interfaceHideChannel, interfaceHideEmpty, interfaceHideStatus, interfaceOnlyTalking, interfaceGeneratedUrl, interfaceScaleSlider, interfaceServer, interfaceServerList, interfaceServerName, interfaceShowAvatars, interfaceShowQueryClients, interfaceShowSpacers, interfaceUseCustomId, interfaceViewerMode, interfaceAppPort, interfaceScale } from "../PreloadedElements.js";
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
     * @param {{customId: string | undefined, appPort: number, mode: import("../viewer/Viewer.js").ViewerMode, serverSelectMode: import("../viewer/Viewer.js").ServerSelectMode, serverSelectModeOptions: *, scale: number, alignment: string, localClientColorEnabled: boolean, channelHidden: boolean, silentClientsHidden: boolean, statusHidden: boolean, avatarsShown: boolean, spacersShown: boolean, emptyChannelsHidden: boolean, queryClientsShown: boolean}} prefillOptions 
     */
    constructor(handler, viewer, {customId, appPort, mode, serverSelectMode, serverSelectModeOptions, scale, alignment, localClientColorEnabled, channelHidden, silentClientsHidden, statusHidden, avatarsShown, spacersShown, emptyChannelsHidden, queryClientsShown}) {
        this.#handler = handler;
        this.#viewer = viewer;
        
        //Prefilled Values
        if(customId) {
            interfaceUseCustomId.checked = true;
            interfaceCustomAppId.value = customId;
            interfaceCustomAppId.disabled = false;
        }
        
        interfaceAppPort.value = `${appPort}`;
        
        interfaceViewerMode.value = mode;
        
        interfaceServer.value = serverSelectMode;
        if(serverSelectMode === "by_name") {
            interfaceServerName.value = serverSelectModeOptions.name;
        }
        
        interfaceAlignment.value = alignment;
        
        //Init
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
        this.#initPreviewUpdater();
        this.updateGeneratedURL();
    }
    
    #initDynamicInterface() {
        const self = this;
        
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
            
            self.#viewer.setServerSelectMode("by_name", {name: interfaceServerList.value});
            
            self.updateGeneratedURL();
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
    
    #initPreviewUpdater() {
        const self = this;
        
        interfaceUseCustomId.addEventListener("change", function() {
            self.updateGeneratedURL();
        });
        
        interfaceCustomAppId.addEventListener("input", function() {
            self.updateGeneratedURL();
        });
        
        interfaceAppPort.addEventListener("input", function() {
            self.updateGeneratedURL();
        });
        
        interfaceViewerMode.addEventListener("change", function() {
            //@ts-ignore
            self.#viewer.setMode(this.value);
            
            self.updateGeneratedURL();
        });
        
        interfaceServer.addEventListener("change", function() {
            //@ts-ignore
            self.#viewer.setServerSelectMode(this.value, {name: interfaceServerName.value});
            
            self.updateGeneratedURL();
        });
        
        interfaceAlignment.addEventListener("change", function() {
            self.#viewer.setAlignment(this.value);
            
            self.updateGeneratedURL();
        });
        
        interfaceHideChannel.addEventListener("change", function() {
            self.#viewer.setChannelHidden(this.checked);
            
            self.updateGeneratedURL();
        });
        
        interfaceHideStatus.addEventListener("change", function() {
            self.#viewer.setStatusHidden(this.checked);
            
            self.updateGeneratedURL();
        });
        
        interfaceOnlyTalking.addEventListener("change", function() {
            self.#viewer.setSilentClientsHidden(this.checked);
            
            self.updateGeneratedURL();
        });
        
        interfaceShowAvatars.addEventListener("change", function() {
            self.#viewer.setAvatarsShown(this.checked);
            
            self.updateGeneratedURL();
        });
        
        interfaceHideEmpty.addEventListener("change", function() {
            self.#viewer.setEmptyChannelsHidden(this.checked);
            
            self.updateGeneratedURL();
        });
        
        interfaceShowSpacers.addEventListener("change", function() {
            self.#viewer.setSpacersShown(this.checked);
            
            self.updateGeneratedURL();
        });
        
        interfaceDisableLocalClientColor.addEventListener("change", function() {
            self.#viewer.setLocalClientColorEnabled(!this.checked);
            
            self.updateGeneratedURL();
        });
        
        interfaceShowQueryClients.addEventListener("change", function() {
            self.#viewer.setQueryClientsShown(this.checked);
            
            self.updateGeneratedURL();
        });
        
        interfaceScaleSlider.addEventListener("input", function() {
            self.#viewer.setScale(Number.parseFloat(this.value));
            self.#viewer.refreshViewer();
            
            self.updateGeneratedURL();
        });
        
        interfaceScale.addEventListener("input", function() {
            self.#viewer.setScale(Number.parseFloat(this.value));
            self.#viewer.refreshViewer();
            
            self.updateGeneratedURL();
        });
    }
    
    updateGeneratedURL() {
        /**@type {string[]} */
        const urlComponents = [];
        
        if(interfaceUseCustomId.checked && interfaceCustomAppId.value !== "") urlComponents.push(`custom_id=${interfaceCustomAppId.value}`);
        if(interfaceAppPort.value !== "5899") urlComponents.push(`app_port=${interfaceAppPort.value}`);
        urlComponents.push(`display=${interfaceDisplayMode.value}`);
        urlComponents.push(`mode=${this.#viewer.getMode()}`);
        urlComponents.push(`server=${this.#viewer.getServerSelectMode()}`);
        if(this.#viewer.getServerSelectMode() === "by_name") urlComponents.push(`server_options=${JSON.stringify(this.#viewer.getServerSelectModeOptions())}`);
        urlComponents.push(`align=${this.#viewer.getAlignment()}`);
        if(this.#viewer.getMode() === "channel" && this.#viewer.isChannelHidden()) urlComponents.push(`hide_channel`);
        if(this.#viewer.isStatusHidden()) urlComponents.push("hide_status");
        if(this.#viewer.isSilentClientsHidden()) urlComponents.push("only_talking");
        if(this.#viewer.isAvatarsShown()) urlComponents.push("show_avatars");
        if(this.#viewer.isEmptyChannelsHidden()) urlComponents.push("hide_empty");
        if(this.#viewer.isSpacersShown()) urlComponents.push("show_spacers");
        if(!this.#viewer.isLocalClientColorEnabled()) urlComponents.push("disable_local_client_color");
        if(this.#viewer.isQueryClientsShown()) urlComponents.push("show_query_clients");
        if(this.#viewer.getScale() !== 1) urlComponents.push(`scale=${this.#viewer.getScale()}`);
        
        //Build URL
        
        let url = location.origin + "?";
        
        url += urlComponents.join("&");
        
        interfaceGeneratedUrl.textContent = encodeURI(url);
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