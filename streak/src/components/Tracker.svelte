<script lang="ts">
    import { onMount } from "svelte";
    import { currentMonth } from "../utils/store";
    import { fluentDivider, provideFluentDesignSystem } from "@fluentui/web-components";
    provideFluentDesignSystem().register(fluentDivider());

    // --- SETTINGS ---
    const numDays = 31;
    const API_BASE = "https://streak-worker-v2.streak-counter.workers.dev";
    const currentYear = new Date().getFullYear().toString();
    const AUTH_TOKEN =  document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

    // --- STATE ARRAYS ---
    let foodDays: number[] = Array(numDays).fill(0);
    let sportDays: number[] = Array(numDays).fill(0);
    let addictionDays: number[] = Array(numDays).fill(0);

    // --- TOAST STATE ---
    let toastMessage = "";
    let showToast = false;
    let toastAppearance: "success" | "error" = "success";

    // --- LOADING STATE ---
    let dataLoaded: boolean = false;

    // --- COLOR MAPPING ---
    function getColor(contributions: number) {
        switch (contributions) {
            case 0: return "#FFFFFC"; // almost white background
            case 1: return "#ADD8E6"; // light blue
            case 2: return "#FFB6C1"; // light pink
            case 3: return "#f1c40f"; // light yellow
            default: return "#FFFFFC";
        }
    }

    // --- CLICK HANDLERS ---
    function cycleFood(index: number) {
        foodDays = foodDays.map((day, i) => i === index ? (day + 1) % 4 : day);
    }
    function cycleSport(index: number) {
        sportDays = sportDays.map((day, i) => i === index ? (day + 1) % 4 : day);
    }
    function cycleAddiction(index: number) {
        addictionDays = addictionDays.map((day, i) => i === index ? (day + 1) % 4 : day);
    }

    // --- API CALLS ---
    async function checkAuth(): Promise<boolean> {
        // Authentication bypassed for now.
        return true;
    }

    async function fetchData() {
        try {
            const res = await fetch(
                `${API_BASE}/data?year=${currentYear}&month=${$currentMonth}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${AUTH_TOKEN}`
                    }
                }
            );

            if (res.ok) {
                const { food, sport, addiction } = await res.json();
                if (food && food.length === numDays) {
                    foodDays = food;
                }
                if (sport && sport.length === numDays) {
                    sportDays = sport;
                }
                if (addiction && addiction.length === numDays) {
                    addictionDays = addiction;
                }
            } else {
                console.warn("No existing data found, using defaults");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    async function sendData() {
        try {
            const payload = {
                year: currentYear,
                month: $currentMonth,
                food: foodDays,
                sport: sportDays,
                addiction: addictionDays
            };
            const res = await fetch(`${API_BASE}/data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${AUTH_TOKEN}`
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                console.log("Data updated successfully");
                triggerToast("Data sent successfully!", "success");
            } else {
                console.error("Error updating data", res.statusText);
                triggerToast("Error updating data", "error");
            }
        } catch (error) {
            console.error("Error sending data:", error);
            triggerToast("Error sending data", "error");
        }
    }

    function triggerToast(message: string, appearance: "success" | "error") {
        toastMessage = message;
        toastAppearance = appearance;
        showToast = true;
        setTimeout(() => {
            showToast = false;
        }, 3000);
    }

    // Reactive block: whenever $currentMonth changes, re-fetch the data.
    $: if ($currentMonth) {
        (async () => {
            if (await checkAuth()) {
                dataLoaded = false;
                await fetchData();
                dataLoaded = true;
            }
        })();
    }
</script>

<style>
    :root {
        --primary-color: #000;
        --background-color: #fff;
        --accent-color: #f1c40f;
        --secondary-color: #666;
        --card-bg: #fff;
        --card-border: #ddd;
        --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        /* Define color for text/background used in the heatmap */
        --color-text: black;
    }

    html, body {
        height: 100%;
        margin: 0;
        font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;
        background: var(--background-color);
        color: var(--primary-color);
    }

    .content {
        box-sizing: border-box;
        width: 100%;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        gap: 1.5rem;
        height: calc(100vh - 100px);
        position: relative;
    }

    .heatmap {
        width: 100%;
        min-height: 200px;
        height: 200px;
        display: flex;
        justify-content: center;
        align-items: center;
        /* Use a defined background so the table is visible */
        background: var(--color-text);
        border-radius: 8px;
        padding: 10px;
    }
    .grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-template-rows: repeat(5, 1fr);
        width: 100%;
        height: 100%;
        gap: 3px;
    }
    .day {
        width: 100%;
        height: 100%;
        border-radius: 3px;
        transition: transform 0.2s ease-in-out;
        cursor: pointer;
    }
    .day:hover {
        transform: scale(1.1);
    }
    @media (max-width: 600px) {
        .grid {
            gap: 1px;
        }
    }
    .btncontainer {
        display: flex;
        justify-content: flex-end;
        width: 100%;
        padding: 0 1rem 1rem 0;
    }
    .send-button {
        background-color: var(--accent-color);
        color: var(--background-color);
        border: none;
        border-radius: 8px;
        padding: 0.6em 1.2em;
        font-size: 1rem;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s ease, filter 0.2s ease;
    }
    .send-button:hover {
        filter: brightness(90%);
        transform: translateY(-2px);
    }
    /* Toast Notification Styles */
    .toast {
        position: fixed;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
        padding: 1rem 2rem;
        border-radius: 4px;
        color: #fff;
        font-size: 1rem;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.5s ease-in-out;
        z-index: 1000;
    }
    .toast.show {
        opacity: 1;
    }
    .toast.success {
        background-color: #28a745;
    }
    .toast.error {
        background-color: #dc3545;
    }
    /* Spinner Styles */
    /* Change .loading to take 100% of the parent's height so that the spinner is centered in the component */
    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }
    .spinner {
        border: 8px solid #f3f3f3; /* Light grey */
        border-top: 8px solid #3498db; /* Blue */
        border-radius: 50%;
        width: 60px;
        height: 60px;
        animation: spin 2s linear infinite;
        margin-bottom: 1rem;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>

{#if dataLoaded}
    <div class="content">
        <div style="font-weight: 300; font-size: 3rem;">{$currentMonth} status</div>
        <fluent-divider />

        <!-- Food Table -->
        <div style="font-size: 2rem; font-weight: 150">Food</div>
        <fluent-card class="heatmap">
            <div class="grid">
                {#each foodDays as day, i}
                    <div
                            style="display: flex; align-items: center; justify-content: center;  border-radius: 4px; background-color: {getColor(day)}; color: white;"
                            title="Day {i+1}: {day}"
                            on:click={() => cycleFood(i)}
                    >
                        {i+1}
                    </div>
                {/each}

            </div>
        </fluent-card>

        <!-- Sport Table -->
        <div style="font-size: 2rem; font-weight: 200">Sport</div>
        <fluent-card class="heatmap">
            <div class="grid">
                {#each sportDays as day, i}
                    <div
                            style="display: flex; align-items: center; justify-content: center;  border-radius: 4px; background-color: {getColor(day)}; color: white;"
                            title="Day {i+1}: {day}"
                            on:click={() => cycleSport(i)}
                    >
                        {i+1}
                    </div>
                {/each}
            </div>
        </fluent-card>

        <!-- Addiction Table -->
        <div style="font-size: 2rem; font-weight: 200">Addiction</div>
        <fluent-card class="heatmap" style="margin-bottom: 1rem">
            <div class="grid">
                {#each addictionDays as day, i}
                    <div
                            style="display: flex; align-items: center; justify-content: center;  border-radius: 4px; background-color: {getColor(day)}; color: white;"
                            title="Day {i+1}: {day}"
                            on:click={() => cycleAddiction(i)}
                    >
                        {i+1}
                    </div>
                {/each}
            </div>
        </fluent-card>

        <div class="btncontainer">
            <button class="send-button" on:click={sendData}>Send</button>
        </div>
    </div>
{:else}
    <!-- The loading container now fills its parent component and centers the spinner -->
    <div class="loading">
        <div class="spinner"></div>
        <p>Loading data...</p>
    </div>
{/if}

{#if showToast}
    <div class="toast {toastAppearance} show">
        {toastMessage}
    </div>
{/if}
