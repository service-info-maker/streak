<script lang="ts">
    import Home from "./Home.svelte";
    import { currentPage } from "../utils/store";
    import { PAGES } from "../utils/shared";
    import Tracker from "./Tracker.svelte";
    import NotFound from "./NotFound.svelte";
    import Profile from "./Profile.svelte";
</script>

<style>
    .content {
        display: flex;
        flex-grow: 6;
        flex-basis: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        max-height: 100vh;
    }
</style>

<div class="content">
    {#if $currentPage === PAGES.HOME}
        <Home />
    {:else if $currentPage === PAGES.TRACKER}
        <Tracker />
    {:else}
        <NotFound />
    {/if}
</div>
