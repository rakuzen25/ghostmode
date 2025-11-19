<script lang="ts">
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { page } from "$app/state";
    import { GhostIcon } from "@lucide/svelte";
    import { AppBar } from "@skeletonlabs/skeleton-svelte";
</script>

<svelte:head>
    <title>{page.error?.message ?? page.status} | GhostMode</title>
</svelte:head>

<AppBar>
    <AppBar.Toolbar class="grid-cols-[1fr_2fr_1fr]">
        <AppBar.Lead></AppBar.Lead>
        <AppBar.Headline>
            <button class="mx-auto block" onclick={() => goto(resolve("/"))}><GhostIcon class="size-8" /></button>
        </AppBar.Headline>
    </AppBar.Toolbar>
</AppBar>

<div class="container mx-auto space-y-4 px-4 py-8 text-center">
    <GhostIcon class="mx-auto size-32" />
    <h1 class="h1">{page.status}</h1>
    <p class="text-lg">{page.error?.message}</p>
</div>
