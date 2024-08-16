//@ts-check
import App from "../App.js";
import { logger } from "../Logger.js";
import { hintScreenDiv, viewerDiv } from "../PreloadedElements.js";
import { readMyTsAvatarURL } from "../Utils.js";
import Channel from "./Channel.js";
import Client from "./Client.js";
import RemoteAppConnection from "./remote_app/RemoteAppConnection.js";
import Server from "./Server.js";

export default class Handler {
    #apiKey;
    #apiPort;
    #app;
    /**@type {RemoteAppConnection} */
    #api;
    
    /**@type {Server[]} */
    #servers = [];
    
    /**@type {Server} */
    #activeServer;
    
    //Callbacks
    /**@type {((server: Server) => void)[]} */
    #newServerCallbacks = [];
    /**@type {((server: Server) => void)[]} */
    #activeServerChangeCallbacks = [];
    
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
    
    restart() {
        this.#api.disconnect();
        this.#api.connect();
    }
    
    /**
     * Set a new API Port to use next time the API connects
     * 
     * @param {number} apiPort The new API Port
     */
    setApiPort(apiPort) {
        this.#apiPort = apiPort;
    }
    
    getApiPort() {
        return this.#apiPort;
    }
    
    /**
     * Gets a server by it's ID
     * 
     * @param {number} id The Server ID
     * @returns {Server | null} The found Server or null, if none was found
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
     * Gets a server by it's name
     * 
     * @param {string} name The Server Name
     * @returns {Server | null} The found Server or null, if none was found
     */
    getServerByName(name) {
        for(const server of this.#servers) {
            if(server.getName() === name) {
                return server;
            }
        }
        
        return null;
    }
    
    /**
     * 
     * @param {(server: Server) => void} callback 
     */
    onNewServer(callback) {
        this.#newServerCallbacks.push(callback);
    }
    
    /**
     * Add a Server
     * 
     * @param {Server} server The added Server
     */
    addServer(server) {
        this.#servers.push(server);
        
        for(const callback of this.#newServerCallbacks) {
            callback(server);
        }
    }
    
    /**
     * Remove a Server
     * 
     * @param {Server} server The Server to remove
     */
    removeServer(server) {
        const index = this.#servers.indexOf(server);
        
        if(index === -1) return;
        
        server.delete();
        
        this.#servers.splice(index, 1);
        
        if(server === this.#activeServer) {
            this.updateActiveServer();
        }
    }
    
    getServers() {
        return [...this.#servers];
    }
    
    updateActiveServer() {
        for(const server of this.getServers()) {
            const localClient = server.getLocalClient();
            
            if(localClient === null) throw new Error(`No local Client found on Server '${server.getName()}'`);
            
            if(!localClient.isHardwareMuted()) {
                this.#setActiveServer(server);//Set the server where the client is not hardware-muted as the active one
                return;
            }
        }
        
        const firstServer = this.getServers()[0];
        
        if(firstServer) this.#setActiveServer(firstServer);
    }
    
    /**
     * Sets the active server
     * 
     * @param {Server} server The new active Server
     */
    #setActiveServer(server) {
        if(this.#servers.indexOf(server) === -1) return;//Do not set servers as active if they are not in the server list
        
        const changed = this.#activeServer !== server;
        this.#activeServer = server;
        
        if(changed) {
            for(const callback of this.#activeServerChangeCallbacks) {
                callback(server);
            }
            
            logger.log({message: "Active Server Changed", server: server});
        }
    }
    
    /**
     * 
     * @param {(server: Server) => void} callback 
     */
    onActiveServerChange(callback) {
        this.#activeServerChangeCallbacks.push(callback);
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
        logger.log({message: "[Handler] Connecting ...", apiKey: this.#apiKey});
        
        if(this.#apiKey == null) {
            const apiKey = await this.connectWithoutAPIKey();
            this.#apiKey = apiKey;
            return apiKey;
        } else {
            const apiKey = await this.#connectWithAPIKey();
            this.#apiKey = apiKey;
            return apiKey;
        }
    }
    
    /**
     * Disconnects from the Client
     */
    disconnect() {
        this.#api?.disconnect();
    }
    
    /**
     * 
     * @returns {Promise<string>} The promise for the API Key
     */
    async connectWithoutAPIKey() {
        /**@type {(value: any) => void} */
        let resolveFunction;
        /**@type {() => void} */
        let rejectFunction;
        const promise = new Promise(function(resolve, reject) {
            resolveFunction = resolve;
            rejectFunction = reject;
        });
        
        // @ts-ignore
        this.#api = new RemoteAppConnection({
            api: {
                host: "localhost",
                port: this.#apiPort,
            },
            app: this.#app.toRemoteAPIApp(),
        });
        this.#api.connect();
        
        this.#api.addEventListener("api:ready", function(/** @type {{ apiKey: string; }} */ data) {
            logger.log({message: "[Handler] API Ready.", apiKey: data.apiKey});
            resolveFunction(data.apiKey);
        });
        
        this.#api.addEventListener("api:disconnect", function() {
            rejectFunction();
        });
        
        this.registerEvents();
        
        return promise;
    }
    
    async #connectWithAPIKey() {
        /**@type {(value: any) => void} */
        let resolveFunction;
        /**@type {() => void} */
        let rejectFunction;
        const promise = new Promise(function(resolve, reject) {
            resolveFunction = resolve;
            rejectFunction = reject;
        });
        
        // @ts-ignore
        this.#api = new RemoteAppConnection({
            api: {
                host: "localhost",
                port: this.#apiPort,
                key: this.#apiKey,
            },
            app: this.#app.toRemoteAPIApp(),
        });
        this.#api.connect();
        
        this.#api.addEventListener("api:ready", function(/** @type {{ apiKey: string; }} */ data) {
            logger.log({message: "[Handler] API Ready.", apiKey: data.apiKey});
            resolveFunction(data.apiKey);
        });
        
        this.#api.addEventListener("api:disconnect", function() {
            rejectFunction();
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
        
        //Channel Events
        this.registerChannelsEvent();
        this.registerChannelCreatedEvent();
        this.registerChannelMovedEvent();
        this.registerChannelEditedEvent();
        this.registerChannelDeletedEvent();
    }
    
    registerAuthEvent() {
        const self = this;
        this.#api.addEventListener("ts:auth", function(data) {
            self.#onAuth(data);
            
            self.#api.addEventListener("api:disconnect", function() {
                viewerDiv.textContent = "";
                hintScreenDiv.classList.remove("hidden");
            });
        });
    }
    
    registerClientMovedEvent() {
        const self = this;
        this.#api.addEventListener("ts:clientMoved", function(data) {
            self.#onClientMoved(data);
        });
    }
    
    registerClientPropertiesUpdatedEvent() {
        const self = this;
        this.#api.addEventListener("ts:clientPropertiesUpdated", function(data) {
            const serverId = Number.parseInt(data.connectionId);
            
            const server = self.getServer(serverId);
            
            if(server == null) throw new Error(`Client Properties updated in unkown Server (ID: ${serverId})`);
            
            const clientId = Number.parseInt(data.clientId);
            
            const client = server.getClient(clientId);
            
            if(client === null) throw new Error(`Client Properties updated for unkown Client (ID: ${clientId}) in Server '${server.getName()}' (ID: ${serverId})`);
            
            self.#updateClient(client, data.properties);
        });
    }
    
    registerTalkStatusChangedEvent() {
        const self = this;
        this.#api.addEventListener("ts:talkStatusChanged", function(data) {
            const serverId = Number.parseInt(data.connectionId);
            
            const server = self.getServer(serverId);
            
            if(server == null) throw new Error(`Client Talk Status updated in unkown Server (ID: ${serverId})`);
            
            const clientId = Number.parseInt(data.clientId);
            
            const client = server.getClient(clientId);
            
            if(client === null) throw new Error(`Client Talk Status updated for unkown Client (ID: ${clientId}) in Server '${server.getName()}' (ID: ${serverId})`);
            
            const status = Number.parseInt(data.status);
            
            client.update({
                talking: status !== 0,
            });
        });
    }
    
    registerConnectStatusChangedEvent() {
        const self = this;
        this.#api.addEventListener("ts:connectStatusChanged", function(data) {
            const connectionId = Number.parseInt(data.connectionId);
            const status = Number.parseInt(data.status);
            
            let server = self.getServer(connectionId);
            
            if(server === null) {
                //If server is null, User just connected to a new server (or something went really bad lmao)
                if(status !== 2) return;//Only handle status 2, as this status is used for when server name is sent. Status 3 does not seem to send any useful info
                
                const clientId = Number.parseInt(data.info.clientId);
                const serverName = data.info.serverName;
                
                server = self.#loadServer({
                    id: connectionId,
                    properties: {
                        name: serverName,
                    },
                    clientId: clientId,
                });
                
                self.addServer(server);
            } else {
                //If server is not null, user presumably disconnected (on their own or against their will)
                
                if(status !== 0) return;//Only handle status 0 as this status is used for disconnecting for any reason
                
                self.removeServer(server);
            }
        });
    }
    
    registerChannelsEvent() {
        const self = this;
        this.#api.addEventListener("ts:channels", function(data) {
            const connectionId = Number.parseInt(data.connectionId);
            
            const server = self.getServer(connectionId);
            
            if(server === null) throw new Error(`Received Channels for Unknown Server (ID: ${connectionId})`);
            
            const channelInfos = data.info;
            
            self.#loadChannels(server, channelInfos);
            
            const movePayloads = server.getAndResetRememberedMovePayloads();
            
            for(const payload of movePayloads) {
                self.#onClientMoved(payload);
            }
        });
    }
    
    registerChannelCreatedEvent() {
        const self = this;
        this.#api.addEventListener("ts:channelCreated", function(data) {
            const connectionId = Number.parseInt(data.connectionId);
            
            const server = self.getServer(connectionId);
            
            if(server === null) throw new Error(`Channel Created in Unknown Server (ID: ${connectionId})`);
            
            const parentId = data.parentId;
            
            const parent = server.getChannel(parentId);
            
            if(parent === null) throw new Error(`Channel created with Unknown Parent Channel (ID: ${parentId}) on Server '${server.getName()}' (ID: ${connectionId})`);
            
            const channelId = Number.parseInt(data.channelId);
            const channelName = data.properties.name;
            const channelOrder = Number.parseInt(data.properties.order);
            
            const channel = new Channel(server, channelId, channelName, channelOrder);
            
            logger.log({message: "New Channel created", channel: channel, parent: parent});
            
            parent.addSubChannel(channel);
        });
    }
    
    registerChannelMovedEvent() {
        const self = this;
        this.#api.addEventListener("ts:channelMoved", function(data) {
            const connectionId = Number.parseInt(data.connectionId);
            
            const server = self.getServer(connectionId);
            
            if(server === null) throw new Error(`Channel moved in unknown Server (ID: ${connectionId})`);
            
            const channelId = Number.parseInt(data.channelId);
            
            const channel = server.getChannel(channelId);
            
            if(channel === null) throw new Error(`Unknown Channel (ID: ${channelId}) moved in Server '${server.getName()}' (ID: ${connectionId})`);
            
            const parentId = Number.parseInt(data.parentId);
            
            const parent = server.getChannel(parentId);
            
            if(parent === null) throw new Error(`Channel '${channel.getName()}' (ID: ${channelId}) moved to unknown Parent Channel (ID: ${parentId}) in Server '${server.getName()}' (ID: ${connectionId})`);
            
            const order = Number.parseInt(data.order);
            
            self.#onChannelMoved(channel, parent, order);
        });
    }
    
    registerChannelEditedEvent() {
        const self = this;
        this.#api.addEventListener("ts:channelEdited", function(data) {
            const connectionId = Number.parseInt(data.connectionId);
            
            const server = self.getServer(connectionId);
            
            if(server === null) throw new Error(`Channel edited in unknown Server (ID: ${connectionId})`);
            
            const channelId = Number.parseInt(data.channelId);
            
            const channel = server.getChannel(channelId);
            
            if(channel === null) throw new Error(`Unknown Channel (ID: ${channelId}) edited in Server '${server.getName()}' (ID: ${connectionId})`);
            
            const order = Number.parseInt(data.properties.order);
            
            self.#onChannelMoved(channel, null, order);
            self.#updateChannel(channel, data.properties);
        });
    }
    
    registerChannelDeletedEvent() {
        const self = this;
        this.#api.addEventListener("ts:channelDeleted", function(data) {
            const connectionId = Number.parseInt(data.connectionId);
            
            const server = self.getServer(connectionId);
            
            if(server === null) throw new Error(`Channel deleted in unknown Server (ID: ${connectionId})`);
            
            const channelId = Number.parseInt(data.channelId);
            
            const channel = server.getChannel(channelId);
            
            if(channel === null) throw new Error(`Unknown Channel (ID: ${channelId}) deleted in Server '${server.getName()}' (ID: ${connectionId})`);
            
            logger.log({message: "Channel deleted", channel: channel});
            
            channel.delete();
        });
    }
    
    #onAuth(payload) {
        hintScreenDiv.classList.add("hidden");
        this.#servers.length = 0;//Clear Servers
        
        for(const connection of payload.connections) {
            const server = this.#loadServer(connection);
            this.addServer(server);
        }
        
        this.updateActiveServer();
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
            const client = server.getClient(clientId);
            
            if(client === null) throw new Error(`Unknown Client (ID: ${clientId}) disconnected`);
            
            const channel = client.getChannel();
            
            if(channel === null) throw new Error(`Client (ID: ${clientId}) disconnected from unknown Channel`);
            
            channel.removeClient(client);
            
            logger.log({message: "Client disconnected", client: client});
            
            return;
        }
        
        const properties = payload.properties;
        
        if(properties !== undefined) {
            //If properties exist, it's a freshly connected client
            const client = this.#loadClient(server, clientId, properties);
            
            logger.log({message: "Client connected", client: client});
            
            const to = server.getChannel(channelId);
            
            if(to === null) {
                if(server.getRootChannel().getSubChannels().length > 0) throw new Error(`Client '${client.getNickname()}' (ID: ${clientId}) moved into unkown Channel (ID: ${channelId})`);
                server.rememberMovePayload(payload);
                return;
            }
            
            to.addClient(client);
            
            if(client.isLocalClient()) {
                if(!client.isHardwareMuted()) this.#setActiveServer(server);//Set this server as the active one if local client is not hardware muted
                
                client.onHardwareMutedChange(function(hardwareMuted) {
                    if(!hardwareMuted) self.#setActiveServer(server);//Set the server as the active one as soon as local client is no longer hardware-muted
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
            
            if(client.isLocalClient()) {
                server.updateLocalClientChannel(to);
            }
            
            logger.log({message: "Client switched Channel", client: client, from: oldChannel, to: to});
        }
    }
    
    /**
     * 
     * @param {Channel} channel The moved Channel
     * @param {Channel | null} parent The parent Channel or null if unchanged
     * @param {number} order The predecessor channel id
     */
    #onChannelMoved(channel, parent, order) {
        channel.updateOrder(order);
        
        const oldParent = channel.getParent();
        if(parent === null) parent = oldParent;//If parent is null, that means that it is unchanged
        
        //Remove and re-add so that order correctly updates
        oldParent.removeSubChannel(channel);
        parent.addSubChannel(channel);
        
        logger.log({message: "Channel moved", channel: channel, oldParent: oldParent, parent: parent, order: order});
    }
    
    /**
     * Updates a Channel with the provided Properties
     * 
     * @param {Channel} channel The Channel to update
     * @param {*} properties The Channel Properties
     */
    #updateChannel(channel, properties) {
        const name = properties.name;
        
        channel.updateName(name);
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
        
        let channelCollectIterations = 0;
        
        while(allChannelInfos.length > 0) {
            if(channelCollectIterations >= 1000) {
                logger.error({message: "Could not collect all Channels. Are they not part of the server tree?", uncollectedChannels: [...allChannelInfos], server: server});
                break;
            }
            
            logger.log({message: "Collecting Channels ...", server: server, remainingChannels: allChannelInfos.length});
            
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
                
                parent.addSubChannel(channel);
                
                const index = allChannelInfos.indexOf(channelInfo);
                if(index === -1) continue;
                allChannelInfos.splice(index, 1);
            }
            
            channelCollectIterations++;
        }
        
        logger.log({message: "Channels collected.", server: server});
        
        //Sort all channels initally to make sure they are in the correct order (they should already be given in the correct order, but you can never be sure enough)
        server.getRootChannel().sortSubChannelsRecursively();
        
        const localClient = server.getLocalClient();
        
        if(localClient !== null) {
            if(!localClient.isHardwareMuted()) this.#setActiveServer(server);//Set this server as the active one if local client is not hardware muted
            
            localClient.onHardwareMutedChange(function(hardwareMuted) {
                if(!hardwareMuted) self.#setActiveServer(server);//Set the server as the active one as soon as local client is no longer hardware-muted
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
            logger.log({message: "Collecting Channels ...", remainingChannels: allChannelInfos.length});
            
            for(const channelInfo of [...allChannelInfos]) {
                const parentId = channelInfo.parentId;
                const parent = server.getChannel(parentId);
                
                if(parent === null) continue;
                
                const channelId = Number.parseInt(channelInfo.id);
                const channelName = channelInfo.properties.name;
                const channelOrder = Number.parseInt(channelInfo.order);
                
                const channel = new Channel(server, channelId, channelName, channelOrder);
                
                parent.addSubChannel(channel);
                
                const index = allChannelInfos.indexOf(channelInfo);
                if(index === -1) continue;
                allChannelInfos.splice(index, 1);
            }
        }
        
        logger.log({message: "Channels collected."});
        
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
        const avatarUrl = readMyTsAvatarURL(properties.myteamspeakAvatar);
        const talking = properties.flagTalking;
        const muted = properties.inputMuted;
        const mutedLocally = properties.isMuted;
        const hardwareMuted = !properties.inputHardware;
        const soundMuted = properties.outputMuted;
        const away = properties.away;
        const awayMessage = properties.awayMessage;
        const talkPower = properties.talkPower;
        
        const client = new Client(server, clientId, clientType, nickname, avatarUrl, talking, muted, mutedLocally, hardwareMuted, soundMuted, away, awayMessage, talkPower);
        
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
        const avatarUrl = readMyTsAvatarURL(properties.myteamspeakAvatar);
        const talking = properties.flagTalking;
        const muted = properties.inputMuted;
        const mutedLocally = properties.isMuted;
        const hardwareMuted = !properties.inputHardware;
        const soundMuted = properties.outputMuted;
        const away = properties.away;
        const awayMessage = properties.awayMessage;
        const talkPower = properties.talkPower;
        
        client.update({
            nickname: nickname,
            avatarUrl: avatarUrl,
            talking: talking,
            muted: muted,
            mutedLocally: mutedLocally,
            hardwareMuted: hardwareMuted,
            soundMuted: soundMuted,
            away: away,
            awayMessage: awayMessage,
            talkPower: talkPower,
        });
    }
}