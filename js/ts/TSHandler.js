//@ts-check
import App from "../App.js";
import Channel from "./Channel.js";
import Client from "./Client.js";
import Server from "./Server.js";

const testOutput = document.querySelector("#test-tree");

export class Handler {
    #apiKey;
    #apiPort;
    #app;
    #api;
    
    /**@type {Server[]} */
    #servers = [];
    
    /**@type {Server} */
    #activeServer;
    
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
     * Gets a server by it's ID
     * 
     * @param {number} id The Server ID
     * @returns {Server | null}
     */
    getServer(id) {
        for(const server of this.#servers) {
            if(server.getId() === id) {
                return server;
            }
        }
        
        return null;
    }
    
    /**
     * Removes a Server
     * 
     * @param {Server} server The Server to remove
     */
    removeServer(server) {
        const index = this.#servers.indexOf(server);
        
        if(index === -1) return;
        
        this.#servers.splice(index, 1);
    }
    
    getServers() {
        return [...this.#servers];
    }
    
    updateActiveServer() {
        for(const server of this.getServers()) {
            const localClient = server.getLocalClient();
            
            if(localClient === null) throw new Error(`No local Client found on Server '${server.getName()}'`);
            
            if(!localClient.isHardwareMuted()) {
                this.#activeServer = server;//Set the server where the client is not hardware-muted as the active one
                break;
            }
        }
        
        // @ts-ignore
        testOutput.textContent = this.#activeServer.toTreeString();
    }
    
    getActiveServer() {
        return this.#activeServer;
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
        this.registerClientMovedEvent();
        this.registerClientPropertiesUpdatedEvent();
        this.registerTalkStatusChangedEvent();
        this.registerConnectStatusChangedEvent();
        this.registerChannelsEvent();
    }
    
    registerAuthEvent() {
        const self = this;
        this.#api.on("tsOnAuth", function(data) {
            self.#onAuth(data.payload);
        });
    }
    
    registerClientMovedEvent() {
        const self = this;
        this.#api.on("tsOnClientMoved", function(data) {
            self.#onClientMoved(data.payload);
        });
    }
    
    registerClientPropertiesUpdatedEvent() {
        const self = this;
        this.#api.on("tsOnClientPropertiesUpdated", function(data) {
            const serverId = Number.parseInt(data.payload.connectionId);
            
            const server = self.getServer(serverId);
            
            if(server == null) throw new Error(`Client Properties updated in unkown Server (ID: ${serverId})`);
            
            const clientId = Number.parseInt(data.payload.clientId);
            
            const client = server.getClient(clientId);
            
            if(client === null) throw new Error(`Client Properties updated for unkown Client (ID: ${clientId}) in Server '${server.getName()}' (ID: ${serverId})`);
            
            self.#updateClient(client, data.payload.properties);
        });
    }
    
    registerTalkStatusChangedEvent() {
        const self = this;
        this.#api.on("tsOnTalkStatusChanged", function(data) {
            const serverId = Number.parseInt(data.payload.connectionId);
            
            const server = self.getServer(serverId);
            
            if(server == null) throw new Error(`Client Talk Status updated in unkown Server (ID: ${serverId})`);
            
            const clientId = Number.parseInt(data.payload.clientId);
            
            const client = server.getClient(clientId);
            
            if(client === null) throw new Error(`Client Talk Status updated for unkown Client (ID: ${clientId}) in Server '${server.getName()}' (ID: ${serverId})`);
            
            const status = Number.parseInt(data.payload.status);
            
            client.update({
                talking: status !== 0,
            });
            
            // @ts-ignore
            testOutput.textContent = self.#activeServer.toTreeString();
        });
    }
    
    registerConnectStatusChangedEvent() {
        const self = this;
        this.#api.on("tsOnConnectStatusChanged", function(data) {
            const connectionId = Number.parseInt(data.payload.connectionId);
            const status = Number.parseInt(data.payload.status);
            
            let server = self.getServer(connectionId);
            
            if(server === null) {
                //If server is null, User just connected to a new server (or something went really bad lmao)
                if(status !== 2) return;//Only handle status 2, as this status is used for when server name is sent. Status 3 does not seem to send any useful info
                
                const clientId = Number.parseInt(data.payload.info.clientId);
                const serverName = data.payload.info.serverName;
                
                server = self.#loadServer({
                    id: connectionId,
                    properties: {
                        name: serverName,
                    },
                    clientId: clientId,
                });
                
                self.#servers.push(server);
            } else {
                //If server is not null, user presumably disconnected (on their own or against their will)
                
                if(status !== 0) return;//Only handle status 0 as this status is used for disconnecting for any reason
                
                self.removeServer(server);
            }
        });
    }
    
    registerChannelsEvent() {
        const self = this;
        this.#api.on("tsOnChannels", function(data) {
            const connectionId = data.payload.connectionId;
            
            const server = self.getServer(connectionId);
            
            if(server === null) throw new Error(`Received Channels for Unknown Server (ID: ${connectionId})`);
            
            const channelInfos = data.payload.info;
            
            self.#loadChannels(server, channelInfos);
        });
    }
    
    #onAuth(payload) {
        this.#servers.length = 0;//Clear Servers
        
        for(const connection of payload.connections) {
            const server = this.#loadServer(connection);
            this.#servers.push(server);
        }
        
        // @ts-ignore
        testOutput.textContent = this.#activeServer.toTreeString();
    }
    
    #onClientMoved(payload) {
        const self = this;
        
        const connectionId = payload.connectionId;
        const server = this.getServer(connectionId);
        
        if(server === null) throw new Error(`Client moved in unknown Server (ID: '${connectionId}')`);
        
        const clientId = Number.parseInt(payload.clientId);
        const channelId = Number.parseInt(payload.newChannelId);
        
        if(channelId === 0) {
            //If channel id is 0, client disconnected
            console.log({message: "Client disconnected", clientId: clientId});
            
            const client = server.getClient(clientId);
            
            if(client === null) throw new Error(`Unknown Client (ID: ${clientId}) disconnected`);
            
            const channel = client.getChannel();
            
            if(channel === null) throw new Error(`Client (ID: ${clientId}) disconnected from unknown Channel`);
            
            channel.removeClient(client);
            
            // @ts-ignore
            if(server === this.#activeServer) testOutput.textContent = server.toTreeString();
            
            return;
        }
        
        const properties = payload.properties;
        
        if(properties !== undefined) {
            //If properties exist, it's a freshly connected client
            const client = this.#loadClient(server, clientId, properties);
            
            console.log({message: "Client connected", client: client});
            
            const to = server.getChannel(channelId);
            
            if(to === null) throw new Error(`Client moved into unkown Channel (ID: ${channelId})`);
            
            to.addClient(client);
            
            if(client.isLocalClient()) {
                if(!client.isHardwareMuted()) this.#activeServer = server;//Set this server as the active one if local client is not hardware muted
            
                client.onHardwareMutedChange(function(hardwareMuted) {
                    if(!hardwareMuted) self.#activeServer = server;//Set the server as the active one as soon as local client is no longer hardware-muted
                    
                    // @ts-ignore
                    testOutput.textContent = self.#activeServer.toTreeString();
                });
            }
        } else {
            //If properties don't exist, the client changed channels
            const client = server.getClient(clientId);
            
            if(client === null) throw new Error(`Unknown Client (ID: ${clientId}) moved into a Channel`);
            
            const oldChannel = client.getChannel();
            
            oldChannel?.removeClient(client);
            
            const to = server.getChannel(channelId);
            
            if(to === null) throw new Error(`Client '${client.getNickname()}' (ID: ${clientId}) moved into unkown Channel (ID: ${channelId})`);
            
            to.addClient(client);
            
            console.log({message: "Client switched Channel", from: oldChannel, to: to});
        }
        
        // @ts-ignore
        if(server === this.#activeServer) testOutput.textContent = server.toTreeString();
    }
    
    #loadServer({id, properties, channelInfos = {rootChannels: [], subChannels: {}}, clientInfos = [], clientId}) {
        const self = this;
        
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
                
                const channelId = Number.parseInt(channelInfo.id);
                const channelName = channelInfo.properties.name;
                const channelOrder = Number.parseInt(channelInfo.order);
                
                const channel = new Channel(server, channelId, channelName, channelOrder);
                
                for(const clientInfo of [...allClientInfos]) {
                    const clientChannelId = Number.parseInt(clientInfo.channelId);
                    if(clientChannelId !== channelId) continue;
                    
                    const clientId = Number.parseInt(clientInfo.id);
                    
                    const client = this.#loadClient(server, clientId, clientInfo.properties);
                    
                    channel.addClient(client);
                }
                
                parent.addSubChannel(channel, false);
                
                const index = allChannelInfos.indexOf(channelInfo);
                if(index === -1) continue;
                allChannelInfos.splice(index, 1);
            }
        }
        
        //Sort all channels initally to make sure they are in the correct order (they should already be given in the correct order, but you can never be sure enough)
        server.getRootChannel().sortSubChannelsRecursively();
        
        const localClient = server.getLocalClient();
        
        if(localClient !== null) {
            if(!localClient.isHardwareMuted()) this.#activeServer = server;//Set this server as the active one if local client is not hardware muted
            
            localClient.onHardwareMutedChange(function(hardwareMuted) {
                if(!hardwareMuted) self.#activeServer = server;//Set the server as the active one as soon as local client is no longer hardware-muted
                
                // @ts-ignore
                testOutput.textContent = self.#activeServer.toTreeString();
            });
        }
        
        return server;
    }
    
    /**
     * 
     * @param {Server} server 
     * @param {*} channelInfos 
     */
    #loadChannels(server, channelInfos) {
        const allChannelInfos = [...channelInfos.rootChannels];
        
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
                
                const channelId = Number.parseInt(channelInfo.id);
                const channelName = channelInfo.properties.name;
                const channelOrder = Number.parseInt(channelInfo.order);
                
                const channel = new Channel(server, channelId, channelName, channelOrder);
                
                parent.addSubChannel(channel, false);
                
                const index = allChannelInfos.indexOf(channelInfo);
                if(index === -1) continue;
                allChannelInfos.splice(index, 1);
            }
        }
        
        //Sort all channels initally to make sure they are in the correct order (they should already be given in the correct order, but you can never be sure enough)
        server.getRootChannel().sortSubChannelsRecursively();
    }
    
    /**
     * Loads a client with the given properties
     * 
     * @param {Server} server The Server the client belongs to
     * @param {number} clientId The Client ID
     * @param {*} properties The Client Properties
     * @returns {Client} The created client
     */
    #loadClient(server, clientId, properties) {
        const clientType = properties.type;
        const nickname = properties.nickname;
        const talking = properties.flagTalking;
        const muted = properties.inputMuted;
        const hardwareMuted = !properties.inputHardware;
        const soundMuted = properties.isMuted;
        const away = properties.away;
        const awayMessage = properties.awayMessage;
        const talkPower = properties.talkPower;
        
        const client = new Client(server, clientId, clientType, nickname, talking, muted, hardwareMuted, soundMuted, away, awayMessage, talkPower);
        
        return client;
    }
    
    /**
     * Updates a Client with the provided Properties
     * 
     * @param {Client} client The Client to update
     * @param {*} properties The Client Properties
     */
    #updateClient(client, properties) {
        const nickname = properties.nickname;
        const talking = properties.flagTalking;
        const muted = properties.inputMuted;
        const hardwareMuted = !properties.inputHardware;
        const soundMuted = properties.isMuted;
        const away = properties.away;
        const awayMessage = properties.awayMessage;
        const talkPower = properties.talkPower;
        
        client.update({
            nickname: nickname,
            talking: talking,
            muted: muted,
            hardwareMuted: hardwareMuted,
            soundMuted: soundMuted,
            away: away,
            awayMessage: awayMessage,
            talkPower: talkPower,
        });
    }
}