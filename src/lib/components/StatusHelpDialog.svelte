<script lang="ts">
    import { Status, TextPriority } from "$lib";
    import { XIcon } from "@lucide/svelte";
    import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
    import StatusIcon from "./StatusIcon.svelte";

    let {
        open,
    }: {
        open: boolean;
    } = $props();

    const animation =
        "transition transition-discrete opacity-0 translate-y-[100px] starting:data-[state=open]:opacity-0 starting:data-[state=open]:translate-y-[100px] data-[state=open]:opacity-100 data-[state=open]:translate-y-0";
</script>

<Dialog {open}>
    <Portal>
        <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50" />
        <Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Content class="w-full max-w-3xl space-y-4 card bg-surface-100-900 p-4 shadow-xl {animation}">
                <header class="flex items-center justify-between">
                    <Dialog.Title class="text-lg font-bold">What are the statuses?</Dialog.Title>
                    <Dialog.CloseTrigger class="btn-icon hover:preset-tonal">
                        <XIcon class="size-4" />
                    </Dialog.CloseTrigger>
                </header>
                <Dialog.Description class="space-y-2">
                    <p>There are three statuses you can choose from.</p>
                    <div class="table-wrap">
                        <table class="table">
                            <tbody>
                                <tr>
                                    <td><StatusIcon status={Status.Online} /></td>
                                    <td>You are available to chat.</td>
                                    <td>No messages will be filtered.</td>
                                </tr>
                                <tr>
                                    <td><StatusIcon status={Status.Focus} /></td>
                                    <td>You prefer not to be disturbed.</td>
                                    <td><StatusIcon status={TextPriority.Normal} /> messages will be filtered.</td>
                                </tr>
                                <tr>
                                    <td><StatusIcon status={Status.Shielded} /></td>
                                    <td>You do not want to be disturbed.</td>
                                    <td
                                        ><StatusIcon status={TextPriority.Normal} /> and <StatusIcon status={TextPriority.Prioritized} /> messages will
                                        be filtered.</td
                                    >
                                </tr></tbody
                            >
                        </table>
                    </div>
                </Dialog.Description>
            </Dialog.Content>
        </Dialog.Positioner>
    </Portal>
</Dialog>
