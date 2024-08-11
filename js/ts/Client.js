//@ts-check
import Server from "./Server.js";

export default class Client {
    #server;
    
    //Info
    #id;
    #type;
    #nickname;
    
    //Status
    #talking;
    
    #muted;
    #hardwareMuted;
    #soundMuted;
    #away;
    #awayMessage;
    
    //Callback Lists
    /**@type {((newValue: string) => void)[]} */
    #nicknameUpdateCallbacks = [];
    /**@type {((newValue: boolean) => void)[]} */
    #talkingUpdateCallbacks = [];
    /**@type {((newValue: boolean) => void)[]} */
    #mutedUpdateCallbacks = [];
    /**@type {((newValue: boolean) => void)[]} */
    #hardwareMutedUpdateCallbacks = [];
    /**@type {((newValue: boolean) => void)[]} */
    #soundMutedUpdateCallbacks = [];
    /**@type {((newValue: boolean, message: string) => void)[]} */
    #awayUpdateCallbacks = [];
    
    /**
     * Creates a new Client, which represents a Client in the TeamSpeak Server Tree
     * 
     * @param {Server} server The Server that this Client belongs to
     * @param {number} id Client ID
     * @param {number} type Client Type (0 = Client, 1 = ServerQuery Client)
     * @param {string} nickname Client Nickname
     * @param {boolean} talking Whether the client is currently talking
     * @param {boolean} muted Whether the client is currently muted
     * @param {boolean} hardwareMuted Whether the client is currently hardware-muted
     * @param {boolean} soundMuted Whether the client is currently deaf
     * @param {boolean} away Whether the client is away
     * @param {string} awayMessage The away message (if they are away)
     */
    constructor(server, id, type, nickname, talking, muted, hardwareMuted, soundMuted, away, awayMessage) {
        this.#server = server;
        
        this.#id = id;
        this.#type = type;
        this.#nickname = nickname;
        
        this.#talking = talking;
        
        this.#muted = muted;
        this.#hardwareMuted = hardwareMuted;
        this.#soundMuted = soundMuted;
        this.#away = away;
        this.#awayMessage = awayMessage;
    }
    
    getServer() {
        return this.#server;
    }
    
    getChannel() {
        return this.#server.getRootChannel().getClientChannel(this);
    }
    
    getId() {
        return this.#id;
    }
    
    getType() {
        return this.#type;
    }
    
    /**
     * 
     * @param {string} nickname The new nickname
     */
    updateNickname(nickname) {
        const changed = this.#nickname === nickname;
        this.#nickname = nickname;
        
        if(changed) {
            for(const callback of this.#nicknameUpdateCallbacks) {
                callback(nickname);
            }
        }
    }
    
    /**
     * 
     * @param {(newValue: string) => void} callback The callback function
     */
    onNicknameChange(callback) {
        this.#nicknameUpdateCallbacks.push(callback);
    }
    
    getNickname() {
        return this.#nickname;
    }
    
    /**
     * 
     * @param {boolean} talking The new value
     */
    updateTalking(talking) {
        const changed = this.#talking === talking;
        this.#talking = talking;
        
        if(changed) {
            for(const callback of this.#talkingUpdateCallbacks) {
                callback(talking);
            }
        }
    }
    
    /**
     * 
     * @param {(newValue: boolean) => void} callback The callback function
     */
    onTalkingChange(callback) {
        this.#talkingUpdateCallbacks.push(callback);
    }
    
    isTalking() {
        return this.#talking;
    }
    
    /**
     * 
     * @param {boolean} muted The new value
     */
    updateMuted(muted) {
        const changed = this.#muted === muted;
        this.#muted = muted;
        
        if(changed) {
            for(const callback of this.#mutedUpdateCallbacks) {
                callback(muted);
            }
        }
    }
    
    /**
     * 
     * @param {(newValue: boolean) => void} callback The callback function
     */
    onMutedChange(callback) {
        this.#mutedUpdateCallbacks.push(callback);
    }
    
    isMuted() {
        return this.#muted;
    }
    
    /**
     * 
     * @param {boolean} hardwareMuted The new value
     */
    updateHardwareMuted(hardwareMuted) {
        const changed = this.#hardwareMuted === hardwareMuted;
        this.#hardwareMuted = hardwareMuted;
        
        if(changed) {
            for(const callback of this.#hardwareMutedUpdateCallbacks) {
                callback(hardwareMuted);
            }
        }
    }
    
    /**
     * 
     * @param {(newValue: boolean) => void} callback The callback function
     */
    onHardwareMutedChange(callback) {
        this.#hardwareMutedUpdateCallbacks.push(callback);
    }
    
    isHardwareMuted() {
        return this.#hardwareMuted;
    }
    
    /**
     * 
     * @param {boolean} soundMuted The new value
     */
    updateSoundMuted(soundMuted) {
        const changed = this.#soundMuted === soundMuted;
        this.#soundMuted = soundMuted;
        
        if(changed) {
            for(const callback of this.#soundMutedUpdateCallbacks) {
                callback(soundMuted);
            }
        }
    }
    
    /**
     * 
     * @param {(newValue: boolean) => void} callback The callback function
     */
    onSoundMutedChange(callback) {
        this.#soundMutedUpdateCallbacks.push(callback);
    }
    
    isSoundMuted() {
        return this.#soundMuted;
    }
    
    /**
     * 
     * @param {boolean} away The new value
     * @param {string} awayMessage The new away message
     */
    updateAway(away, awayMessage) {
        const changed = this.#away === away && this.#awayMessage === awayMessage;
        this.#away = away;
        this.#awayMessage = awayMessage;
        
        if(changed) {
            for(const callback of this.#awayUpdateCallbacks) {
                callback(away, awayMessage);
            }
        }
    }
    
    /**
     * 
     * @param {(newValue: boolean) => void} callback The callback function
     */
    onAwayChange(callback) {
        this.#awayUpdateCallbacks.push(callback);
    }
    
    isAway() {
        return this.#away;
    }
    
    getAwayMessage() {
        return this.#awayMessage;
    }
}