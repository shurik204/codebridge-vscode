import { WsConnection } from './websocket/ws_connection';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('[CodeBridge] Activated');
	WsConnection.open();

	const mcfunctionProvider = vscode.languages.registerCompletionItemProvider('mcfunction', {
		async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
			if (!WsConnection.isOpen()) {
				return undefined;
			}

			const requestId = WsConnection.requestCompletions(document.lineAt(position).text.slice(0, position.character), position.character);
			try {
				// Asynchronously wait for the response
				const completionItems = await WsConnection.waitForCompletionResponse(requestId);
				return completionItems.map((item) => {
					// const completionItem = new vscode.CompletionItem(item.text, vscode.CompletionItemKind.Property);
					// completionItem.insertText = new vscode.SnippetString(item);				
					return item.toCompletionItem();
				});
			} catch (e) {
				return undefined;
			}
		}
	},
	' ', '.', ',', '"', '=', ':', '[', ']', '{', '}');

	context.subscriptions.push(mcfunctionProvider);
}
	

export function deactivate() { 
	if (WsConnection.isOpen()) {
		WsConnection.close();
	}
}