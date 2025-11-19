<script lang="ts">
    import type { Status } from "$lib";
    import { formatTime } from "$lib";
    import { ChevronRightIcon } from "@lucide/svelte";
    import { Menu, Portal } from "@skeletonlabs/skeleton-svelte";
    import StatusIcon from "./StatusIcon.svelte";
    import { setStatus } from "$lib/stores.svelte";

    let {
        option,
    }: {
        option: Status;
    } = $props();

    const clearTimes = [0.1, 1, 15, 60, 180, 1440]; // in minutes
    const handleClearTimeSelect = (minutes: number) => {
        const duration = minutes * 60000;
        setStatus(option, duration);
    };
</script>

<Menu>
    <Menu.TriggerItem value={option}>
        <Menu.ItemText class="pr-4"><StatusIcon status={option} /></Menu.ItemText>
        <Menu.ItemIndicator>
            <ChevronRightIcon class="size-4" />
        </Menu.ItemIndicator>
    </Menu.TriggerItem>
    <Portal>
        <Menu.Positioner>
            <Menu.Content class="min-w-0">
                {#each clearTimes as minutes (minutes)}
                    <Menu.Item
                        value={minutes.toString()}
                        onclick={() => {
                            handleClearTimeSelect(minutes);
                        }}
                        class="pr-4"
                    >
                        <Menu.ItemText>For {formatTime(minutes * 60000)}</Menu.ItemText>
                    </Menu.Item>
                {/each}
                <Menu.Separator />
                <Menu.Item
                    value="until-cleared"
                    onclick={() => {
                        handleClearTimeSelect(0);
                    }}
                    class="pr-4"
                >
                    <Menu.ItemText>Forever</Menu.ItemText>
                </Menu.Item>
            </Menu.Content>
        </Menu.Positioner>
    </Portal>
</Menu>
