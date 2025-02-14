<script lang="ts">
    import logo from "../assets/logo.svg";
    import { PAGES } from "../utils/shared.ts";
    import { currentPage } from "../utils/store.ts";
    import Avatar from "./Avatar.svelte";

    function redirectHome() {
        currentPage.set(PAGES.HOME);
        location.reload();
    }
</script>

<style>
    .navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 3vw;
        padding: 10px 25px;
        border-bottom: solid 1px #e8f8fe;
        box-shadow: 0 1px 5px -1px #f0f0f0;
    }

    .title_text {
        font-weight: 900;
        font-size: 2rem;
        color: var(--color-text);
        text-transform: uppercase;
        letter-spacing: 1px;
        cursor: pointer;
        flex-grow: 1;
        font-family: "Arial Black", "Impact", sans-serif;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .title_text:hover {
        opacity: 0.8;
    }

    .title_text img {
        display: block;
        width: 70px;
        height: auto;
    }

    /* Mobile: reduce logo size and font-size */
    @media (max-width: 600px) {
        .title_text {
            font-size: 1.5rem;
            gap: 5px;
        }
        .title_text img {
            width: 50px;
        }
    }
</style>

<nav class="navbar">
    <div class="title_text" on:click={redirectHome}>
        <img src={logo} alt="Logo" /> NOFAT25
    </div>
    <Avatar />
</nav>
