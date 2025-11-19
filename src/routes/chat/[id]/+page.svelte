<script lang="ts">
    import { ChevronLeftIcon, GhostIcon, MenuIcon, SendIcon } from "@lucide/svelte";
    import { AppBar, Avatar, Menu, Portal, Progress } from "@skeletonlabs/skeleton-svelte";
    import { onMount, untrack } from "svelte";

    import { type ChatMessage, formatTimestamp, getColor, Status, TextPriority, TextStatus } from "$lib";
    import StatusIcon from "$lib/components/StatusIcon.svelte";
    import TextBubble from "$lib/components/TextBubble.svelte";
    import TextStatusIcon from "$lib/components/TextStatusIcon.svelte";
    import { chatHistoryStore, chatStore, contactStatusStore, statusStore } from "$lib/stores.svelte";
    import { SvelteDate } from "svelte/reactivity";
    import { fade } from "svelte/transition";
    import { page } from "$app/state";
    import { error } from "@sveltejs/kit";

    let mounted = $state(false);
    onMount(() => {
        mounted = true;
    });

    const id = +(page.params.id ?? 0);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!chatStore.value[id]) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw error(404, "Chat not found");
    }
    const chat = $derived({
        id,
        ...chatStore.value[id],
        get messages() {
            return chatHistoryStore.value[id] ?? [];
        },
        addMessage(msg: ChatMessage) {
            chatHistoryStore.value[id].push(msg);
        },
        get status() {
            return contactStatusStore.value[id] as Status;
        },
        set status(newStatus: Status) {
            contactStatusStore.value[id] = newStatus;
        },
    });

    let elemChat: HTMLElement;
    let priority = $state(TextPriority.Normal);
    let color = $derived(getColor(priority)[1]);
    let recipientColor = $derived(getColor(chat.status)[1]);

    const getSentStatus = (priority: TextPriority): TextStatus => {
        switch (chat.status) {
            case Status.Online:
                return TextStatus.Notified;
            case Status.Focus:
                return priority === TextPriority.Normal ? TextStatus.Delivered : TextStatus.Notified;
            case Status.Shielded:
                return priority === TextPriority.Urgent ? TextStatus.Notified : TextStatus.Delivered;
            default:
                return TextStatus.Delivered;
        }
    };

    let newMessageText = $state("");
    const handleSubmit = async (event: Event) => {
        event.preventDefault();
        if (!mounted) {
            return;
        }
        newMessageText = newMessageText.trim();
        if (!newMessageText.length) {
            return;
        }
        const msg = $state<ChatMessage>({
            senderId: 0,
            content: newMessageText,
            timestamp: new SvelteDate(),
            priority,
            status: TextStatus.Sending,
        });
        chat.addMessage(msg);
        newMessageText = "";
        // Simulate sending delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        msg.status = getSentStatus(priority);
        msg.color = recipientColor;
        // Simulate read and reply
        if (msg.status === TextStatus.Notified) {
            await simulateReadReply(msg);
        }
    };

    const shouldShowTimestamp = (i: number): boolean => {
        if (i === 0) {
            return true;
        }
        const currentMsg = chat.messages[i];
        const prevMsg = chat.messages[i - 1];
        const diff = currentMsg.timestamp.getTime() - prevMsg.timestamp.getTime();
        return diff > 15 * 60 * 1000; // 15 minutes
    };

    const changeContactStatus = async () => {
        if (chat.status === Status.Online) {
            chat.status = Status.Focus;
        } else if (chat.status === Status.Focus) {
            chat.status = Status.Shielded;
        } else {
            chat.status = Status.Online;
            const lastMsg = chat.messages[chat.messages.length - 1];
            if (lastMsg.senderId !== chat.id) {
                await simulateReadReply(lastMsg, 1000);
            }
        }
    };
    const simulateReadReply = async (msg: ChatMessage, additionalDelay = 0) => {
        const delay = Math.random() * 3000 + additionalDelay;
        await new Promise((resolve) => setTimeout(resolve, delay));
        msg.status = TextStatus.Read;
        delete msg.color;

        const simulateReply = async (content: string) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const reply = $state<ChatMessage>({
                senderId: chat.id,
                content: "...",
                timestamp: new SvelteDate(),
                priority: "typing",
                status: TextStatus.Sending,
            });
            chat.addMessage(reply);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            reply.priority = TextPriority.Normal;
            reply.content = content;
            reply.status = statusStore.value.status === Status.Online ? TextStatus.Notified : TextStatus.Delivered;
            reply.color = getColor(statusStore.value.status)[1];
        };

        const lower = msg.content.toLowerCase();
        if (/\b(?:hello|hi|yo)\b/.test(lower)) {
            await simulateReply("what's up");
        }
        if (/\b(?:did|have) you\b/.test(lower)) {
            await simulateReply("i'm on it rn");
        }
        if (lower.includes("how long")) {
            await simulateReply("gimme like an hour");
        }
    };

    $effect(() => {
        void chat.messages.length;
        void chat.status;

        // Mark unread messages as read
        untrack(() => {
            for (let i = chat.messages.length - 1; i >= 0; --i) {
                const msg = chat.messages[i];
                if (msg.status === TextStatus.Read) {
                    break;
                }
                if (msg.senderId !== 0) {
                    msg.status = TextStatus.Read;
                    delete msg.color;
                }
            }
        });

        const isInitialLoad = untrack(() => elemChat.scrollTop === 0);
        elemChat.scrollTo({
            top: elemChat.scrollHeight,
            behavior: isInitialLoad ? "instant" : "smooth",
        });
    });
</script>

<svelte:head>
    <title>Chat with Frank | GhostMode</title>
</svelte:head>

<AppBar>
    <AppBar.Toolbar class="grid-cols-[1fr_2fr_1fr]">
        <AppBar.Lead>
            <button
                type="button"
                class="btn-icon btn-icon-lg hover:preset-tonal"
                onclick={() => {
                    history.back();
                }}><ChevronLeftIcon /></button
            >
        </AppBar.Lead>
        <AppBar.Headline>
            <div class="flex items-center justify-center space-x-2.5">
                <div class="relative">
                    <Avatar class="size-10" onclick={changeContactStatus}>
                        <Avatar.Image src={chat.avatar} alt={chat.name} />
                        <Avatar.Fallback>{chat.name.charAt(0)}</Avatar.Fallback>
                    </Avatar>
                    {#if chat.type === "direct" && chat.status}
                        <span class="absolute right-0 bottom-0 block size-3 rounded-full border-2 border-white {getColor(chat.status)[0]}"></span>
                    {/if}
                </div>
                <div class="space-x-0.5 truncate font-semibold">
                    <span>{chat.name}</span>
                    <span class="text-xs text-surface-500">{chat.channel}</span>
                </div>
            </div>
        </AppBar.Headline>
        <AppBar.Trail class="justify-end">
            <button type="button" class="btn-icon btn-icon-lg hover:preset-tonal"><MenuIcon /></button>
        </AppBar.Trail>
    </AppBar.Toolbar>
</AppBar>

<div class="flex-1 space-y-2 overflow-auto p-4" bind:this={elemChat}>
    {#if mounted}
        {#each chat.messages as message, i (message.timestamp)}
            {#if shouldShowTimestamp(i)}
                <div class="mt-2 text-center text-sm text-surface-500">
                    {formatTimestamp(message.timestamp)}
                </div>
            {/if}
            <TextBubble {message}></TextBubble>
        {/each}

        {#if chat.messages.length}
            {@const lastMessage = chat.messages[chat.messages.length - 1]}
            {#if lastMessage.senderId === 0}
                <div class="ml-auto w-fit">
                    <TextStatusIcon status={lastMessage.status} color={lastMessage.color} />
                </div>
            {/if}
        {/if}

        {#if chat.status !== Status.Online}
            <div class="grid text-center text-sm text-surface-500">
                {#if chat.status === Status.Focus}
                    <div class="col-start-1 row-start-1" transition:fade={{ duration: 150 }}>
                        {chat.name} is in <StatusIcon status={Status.Focus} /> mode. <StatusIcon status={TextPriority.Normal} /> messages are filtered.
                    </div>
                {:else if chat.status === Status.Shielded}
                    <div class="col-start-1 row-start-1" transition:fade={{ duration: 150 }}>
                        {chat.name} is in <StatusIcon status={Status.Shielded} /> mode. <StatusIcon status={TextPriority.Normal} /> and <StatusIcon
                            status={TextPriority.Prioritized}
                        /> messages are filtered.
                    </div>
                {/if}
            </div>
        {/if}
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
</div>

<form class="flex items-center space-x-2 border-t border-surface-300-700 px-2 py-4 lg:space-x-4 lg:px-4" onsubmit={handleSubmit}>
    <Menu>
        <Menu.Trigger class="btn-icon btn-icon-lg hover:preset-tonal">
            <GhostIcon class={color} />
        </Menu.Trigger>
        <Portal>
            <Menu.Positioner>
                <Menu.Content class="min-w-0">
                    {#each Object.values(TextPriority) as option (option)}
                        <Menu.Item onclick={() => (priority = option)} value={option}>
                            <Menu.ItemText>
                                <StatusIcon status={option} />
                            </Menu.ItemText>
                        </Menu.Item>
                    {/each}
                </Menu.Content>
            </Menu.Positioner>
        </Portal>
    </Menu>
    <input type="text" class="input" name="message" placeholder="Type a message..." bind:value={newMessageText} />
    <button type="submit" class="btn-icon btn-icon-lg hover:preset-tonal">
        <SendIcon class={color} />
    </button>
</form>
