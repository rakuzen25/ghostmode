import { browser } from "$app/environment";
import superjson from "superjson";

export class PersistedState<T> {
    value = $state<T>() as T;
    key: string;
    initialValue: T;

    constructor(key: string, initialValue: T) {
        this.key = key;
        this.initialValue = initialValue;

        let data = initialValue;
        if (browser) {
            const stored = localStorage.getItem(key);
            if (stored) {
                try {
                    data = superjson.parse(stored);
                } catch (e) {
                    console.warn(`Failed to parse storage for key "${key}"`, e);
                }
            }
        }
        this.value = data;

        if (browser) {
            $effect.root(() => {
                $effect(() => {
                    const data = superjson.stringify(this.value);
                    localStorage.setItem(this.key, data);
                });
            });
        }
    }

    reset() {
        this.value = this.initialValue;
    }
}
