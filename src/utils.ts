export class AtomicInteger {
    private value: number;
	
	constructor(value: number = 0) {
		this.value = value;
	}

	public incrementAndGet(): number {
		return ++this.value;
	}

	public getAndIncrement(): number {
		return this.value++;
	}

	public get(): number {
		return this.value;
	}
}

export class Dict<K,V> extends Map<K,V> {
	public toJSON(): this {
		return Object.fromEntries(this);
	}
}