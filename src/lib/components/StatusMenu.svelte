<script lang="ts">
    import { Status } from "$lib";
    import { Menu, Portal } from "@skeletonlabs/skeleton-svelte";
    import StatusClearMenu from "./StatusClearMenu.svelte";
    import StatusHelp from "./StatusHelpDialog.svelte";
    import StatusIcon from "./StatusIcon.svelte";
    import { clearStatus, statusStore } from "$lib/stores.svelte";

    let openHelp = false;
</script>

<Menu positioning={{ placement: "bottom-end" }}>
    <Menu.Trigger class="btn hover:preset-tonal">
        <StatusIcon status={statusStore.value.status} expiry={statusStore.value.expiry} />
    </Menu.Trigger>
    <Portal>
        <Menu.Positioner>
            <Menu.Content class="min-w-0">
                {#each Object.values(Status) as option (option)}
                    {#if option === Status.Online}
                        <Menu.Item onclick={clearStatus} value={option}>
                            <Menu.ItemText>
                                <StatusIcon status={option} />
                            </Menu.ItemText>
                        </Menu.Item>
                    {:else}
                        <StatusClearMenu {option} />
                    {/if}
                {/each}
                <Menu.Separator />
                <Menu.Item value="help" onclick={() => (openHelp = true)}>
                    <Menu.ItemText class="text-sm text-surface-500 italic">Help</Menu.ItemText>
                    <StatusHelp open={openHelp} />
                </Menu.Item>
            </Menu.Content>
        </Menu.Positioner>
    </Portal>
</Menu>
