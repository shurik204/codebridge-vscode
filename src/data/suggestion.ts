import * as vscode from 'vscode';

export class Suggestion {
	constructor(
		public readonly text: string,
		public readonly tooltip: string | undefined
	) {}

	public static fromObject(obj?: any): Suggestion {
		if (obj === undefined) {
			throw new Error("Cannot create Suggestion from undefined");
		}
		return new Suggestion(obj.text, obj.tooltip);
	}

	public toString(): string {
		return this.text;
	}

	public toCompletionItem(): vscode.CompletionItem {
		const completionItem = new vscode.CompletionItem(this.text, vscode.CompletionItemKind.Property);
		if (this.tooltip) {
			completionItem.documentation = new vscode.MarkdownString(this.tooltip);
			// completionItem.detail = this.tooltip;
		}	
		return completionItem;
	}
}					