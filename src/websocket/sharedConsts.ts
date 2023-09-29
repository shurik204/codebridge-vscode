import { AtomicInteger } from "../utils";

export const defaultServerUri = "ws://localhost:51039";
export const completionId = new AtomicInteger();
export const completionItems = new Map<number, string[]>();


export function getCompletions(id: number): string[] {
	return completionItems.get(id) || [];
}