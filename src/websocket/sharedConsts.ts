import { Suggestion } from "../data/suggestion";
import { AtomicInteger } from "../utils";

export const defaultServerUri = "ws://localhost:59039";	
export const completionId = new AtomicInteger();
export const completionItems = new Map<number, Suggestion[]>();


export function getCompletions(id: number): Suggestion[] {
	return completionItems.get(id) || [];
}