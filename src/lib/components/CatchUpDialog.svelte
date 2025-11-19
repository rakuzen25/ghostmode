<script lang="ts">
    import { AppBar, Avatar, Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
    import { catchUpStore, chatStore, contactStatusStore } from "$lib/stores.svelte";
    import { formatTime, getColor, getMaxPriority } from "$lib";
    import { XIcon } from "@lucide/svelte";
    import StatusIcon from "./StatusIcon.svelte";
    import { resolve } from "$app/paths";

    const animation =
        "transition transition-discrete opacity-0 translate-y-[100px] starting:data-[state=open]:opacity-0 starting:data-[state=open]:translate-y-[100px] data-[state=open]:opacity-100 data-[state=open]:translate-y-0";

    let chats = $derived(
        Object.entries(catchUpStore.value.messages).map(([chatId, messages]) => ({
            ...chatStore.value[+chatId],
            id: +chatId,
            status: contactStatusStore.value[+chatId],
            messages,
            maxPriority: getMaxPriority(messages),
        })),
    );
    let duration = $derived(catchUpStore.value.duration);
</script>

<Dialog open={catchUpStore.value.isOpen} onOpenChange={({ open }) => (catchUpStore.value.isOpen = open)}>
    <Portal>
        <!-- <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/80 backdrop-blur-sm transition-all duration-300" /> -->
        <Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center">
            <Dialog.Content class="flex h-full w-full flex-col overflow-hidden card bg-surface-contrast-light {animation}">
                <AppBar>
                    <AppBar.Toolbar class="grid-cols-[auto_auto]">
                        <AppBar.Lead>
                            <Dialog.CloseTrigger
                                onclick={() => {
                                    catchUpStore.reset();
                                }}
                                class="btn-icon btn-icon-lg hover:preset-tonal"
                            >
                                <XIcon />
                            </Dialog.CloseTrigger>
                        </AppBar.Lead>
                    </AppBar.Toolbar>
                    <AppBar.Headline class="space-y-2">
                        <Dialog.Title class="h2">Catch up</Dialog.Title>
                        <Dialog.Description>
                            You were in <StatusIcon status={catchUpStore.value.oldStatus} /> mode for
                            <span class="font-semibold">{formatTime(duration)}</span>. Here's what you missed.
                        </Dialog.Description>
                    </AppBar.Headline>
                </AppBar>

                <div class="flex-1 overflow-auto">
                    {#each chats as chat (chat.id)}
                        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                        <a href={chat.id === 2 ? resolve(`/chat/${chat.id}`) : "#"} class="flex items-center space-x-4 p-3 hover:preset-tonal">
                            <div class="relative">
                                <Avatar>
                                    <Avatar.Image src={chat.avatar} alt={chat.name} />
                                    <Avatar.Fallback class="text-xl">{chat.name.charAt(0)}</Avatar.Fallback>
                                </Avatar>
                                {#if chat.type === "direct" && chat.status}
                                    <span class="absolute right-0 bottom-0 block size-4 rounded-full border-2 border-white {getColor(chat.status)[0]}"
                                    ></span>
                                {/if}
                            </div>
                            <div class="min-w-0 flex-1">
                                <div class="space-x-0.5 truncate font-semibold">
                                    <span>{chat.name}</span>
                                    <span class="text-xs text-surface-500">{chat.channel}</span>
                                </div>
                                <div class="flex items-center space-x-1">
                                    {chat.messages.map((msg) => msg.content).join(", ")}
                                </div>
                            </div>
                            <span
                                class="badge flex size-5 items-center justify-center rounded-full p-0 text-center text-xs text-white {getColor(
                                    chat.maxPriority,
                                )[0]}"
                            >
                                {chat.messages.length}
                            </span>
                        </a>
                    {/each}
                </div>
            </Dialog.Content>
        </Dialog.Positioner>
    </Portal>
</Dialog>
