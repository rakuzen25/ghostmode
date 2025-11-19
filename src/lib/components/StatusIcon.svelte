<script lang="ts">
    import type { Status, TextPriority } from "$lib";
    import { formatTime, getColor } from "$lib";

    let {
        status,
        expiry = 0,
    }: {
        status: Status | TextPriority;
        expiry?: number;
    } = $props();

    let color = $derived(getColor(status));
    let timeLeft = $state("");

    $effect(() => {
        if (expiry <= 0) {
            timeLeft = "";
            return;
        }

        const update = () => {
            const msLeft = expiry - Date.now() + 1000;
            timeLeft = msLeft > 0 ? formatTime(msLeft) : "";
        };
        update();
        const interval = setInterval(update, 1000);
        return () => {
            clearInterval(interval);
        };
    });
</script>

<span class="space-x-1.5"
    ><!----><span class="inline-block size-[0.75em] rounded-full {color[0]}"></span><!----><span class={color[1]}
        >{status}{timeLeft ? ` (${timeLeft})` : ""}</span
    ><!----></span
>
