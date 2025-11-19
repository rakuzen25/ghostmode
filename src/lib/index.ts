/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
// place files you want to import through the `$lib` alias in this folder.

import type { SvelteDate } from "svelte/reactivity";

export enum Status {
    Online = "Online",
    Focus = "Focus",
    Shielded = "Shielded",
}

export enum TextPriority {
    Normal = "Normal",
    Prioritized = "Prioritized",
    Urgent = "Urgent",
}

export enum TextStatus {
    Sending = "Sending",
    Failed = "Failed",
    Delivered = "Delivered",
    Notified = "Notified",
    Read = "Read",
}

export interface Chat {
    name: string;
    channel: string;
    type: "direct" | "group";
    avatar: string;
}

export interface ChatMessage {
    senderId: number;
    content: string;
    timestamp: SvelteDate;
    priority: TextPriority | "typing";
    status: TextStatus;
    color?: string;
}

export const getColor = (status: Status | TextPriority | string) => {
    switch (status) {
        case Status.Online:
        case TextPriority.Normal:
            return ["bg-success-700-300", "text-success-700-300", ""];
        case Status.Focus:
        case TextPriority.Prioritized:
            return ["bg-warning-700-300", "text-warning-700-300", "bg-warning-700-300/10"];
        case Status.Shielded:
        case TextPriority.Urgent:
            return ["bg-error-700-300", "text-error-700-300", "bg-error-700-300/10"];
        default:
            return ["bg-surface-300-700", "text-surface-500"];
    }
};

export const getMaxPriority = (messages: ChatMessage[]): TextPriority => {
    if (messages.some((m) => m.priority === TextPriority.Urgent)) {
        return TextPriority.Urgent;
    }
    if (messages.some((m) => m.priority === TextPriority.Prioritized)) {
        return TextPriority.Prioritized;
    }
    return TextPriority.Normal;
};

export const formatTime = (ms: number) => {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const displayMinutes = minutes % 60;
    const displaySeconds = seconds % 60;
    if (hours > 0) {
        return `${hours}h${displayMinutes > 0 ? `${displayMinutes}m` : ""}${displaySeconds > 0 ? `${displaySeconds}s` : ""}`;
    } else if (displayMinutes > 0) {
        return `${displayMinutes}m${displaySeconds > 0 ? `${displaySeconds}s` : ""}`;
    }
    return `${displaySeconds}s`;
};

export const formatTimestamp = (timestamp: Date): string => {
    if (typeof timestamp.getTime !== "function" || isNaN(timestamp.getTime())) {
        return "";
    }

    const date = new Date(timestamp);
    const now = new Date();

    const timeStr = date
        .toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })
        .toLowerCase();

    const isSameDay = (d1: Date, d2: Date) =>
        d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

    if (isSameDay(date, now)) {
        return timeStr;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (isSameDay(date, yesterday)) {
        return `Yesterday ${timeStr}`;
    }

    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    if (date > oneWeekAgo) {
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
        return `${dayName} ${timeStr}`;
    }

    if (date.getFullYear() === now.getFullYear()) {
        const datePart = date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
        return `${datePart} at ${timeStr}`;
    }

    const fullDatePart = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return `${fullDatePart} at ${timeStr}`;
};
