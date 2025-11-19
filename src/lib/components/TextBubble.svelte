<script lang="ts">
    import { type ChatMessage, getColor } from "$lib";

    let {
        message,
    }: {
        message: ChatMessage;
    } = $props();
    const color = $derived(getColor(message.priority)[0]);
    const direction = message.senderId === 0 ? "right" : "left";
</script>

<div class="flex items-end" class:justify-end={direction === "right"}>
    <div
        class="max-w-[70%] rounded-2xl px-4 py-2 text-white {color}"
        class:rounded-br-none={direction === "right"}
        class:rounded-bl-none={direction === "left"}
    >
        {message.content}
    </div>
</div>
