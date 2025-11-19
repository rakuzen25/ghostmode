<script lang="ts">
    import "./layout.css";
    import { getColor } from "$lib";
    import { statusStore } from "$lib/stores.svelte";
    import type { Snippet } from "svelte";

    let { children }: { children: Snippet } = $props();
</script>

<div class="flex h-screen flex-col transition-colors {getColor(statusStore.value.status)[2]}">
    {@render children()}
</div>
