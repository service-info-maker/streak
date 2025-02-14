<script>
    import Navbar from "./Navbar.svelte";
    import Sidebar from "./Sidebar.svelte";
    import Content from "./Content.svelte";
    import OnThisPage from "./OnThisPage.svelte";
    import {currentPage} from "../utils/store.ts";
    import {PAGES} from "../utils/shared.ts";
    import Profile from "./Profile.svelte";
</script>

<style>
    .container{
        display: flex;
        width: 100%;
        height: 100%;
    }
</style>
<div class="container">
    {#if $currentPage === PAGES.PROFILE}
        <Profile/>
    {:else}
        <Sidebar/>
        <Content/>
    {/if}
</div>