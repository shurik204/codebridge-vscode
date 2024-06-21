import { completionId, completionItems } from "./shared_consts";
import { Dict } from "../utils";
import { Suggestion } from "../data/suggestion";

export enum WsMessageType {
	INFO_REQUEST = "INFO_REQUEST",
	INFO_RESPONSE = "INFO_RESPONSE",
	COMPLETION_REQUEST = "COMPLETION_REQUEST",
	COMPLETION_RESPONSE = "COMPLETION_RESPONSE",
	ERROR = "ERROR"
}

export class WsMessage {
	public id: number;
	public type: WsMessageType;
	public data: Dict<string, any>;

	constructor(id: number, type: WsMessageType, data: Dict<string, any> | null) {
		this.id = id;
		this.type = type;
		this.data = data ?? new Dict<string, any>();
	}
	
	public toString(): string {
		return JSON.stringify({ 'id': this.id, 'type': this.type, 'data': this.data });
	}

	public getErrorMessage(): string {
		if (this.type !== WsMessageType.ERROR) {
			throw new Error("Tried to get message from non-error WsMessage");
		}
		const data = this.data as WsErrorMessage;
		return data.error_message;
	}

	public static parse(str: string): WsMessage {
        const json = JSON.parse(str);
		const type = json.type as WsMessageType;
		if (type === undefined) {
			throw new Error("Invalid message type: " + json.type);
		}
		return new WsMessage(json.id, json.type, json.data);
    }

	public static completionRequest(command: string, cursor: number): WsMessage {
		const data = new Dict<string, any>();
		data.set('command', command);
		data.set('cursor', cursor);
		return new WsMessage(completionId.incrementAndGet(), WsMessageType.COMPLETION_REQUEST, data);
	}
}


export class WsInfoResponseMessage extends Dict<string, any> {
	public player_name: string = "";
	public game_version: string = "";
	public datapack_version: string = "";
	public is_singleplayer: boolean = false;
}

export class WsCompletionResponse extends Dict<string, any> {
	public suggestions: Suggestion[] = [];
}

export class WsErrorMessage extends Dict<string, any> {
	public error_message: string = "";
}