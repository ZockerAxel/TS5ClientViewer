//@ts-check
import Server from "./Server.js";

export default class Client {
    #server;
    
    //Info
    #id;
    #type;
    #nickname;
    #avatarUrl;
    
    //Status
    #talking;
    
    #muted;
    #hardwareMuted;
    #soundMuted;
    #away;
    #awayMessage;
    
    #talkPower;
    
    //Callback Lists
    /**@type {((newValue: string) => void)[]} */
    #nicknameUpdateCallbacks = [];
    /**@type {((newValue: string | null) => void)[]} */
    #avatarUrlUpdateCallbacks = [];
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
    /**@type {((newValue: number) => void)[]} */
    #talkPowerUpdateCallbacks = [];
    
    /**
     * Creates a new Client, which represents a Client in the TeamSpeak Server Tree
     * 
     * @param {Server} server The Server that this Client belongs to
     * @param {number} id Client ID
     * @param {number} type Client Type (0 = Client, 1 = ServerQuery Client)
     * @param {string} nickname Client Nickname
     * @param {string | null} avatarUrl The Avatar URL (from myTeamspeak-Avatar)
     * @param {boolean} talking Whether the client is currently talking
     * @param {boolean} muted Whether the client is currently muted
     * @param {boolean} hardwareMuted Whether the client is currently hardware-muted
     * @param {boolean} soundMuted Whether the client is currently deaf
     * @param {boolean} away Whether the client is away
     * @param {string} awayMessage The away message (if they are away)
     * @param {number} talkPower The talk power (affects client order)
     */
    constructor(server, id, type, nickname, avatarUrl, talking, muted, hardwareMuted, soundMuted, away, awayMessage, talkPower) {
        this.#server = server;
        
        this.#id = id;
        this.#type = type;
        this.#nickname = nickname;
        this.#avatarUrl = avatarUrl;
        
        this.#talking = talking;
        
        this.#muted = muted;
        this.#hardwareMuted = hardwareMuted;
        this.#soundMuted = soundMuted;
        this.#away = away;
        this.#awayMessage = awayMessage;
        
        this.#talkPower = talkPower;
    }
    
    /**
     * 
     * @param {{nickname?: string, avatarUrl?: string | null, talking?: boolean, muted?: boolean, hardwareMuted?: boolean, soundMuted?: boolean, away?: boolean, awayMessage?: string, talkPower?: number}} param0 
     */
    update({nickname = this.#nickname, avatarUrl = this.#avatarUrl, talking = this.#talking, muted = this.#muted, hardwareMuted = this.#hardwareMuted, soundMuted = this.#soundMuted, away = this.#away, awayMessage = this.#awayMessage, talkPower = this.#talkPower}) {
        this.updateNickname(nickname);
        this.updateAvatarUrl(avatarUrl);
        this.updateTalking(talking);
        this.updateMuted(muted);
        this.updateHardwareMuted(hardwareMuted);
        this.updateSoundMuted(soundMuted);
        this.updateAway(away, awayMessage);
        this.updateTalkPower(talkPower);
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
    
    isLocalClient() {
        return this.#server.getLocalClient() === this;
    }
    
    getType() {
        return this.#type;
    }
    
    /**
     * 
     * @param {(newValue: boolean) => void} callback The callback function
     */
    onStatusChanged(callback) {
        this.onTalkingChange(callback);
        this.onMutedChange(callback);
        this.onHardwareMutedChange(callback);
        this.onSoundMutedChange(callback);
        this.onAwayChange(callback);
    }
    
    /**
     * 
     * @param {string} nickname The new nickname
     */
    updateNickname(nickname) {
        const changed = this.#nickname !== nickname;
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
     * @param {string | null} avatarUrl The new nickname
     */
    updateAvatarUrl(avatarUrl) {
        const changed = this.#avatarUrl !== avatarUrl;
        this.#avatarUrl = avatarUrl;
        
        if(changed) {
            for(const callback of this.#avatarUrlUpdateCallbacks) {
                callback(avatarUrl);
            }
        }
    }
    
    /**
     * 
     * @param {(newValue: string | null) => void} callback The callback function
     */
    onAvatarUrlChange(callback) {
        this.#avatarUrlUpdateCallbacks.push(callback);
    }
    
    getAvatarUrl() {
        return this.#avatarUrl;
    }
    
    /**
     * 
     * @param {boolean} talking The new value
     */
    updateTalking(talking) {
        const changed = this.#talking !== talking;
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
        const changed = this.#muted !== muted;
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
        const changed = this.#hardwareMuted !== hardwareMuted;
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
        const changed = this.#soundMuted !== soundMuted;
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
        const changed = this.#away !== away || this.#awayMessage !== awayMessage;
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
     * @param {(newValue: boolean, message: string) => void} callback The callback function
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
    
    /**
     * 
     * @param {number} talkPower The new value
     */
    updateTalkPower(talkPower) {
        const changed = this.#talkPower !== talkPower;
        this.#talkPower = talkPower;
        
        if(changed) {
            for(const callback of this.#talkPowerUpdateCallbacks) {
                callback(talkPower);
            }
        }
    }
    
    /**
     * 
     * @param {(newValue: number) => void} callback The callback function
     */
    onTalkPowerChange(callback) {
        this.#talkPowerUpdateCallbacks.push(callback);
    }
    
    getTalkPower() {
        return this.#talkPower;
    }
}