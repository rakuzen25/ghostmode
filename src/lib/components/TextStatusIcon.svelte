<script lang="ts">
    import { TextStatus } from "$lib";
    import { BellRingIcon, CircleAlertIcon, EyeIcon, MoonIcon, SendHorizontalIcon } from "@lucide/svelte";

    let {
        status,
        color = "text-surface-500",
        className = "",
    }: {
        status: TextStatus;
        color?: string;
        className?: string;
    } = $props();

    const iconMap = {
        [TextStatus.Sending]: SendHorizontalIcon,
        [TextStatus.Failed]: CircleAlertIcon,
        [TextStatus.Delivered]: MoonIcon,
        [TextStatus.Notified]: BellRingIcon,
        [TextStatus.Read]: EyeIcon,
    } as const;
</script>

{#if iconMap[status]}
    {@const Icon = iconMap[status]}
    <Icon class="block size-4 {color} {className}" />
{/if}
