<script lang="ts">
    import { resolve } from "$app/paths";
    import StatusSwitch from "$lib/components/StatusMenu.svelte";
    import { GhostIcon, MenuIcon } from "@lucide/svelte";
    import { AppBar, Avatar, Progress } from "@skeletonlabs/skeleton-svelte";

    import { formatTimestamp, getColor, getMaxPriority, Status, TextPriority, TextStatus } from "$lib";
    import Fab from "$lib/components/Fab.svelte";
    import TextStatusIcon from "$lib/components/TextStatusIcon.svelte";
    import { chatHistoryStore, chatStore, contactStatusStore, resetAllStores, statusStore } from "$lib/stores.svelte";
    import { SvelteDate } from "svelte/reactivity";
    import StatusIcon from "$lib/components/StatusIcon.svelte";
    import { fade, fly } from "svelte/transition";
    import CatchUpDialog from "$lib/components/CatchUpDialog.svelte";
    import { onMount } from "svelte";

    let mounted = $state(false);
    onMount(() => {
        mounted = true;
    });

    let chats = $derived(
        Object.entries(chatStore.value)
            .map(([id, chat]) => {
                const history = chatHistoryStore.value[+id] ?? [];
                const lastMessage = history.slice(-1)[0] ?? {
                    content: "",
                    timestamp: new SvelteDate(NaN),
                    priority: TextPriority.Normal,
                    status: TextStatus.Read,
                };
                const unreadMessages = history.filter((msg) => msg.senderId !== 0 && msg.status !== TextStatus.Read);
                return {
                    ...chat,
                    id: +id,
                    lastMessage,
                    unreads: unreadMessages.length,
                    maxPriority: getMaxPriority(unreadMessages),
                    status: contactStatusStore.value[+id],
                };
            })
            .filter(({ maxPriority }) => {
                const status = statusStore.value.status;
                if (status === Status.Focus) {
                    return maxPriority !== TextPriority.Normal;
                }
                if (status === Status.Shielded) {
                    return maxPriority === TextPriority.Urgent;
                }
                return true;
            })
            .sort(({ lastMessage: { timestamp: a } }, { lastMessage: { timestamp: b } }) => {
                const tA = a.getTime();
                const tB = b.getTime();
                return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA);
            }),
    );
</script>

<svelte:head>
    <title>GhostMode</title>
</svelte:head>

<AppBar>
    <AppBar.Toolbar class="grid-cols-[1fr_2fr_1fr]">
        <AppBar.Lead>
            <button type="button" class="btn-icon btn-icon-lg hover:preset-tonal"><MenuIcon /></button>
        </AppBar.Lead>
        <AppBar.Headline>
            <button type="button" class="mx-auto block" onclick={resetAllStores}><GhostIcon class="size-8" /></button>
        </AppBar.Headline>
        <AppBar.Trail class="justify-end">
            <StatusSwitch />
        </AppBar.Trail>
    </AppBar.Toolbar>
</AppBar>

<CatchUpDialog />

<div class="flex-1 overflow-auto">
    {#if mounted}
        {#each chats as chat (chat.id)}
            <!-- eslint-disable svelte/no-navigation-without-resolve -->
            <a
                href={chat.id === 2 ? resolve(`/chat/${chat.id}`) : "#"}
                class="flex items-center space-x-4 p-3 hover:preset-tonal"
                transition:fly={{ x: -100, duration: 150 }}
            >
                <!-- eslint-enable svelte/no-navigation-without-resolve -->
                <div class="relative">
                    <Avatar>
                        <Avatar.Image src={chat.avatar} alt={chat.name} />
                        <Avatar.Fallback class="text-xl">{chat.name.charAt(0)}</Avatar.Fallback>
                    </Avatar>
                    {#if chat.type === "direct" && chat.status}
                        <span class="absolute right-0 bottom-0 block size-4 rounded-full border-2 border-white {getColor(chat.status)[0]}"></span>
                    {/if}
                </div>
                <div class="min-w-0 flex-1">
                    <div class="space-x-0.5 truncate font-semibold">
                        <span>{chat.name}</span>
                        <span class="text-xs text-surface-500">{chat.channel}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                        {#if chat.lastMessage.senderId === 0}
                            <TextStatusIcon status={chat.lastMessage.status} color={chat.lastMessage.color} className="inline-block" />
                        {/if}<!----><span class="truncate {getColor(chat.lastMessage.priority)[1]}">{chat.lastMessage.content}</span>
                    </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                    <span class="text-xs whitespace-nowrap text-surface-500">
                        {formatTimestamp(chat.lastMessage.timestamp)}
                    </span>

                    {#if chat.unreads > 0}
                        <span
                            class="badge flex size-5 items-center justify-center rounded-full p-0 text-center text-xs text-white {getColor(
                                chat.maxPriority,
                            )[0]}"
                        >
                            {chat.unreads}
                        </span>
                    {/if}
                </div>
            </a>
        {:else}
            <div class="p-4 space-y-4 text-center" transition:fade={{ duration: 150 }}>
                <GhostIcon class="mx-auto size-1/12" />
                <div class="h3">No new messages</div>
            </div>
        {/each}
    {:else}
        <div class="flex h-full w-full items-center justify-center">
            <Progress class="w-fit items-center" value={null}>
                <Progress.Circle>
                    <Progress.CircleTrack />
                    <Progress.CircleRange />
                </Progress.Circle>
                <Progress.ValueText />
            </Progress>
        </div>
    {/if}

    {#if statusStore.value.status !== Status.Online}
        <div class="mt-4 grid flex-1 text-center text-surface-500">
            {#if statusStore.value.status === Status.Focus}
                <div class="col-start-1 row-start-1" transition:fade={{ duration: 150 }}>
                    You are in <StatusIcon status={Status.Focus} /> mode. <StatusIcon status={TextPriority.Normal} /> messages are hidden.
                </div>
            {:else if statusStore.value.status === Status.Shielded}
                <div class="col-start-1 row-start-1" transition:fade={{ duration: 150 }}>
                    You are in <StatusIcon status={Status.Shielded} /> mode. <StatusIcon status={TextPriority.Normal} /> and <StatusIcon
                        status={TextPriority.Prioritized}
                    /> messages are hidden.
                </div>
            {/if}
        </div>
    {/if}
</div>

<Fab />
