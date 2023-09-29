import { defaultServerUri, completionItems, completionId } from "./sharedConsts";
import { WsCompletionResponse, WsInfoResponseMessage, WsMessage, WsMessageType } from "./wsMessage";
import * as vscode from 'vscode';
import { Dict } from "../utils";
import WebSocket from "ws";

export class WsConnection {
	private constructor() {}

	private static websocket: WebSocket | undefined = undefined;
	
	public static open(uri: string = defaultServerUri) {
		console.log("[CodeBridge] Connecting to WebSocket server");
		if (WsConnection.websocket !== undefined) WsConnection.websocket.terminate();
		WsConnection.websocket = new WebSocket(uri);

		WsConnection.websocket.on("open", () => {
			// WsConnection.requestInfo();
			vscode.window.showInformationMessage("[CodeBridge] Connected to WebSocket server");
		});

		WsConnection.websocket.on("message", (data: WebSocket.Data) => {
			console.log("[CodeBridge] [🔻] " + data.toString());
			const message = WsMessage.parse(data.toString());
			if (message.type === WsMessageType.INFO_RESPONSE) {
				const data = message.data as WsInfoResponseMessage;
				// if (Object.prototype.hasOwnProperty.call(message.data, "player_name")) {
				let infoString: string = `Connected as ${data.player_name}.\n`;
				infoString += `Minecraft ${data.game_version} (Pack format: ${data.datapack_version})`;
				vscode.window.showInformationMessage("[CodeBridge] " + infoString);
				console.log("[CodeBridge] " + infoString);
			}

			if (message.type === WsMessageType.COMPLETION_RESPONSE) {
				const data = message.data as WsCompletionResponse;
				completionItems.set(message.id, data.suggestions as string[]);
				// console.log('Received completions: ' + data.suggestions);
			}

			if (message.type === WsMessageType.ERROR) {
				vscode.window.showInformationMessage("[CodeBridge] error: " + message.getErrorMessage());
				console.log("[CodeBridge] error: " + message.data);
			}
		});


		WsConnection.websocket.on("close", () => {
			vscode.window.showInformationMessage("[CodeBridge] Disconnected from WebSocket server");
			console.log("[CodeBridge] Disconnected from WebSocket server");
		});
	}


	public static isOpen(): boolean {
		return WsConnection.websocket !== undefined && WsConnection.websocket.readyState === WebSocket.OPEN;
	}

	public static send(ws: WsMessage): void {
		if (!WsConnection.isOpen()) {
			throw new Error("Websocket is not open");
		}
		console.log("[CodeBridge] [🔺] " + ws.toString());
		WsConnection.websocket?.send(ws.toString());
	}

	public static close() {
		WsConnection.websocket?.close();
	}

	public static requestInfo(): void {
		const request = new WsMessage(completionId.incrementAndGet(), WsMessageType.INFO_REQUEST, new Dict<string, any>());
		WsConnection.send(request);
	}

	public static requestCompletions(command: string, cursor: number): number {
		const request = WsMessage.completionRequest(command, cursor);
		WsConnection.send(request);
		return request.id;
	}

	public static async waitForCompletionResponse(id: number, timeout: number = 1000): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			const startTime = Date.now();
			const interval = setInterval(() => {
				if (completionItems.has(id)) {
					clearInterval(interval);
					resolve(completionItems.get(id) as string[]);
					completionItems.delete(id);
				}
				if (Date.now() - startTime > timeout) {
					clearInterval(interval);
					reject(new Error("Timeout"));
				}
			}, 50);
		});
	}
}