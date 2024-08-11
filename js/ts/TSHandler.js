//@ts-check
import App from "../App.js";
import Channel from "./Channel.js";
import Client from "./Client.js";
import Server from "./Server.js";

export class Handler {
    #apiKey;
    #apiPort;
    #app;
    #api;
    
    /**@type {Server[]} */
    #servers = [];
    
    /**
     * Creates a new Handler
     * 
     * @param {string | null} apiKey The TS API Key, use null to generate a new one
     * @param {number} apiPort The TeamSpeak Remote App API port
     * @param {App} app The App to use
     */
    constructor(apiKey, apiPort, app) {
        this.#apiKey = apiKey;
        this.#apiPort = apiPort;
        this.#app = app;
    }
    
    /**
     * Connects to the TS5 Client
     * 
     * @returns {Promise<string>} The API Key
     */
    async connect() {
        console.log({message: "[Handler] Connecting ...", apiKey: this.#apiKey});
        
        if(this.#apiKey == null) {
            const apiKey = await this.#connectWithoutAPIKey();
            this.#apiKey = apiKey;
            return apiKey;
        } else {
            const apiKey = await this.#connectWithAPIKey();
            this.#apiKey = apiKey;
            return apiKey;
        }
    }
    
    /**
     * 
     * @returns {Promise<string>} The promise for the API Key
     */
    async #connectWithoutAPIKey() {
        /**@type {(value: any) => void} */
        let resolveFunction;
        /**@type {(value: any) => void} */
        let rejectFunction;
        const promise = new Promise(function(resolve, reject) {
            resolveFunction = resolve;
            rejectFunction = reject;
        });
        
        // @ts-ignore
        this.#api = new TSRemoteAppWrapper.TSApiWrapper({
            api: {
                port: this.#apiPort,
                tsEventDebug: true,
            },
            app: this.#app.toRemoteAPIApp(),
        });
        
        this.#api.on("apiReady", function(/** @type {{ payload: { apiKey: string; }; }} */ data) {
            console.log({message: "[Handler] API Ready.", apiKey: data.payload.apiKey});
            resolveFunction(data.payload.apiKey);
        });
        
        this.#api.on("apiError", function(data) {
            rejectFunction(data.exception.message);
        });
        
        this.registerEvents();
        
        return promise;
    }
    
    async #connectWithAPIKey() {
        /**@type {(value: any) => void} */
        let resolveFunction;
        /**@type {(value: any) => void} */
        let rejectFunction;
        const promise = new Promise(function(resolve, reject) {
            resolveFunction = resolve;
            rejectFunction = reject;
        });
        
        // @ts-ignore
        this.#api = new TSRemoteAppWrapper.TSApiWrapper({
            api: {
                key: this.#apiKey,
                port: this.#apiPort,
                tsEventDebug: true,
            },
            app: this.#app.toRemoteAPIApp(),
        });
        
        this.#api.on("apiReady", function(/** @type {{ payload: { apiKey: string; }; }} */ data) {
            console.log({message: "[Handler] API Ready.", apiKey: data.payload.apiKey});
            resolveFunction(data.payload.apiKey);
        });
        
        this.#api.on("apiError", function(data) {
            rejectFunction(data.exception.message);
        });
        
        this.registerEvents();
        
        return promise;
    }
    
    registerEvents() {
        this.registerAuthEvent();
    }
    
    registerAuthEvent() {
        const self = this;
        this.#api.on("tsOnAuth", function(data) {
            self.#onAuth(data.payload);
        });
    }
    
    #onAuth(payload) {
        this.#servers.length = 0;//Clear Servers
        
        /**@type {number} */
        const currentConnectionId = payload.currentConnectionId;
        
        for(const server of payload.connections) {
            this.#loadServer(server);
        }
    }
    
    #loadServer({id, properties, channelInfos, clientInfos, clientId}) {
        const server = new Server(id, clientId, properties.name);
        
        const allChannelInfos = [...channelInfos.rootChannels];
        const allClientInfos = [...clientInfos];
        
        for(const channelList of Object.values(channelInfos.subChannels)) {
            for(const channel of channelList) {
                allChannelInfos.push(channel);
            }
        }
        
        while(allChannelInfos.length > 0) {
            console.log({message: "Collecting Channels ...", remainingChannels: allChannelInfos.length});
            
            for(const channelInfo of [...allChannelInfos]) {
                const parentId = channelInfo.parentId;
                const parent = server.getChannel(parentId);
                
                if(parent === null) continue;
                
                const channelId = channelInfo.id;
                const channelName = channelInfo.properties.name.replace(/^\[.*?spacer.*?\]\s*/, "");
                const channelOrder = channelInfo.order;
                
                const channel = new Channel(server, channelId, channelName, channelOrder);
                
                for(const clientInfo of [...allClientInfos]) {
                    if(clientInfo.channelId !== channelId) continue;
                    
                    const clientId = clientInfo.id;
                    const clientType = clientInfo.properties.type;
                    const nickname = clientInfo.properties.nickname;
                    const talking = clientInfo.properties.flagTalking;
                    const muted = clientInfo.properties.inputMuted;
                    const hardwareMuted = clientInfo.properties.inputDeactivated;
                    const soundMuted = clientInfo.properties.isMuted;
                    const away = clientInfo.properties.away;
                    const awayMessage = clientInfo.properties.awayMessage;
                    
                    const client = new Client(server, clientId, clientType, nickname, talking, muted, hardwareMuted, soundMuted, away, awayMessage);
                    
                    channel.addClient(client);
                }
                
                parent.addSubChannel(channel);
                
                const index = allChannelInfos.indexOf(channelInfo);
                if(index === -1) continue;
                allChannelInfos.splice(index, 1);
            }
        }
        
        console.log(server.toTreeString());
    }
}