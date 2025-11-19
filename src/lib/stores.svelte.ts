import { browser } from "$app/environment";
import { type Chat, Status } from "$lib";
import { type ChatMessage, TextPriority, TextStatus } from "$lib";
import { SvelteDate } from "svelte/reactivity";
import { PersistedState } from "./persisted.svelte";

const yesterday = new SvelteDate();
yesterday.setDate(yesterday.getDate() - 1);

export const statusStore = new PersistedState<{
    status: Status;
    expiry: number;
    startTime: number;
}>("status", {
    status: Status.Online,
    expiry: 0,
    startTime: 0,
});

// Convert catchUpStore to PersistedState
export const catchUpStore = new PersistedState<{
    oldStatus: Status;
    isOpen: boolean;
    messages: Record<number, ChatMessage[]>;
    duration: number;
}>("catchUp", {
    oldStatus: Status.Online,
    isOpen: false,
    messages: {},
    duration: 0,
});

export const clearStatus = () => {
    const current = statusStore.value;

    if (current.status !== Status.Online && current.startTime > 0) {
        const now = Date.now();
        const duration = now - current.startTime;

        const messages: Record<number, ChatMessage[]> = {};
        Object.entries(chatHistoryStore.value).forEach(([chatId, history]) => {
            const missedMessages = history.filter(({ timestamp, senderId, status }) => {
                const msgTime = timestamp.getTime();
                return senderId !== 0 && msgTime >= current.startTime && msgTime <= now && status !== TextStatus.Read;
            });
            if (missedMessages.length > 0) {
                messages[+chatId] = missedMessages;
            }
        });

        if (Object.keys(messages).length > 0) {
            catchUpStore.value.oldStatus = current.status;
            catchUpStore.value.messages = messages;
            catchUpStore.value.duration = duration;
            catchUpStore.value.isOpen = true;
        }
    }

    statusStore.value.status = Status.Online;
    statusStore.value.expiry = 0;
    statusStore.value.startTime = 0;
};

export const setStatus = (status: Status, durationMs = 0) => {
    statusStore.value.status = status;
    statusStore.value.startTime = statusStore.value.startTime || Date.now();
    statusStore.value.expiry = durationMs > 0 ? Date.now() + durationMs : 0;
};

if (browser) {
    $effect.root(() => {
        $effect(() => {
            const { expiry, status } = statusStore.value;
            if (expiry > 0 && status !== Status.Online) {
                const now = Date.now();
                const ms = expiry - now;
                if (ms <= 0) {
                    clearStatus();
                    return;
                }
                const timeoutId = setTimeout(clearStatus, ms);
                return () => {
                    clearTimeout(timeoutId);
                };
            }
        });

        // Simulation effect for demo purposes
        $effect(() => {
            if (statusStore.value.status !== Status.Online) {
                const timeout1 = setTimeout(() => {
                    if (statusStore.value.status !== Status.Online) {
                        chatHistoryStore.value[2].push({
                            senderId: 2,
                            content: "u there",
                            timestamp: new SvelteDate(),
                            priority: TextPriority.Prioritized,
                            status: statusStore.value.status !== Status.Shielded ? TextStatus.Notified : TextStatus.Delivered,
                        });
                    }
                }, 1000);
                const timeout2 = setTimeout(() => {
                    if (statusStore.value.status !== Status.Online) {
                        chatHistoryStore.value[2].push({
                            senderId: 2,
                            content: "i need this in the next minute",
                            timestamp: new SvelteDate(),
                            priority: TextPriority.Urgent,
                            status: TextStatus.Notified,
                        });
                    }
                }, 5000);
                return () => {
                    clearTimeout(timeout1);
                    clearTimeout(timeout2);
                };
            }
        });
    });
}

export const chatStore = new PersistedState<Record<number, Chat>>("chats", {
    1: {
        name: "Mom",
        channel: "WhatsApp",
        type: "direct",
        avatar: "https://live.staticflickr.com/2928/14046376667_a2686bcc7a_q.jpg",
    },
    2: {
        name: "Frank",
        channel: "iMessage",
        type: "direct",
        avatar: "",
    },
    3: {
        name: "CS 330",
        channel: "iMessage",
        type: "group",
        avatar: "https://live.staticflickr.com/2154/5734993652_d4a2ee8778_q.jpg",
    },
});

export const chatHistoryStore = new PersistedState<Record<number, ChatMessage[]>>("history", {
    1: [
        {
            senderId: 1,
            content: "Love you too!",
            timestamp: new SvelteDate(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 9, 41, 0),
            priority: TextPriority.Normal,
            status: TextStatus.Read,
        },
    ],
    2: [
        {
            senderId: 2,
            content: "send pics later",
            timestamp: new SvelteDate(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 9, 20, 0),
            priority: TextPriority.Normal,
            status: TextStatus.Read,
        },
        {
            senderId: 0,
            content: "sure",
            timestamp: new SvelteDate(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 9, 36, 0),
            priority: TextPriority.Normal,
            status: TextStatus.Read,
        },
    ],
    3: [
        {
            senderId: 1,
            content: "got it, thx",
            timestamp: new SvelteDate(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 8, 47, 0),
            priority: TextPriority.Normal,
            status: TextStatus.Read,
        },
    ],
});

export const contactStatusStore = new PersistedState<Record<number, Status | "offline" | undefined>>("contactStatus", {
    1: "offline",
    2: Status.Online,
    3: undefined,
});

export const resetAllStores = () => {
    chatStore.reset();
    statusStore.reset();
    chatHistoryStore.reset();
    contactStatusStore.reset();
    catchUpStore.reset();
};
