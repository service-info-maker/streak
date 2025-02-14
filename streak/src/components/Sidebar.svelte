<script lang="ts">
    import {currentPage, currentMonth, currentBlog} from "../utils/store";
    import {
        provideFluentDesignSystem,
        fluentAccordion,
        fluentAccordionItem
    } from "@fluentui/web-components";
    import { PAGES } from "../utils/shared";

    provideFluentDesignSystem().register(
        fluentAccordion(),
        fluentAccordionItem()
    );

    const allMonths = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const blogContent = ["Weight loss1","Weight loss2"]
</script>

<style>
    .sidebar {
        display: flex;
        flex-grow: 1;
        padding: 10px;
        border-right: 1px solid #ddd;
        flex-direction: column;
        /* Added height and vertical overflow scrolling */
        height: 100vh;
        overflow-y: auto;
    }

    fluent-accordion {
        width: 100%;
    }

    fluent-anchor {
        margin-left: 20px;
        text-decoration: none;
        color: black;
        font-size: 14px;
        display: block; /* Ensures proper padding */
        padding: 10px 15px; /* Space around text */
        border-radius: 10px; /* Soft rounded corners */
        transition: background 0.3s ease-in-out; /* Smooth transition */
        cursor: pointer;
    }

    fluent-accordion-item {
        border: none; /* Removes border */
    }

    fluent-anchor:hover {
        background-color: rgba(245, 196, 0, 0.1); /* Light accent background */
    }

    span {
        font-weight: bold;
        font-size: 1rem;
    }
</style>

<div class="sidebar">
    <fluent-accordion>
        <fluent-accordion-item expanded>
            <span slot="heading">Streak Tracker</span>
            {#each allMonths as month}
                <fluent-anchor
                        onclick={() => {

            currentPage.set(PAGES.TRACKER);
            currentMonth.set(month);
          }}
                >
                    {month}
                </fluent-anchor>
            {/each}
        </fluent-accordion-item>
        <fluent-accordion-item expanded>
            <span slot="heading">Blog</span>
            {#each blogContent as content}
                <fluent-anchor >
                    {content}
                </fluent-anchor>
            {/each}
        </fluent-accordion-item>
        <fluent-accordion-item expanded>
            <span slot="heading">Diet Ideas</span>
        </fluent-accordion-item>
    </fluent-accordion>
</div>
