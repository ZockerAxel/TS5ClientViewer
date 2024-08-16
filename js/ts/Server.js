//@ts-check
import Channel, { RootChannel } from "./Channel.js";
import Client from "./Client.js";

export default class Server {
    #id;
    /**@type {Client | null} */
    #localClient = null;
    #localClientId;
    
    #rootChannel;
    
    /**@type {((channel: Channel) => void)[]} */
    #localClientMoveCallbacks = [];
    /**@type {(() => void)[]} */
    #deleteCallbacks = [];
    
    /**@type {*[]} */
    #rememberedMovePayloads = []
    
    /**
     * Creates a Server, represents a Connection to a TeamSpeak Server and contains all channels and connected clients.
     * 
     * @param {number} id Connection ID
     * @param {number} localClientId The Local Client
     * @param {string} name The Server Name
     */
    constructor(id, localClientId, name) {
        this.#id = id;
        this.#localClientId = localClientId;
        this.#rootChannel = new RootChannel(this, name);
    }
    
    getId() {
        return this.#id;
    }
    
    getName() {
        return this.#rootChannel.getName();
    }
    
    getLocalClient() {
        if(!this.#localClient) this.#localClient = this.getClient(this.#localClientId);
        return this.#localClient;
    }
    
    getRootChannel() {
        return this.#rootChannel;
    }
    
    /**
     * Searches for the Channel by the specified ID
     * 
     * @param {number} id The Channel ID
     * @returns {Channel | null} The Channel. Returns null if no channel matching the provided ID was found.
     */
    getChannel(id) {
        return this.#rootChannel.getChannel(id);
    }
    
    /**
     * Searches for the Client by the specified ID in this Channel and all it's nested subchannels
     * 
     * @param {number} id The Client ID
     * @returns {Client | null} The Client. Returns null if no client matching the provided ID was found.
     */
    getClient(id) {
        return this.#rootChannel.getClient(id);
    }
    
    /**
     * 
     * @param {(channel: Channel) => void} callback 
     */
    onLocalClientMoved(callback) {
        this.#localClientMoveCallbacks.push(callback);
    }
    
    /**
     * 
     * @param {Channel} channel The Channel moved into
     */
    updateLocalClientChannel(channel) {
        for(const callback of this.#localClientMoveCallbacks) {
            callback(channel);
        }
    }
    
    /**
     * Remember a Move Payload
     * 
     * @param {*} payload The Payload
     */
    rememberMovePayload(payload) {
        this.#rememberedMovePayloads.push(payload);
    }
    
    getAndResetRememberedMovePayloads() {
        return this.#rememberedMovePayloads;
    }
    
    /**
     * 
     * @param {() => void} callback 
     */
    onDelete(callback) {
        this.#deleteCallbacks.push(callback);
    }
    
    delete() {
        for(const callback of this.#deleteCallbacks) {
            callback();
        }
        
        this.#rootChannel.deleteSubChannelsRecursively();
    }
    
    toTreeString() {
        return this.#rootChannel.toTreeString();
    }
}