<script lang="ts">
    import { onMount, tick } from 'svelte';
    import {
        provideFluentDesignSystem,
        fluentButton,
        fluentCard,
        fluentDivider
    } from "@fluentui/web-components";

    // Register Fluent components
    provideFluentDesignSystem().register(fluentButton(), fluentCard(), fluentDivider());

    // --------------------------------
    //  State and references
    // --------------------------------
    let username: string = "JHOHN DOE";
    let motivationQuote: string = "Push yourself because no one else is going to do it for you.";

    // Canvas references
    let pieChartCanvas: HTMLCanvasElement;
    let lineChartCanvas: HTMLCanvasElement;
    let weightChartCanvas: HTMLCanvasElement;

    // Misc chart data
    let pieValue1: number = 30;
    let pieValue2: number = 50;
    let pieValue3: number = 20;

    // Streak chart spinner
    let isLoadingStreak = false;

    // Weight chart spinner
    let isLoadingWeight = true;

    // Weight array for 12 months
    let weightData: number[] = new Array(12).fill(0);

    // Vertical labels for streak/weight cards
    let title1_card2 = "STREAK";
    let title2_card2 = "CHART";

    let title1_card3 = "WEIGHT";
    let title2_card3 = "LOSS";

    // --------------------------------
    //  Weight input form
    // --------------------------------
    let inputWeight: string = "";
    let selectedMonth: string = "0"; // default to January
    const shortMonths = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

    // --------------------------------
    //  Toast notification state
    // --------------------------------
    let toastMessage: string = "";
    let toastAppearance: "success" | "error" = "success";
    let showToastFlag: boolean = false;

    function showToast(type: "success" | "error", message: string) {
        toastAppearance = type;
        toastMessage = message;
        showToastFlag = true;
        setTimeout(() => {
            showToastFlag = false;
        }, 3000);
    }

    // --------------------------------
    //  Worker endpoints
    // --------------------------------
    const BASE_URL = "https://streak-worker-v2.streak-counter.workers.dev";
    const WEIGHT_GET_ENDPOINT = `${BASE_URL}/weight`; // GET to fetch weight array
    const WEIGHT_UPDATE_ENDPOINT = `${BASE_URL}/weight`; // POST to update weight
    const LOGIN_ENDPOINT = `${BASE_URL}/login`;
    const DATA_ENDPOINT = `${BASE_URL}/data`; // For streak chart

    // --------------------------------
    //  Logout
    // --------------------------------
    function logout() {
        // Expire authToken cookie
        document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/;";
        console.log("Logout clicked: cookie deleted");
        location.reload();
    }

    // --------------------------------
    //  Load user profile (name, quote) from /login
    // --------------------------------
    async function loadUserProfile() {
        const authToken = getAuthToken();
        if (!authToken) {
            console.warn("No authToken cookie found.");
            return;
        }

        try {
            const res = await fetch(LOGIN_ENDPOINT, {
                method: "POST",
                headers: { Authorization: `Bearer ${authToken}` }
            });

            if (res.ok) {
                const user = await res.json();
                username = user.name || username;
                motivationQuote = user.motivational_quote || motivationQuote;
            } else {
                console.warn("User not found or not authorized:", res.status);
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        }
    }

    // --------------------------------
    //  Get the auth token from cookies
    // --------------------------------
    function getAuthToken(): string | undefined {
        return document.cookie
            .split("; ")
            .find((row) => row.startsWith("authToken="))
            ?.split("=")[1];
    }

    // --------------------------------
    //  Pie Chart (static example)
    // --------------------------------
    function drawPieChart() {
        if (!pieChartCanvas) return;
        const ctx = pieChartCanvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, pieChartCanvas.width, pieChartCanvas.height);

        const values = [pieValue1, pieValue2, pieValue3];
        const total = values.reduce((sum, val) => sum + val, 0);
        const colors = [
            "rgba(0, 0, 0, 0.8)",
            "rgba(128, 128, 128, 0.8)",
            "rgba(241, 196, 15, 0.8)"
        ];
        let startAngle = -0.5 * Math.PI;
        const centerX = pieChartCanvas.width / 2;
        const centerY = pieChartCanvas.height / 2;
        const radius = Math.min(pieChartCanvas.width, pieChartCanvas.height) / 2 - 10;

        for (let i = 0; i < values.length; i++) {
            const sliceAngle = (values[i] / total) * 2 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[i];
            ctx.fill();

            // White border
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
            startAngle += sliceAngle;
        }
    }

    // --------------------------------
    //  Streak Chart
    // --------------------------------
    async function fetchAndDrawStreakChart() {
        isLoadingStreak = true;

        // Example months for the year
        const months: string[] = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const streakDataFood: number[] = new Array(12).fill(0);
        const streakDataSport: number[] = new Array(12).fill(0);
        const streakDataAddiction: number[] = new Array(12).fill(0);

        const currentYear = new Date().getFullYear().toString();
        const authToken = getAuthToken();
        if (!authToken) {
            console.warn("No authToken found, cannot load streak data.");
            isLoadingStreak = false;
            return;
        }

        // Fetch each month’s data
        for (let i = 0; i < 12; i++) {
            const month = months[i];
            try {
                const response = await fetch(`${DATA_ENDPOINT}?year=${currentYear}&month=${month}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${authToken}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    // Each field is an array of numbers; sum them
                    streakDataFood[i] = data.food.reduce((sum: number, n: number) => sum + n, 0);
                    streakDataSport[i] = data.sport.reduce((sum: number, n: number) => sum + n, 0);
                    streakDataAddiction[i] = data.addiction.reduce((sum: number, n: number) => sum + n, 0);
                } else {
                    console.warn(`No data for ${month}. Using zero fallback.`);
                }
            } catch (error) {
                console.error(`Error fetching data for ${month}:`, error);
            }
        }

        isLoadingStreak = false;
        await tick(); // ensure canvas is in DOM

        drawLineChart(streakDataFood, streakDataSport, streakDataAddiction, months);
    }

    function drawLineChart(dataFood: number[], dataSport: number[], dataAddiction: number[], months: string[]) {
        if (!lineChartCanvas) return;
        const ctx = lineChartCanvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, lineChartCanvas.width, lineChartCanvas.height);

        const margin = 40;
        const width = lineChartCanvas.width;
        const height = lineChartCanvas.height;
        const usableWidth = width - 2 * margin;
        const usableHeight = height - 2 * margin;
        const xStep = usableWidth / (months.length - 1);

        const allData = [...dataFood, ...dataSport, ...dataAddiction];
        const maxValue = Math.max(...allData, 31);
        const yMax = Math.ceil(maxValue / 10) * 10;
        const yMin = 0;

        // Axes
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;

        // X-axis
        ctx.beginPath();
        ctx.moveTo(margin, height - margin);
        ctx.lineTo(width - margin, height - margin);
        ctx.stroke();

        // Y-axis
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, height - margin);
        ctx.stroke();

        // Colors
        const colors = [
            "rgba(241, 196, 15, 0.8)", // Yellow for Food
            "rgba(0, 128, 255, 0.8)",  // Blue for Sport
            "rgba(34, 139, 34, 0.8)"   // Green for Addiction
        ];

        function drawLine(data: number[], color: string) {
            ctx.beginPath();
            data.forEach((value, i) => {
                const x = margin + i * xStep;
                const y = height - margin - ((value - yMin) / (yMax - yMin)) * usableHeight;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Points
            data.forEach((value, i) => {
                const x = margin + i * xStep;
                const y = height - margin - ((value - yMin) / (yMax - yMin)) * usableHeight;
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = "#000";
                ctx.fill();
            });
        }

        // Draw each line
        drawLine(dataFood, colors[0]);
        drawLine(dataSport, colors[1]);
        drawLine(dataAddiction, colors[2]);

        // X-axis labels
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.font = "10px Arial";
        months.forEach((month, i) => {
            const x = margin + i * xStep;
            const y = height - margin + 15;
            ctx.fillText(month.substring(0, 3), x, y);
        });

        // Y-axis labels
        ctx.textAlign = "right";
        for (let val = yMin; val <= yMax; val += (yMax - yMin) / 4) {
            const y = height - margin - ((val - yMin) / (yMax - yMin)) * usableHeight;
            ctx.fillText(Math.round(val).toString(), margin - 5, y + 3);
        }
    }

    // --------------------------------
    //  Weight Chart
    // --------------------------------
    async function fetchWeightData() {
        isLoadingWeight = true;
        const authToken = getAuthToken();
        if (!authToken) {
            console.warn("No auth token; cannot load weight data.");
            isLoadingWeight = false;
            return;
        }

        try {
            // GET /weight to retrieve the current array
            const res = await fetch(WEIGHT_GET_ENDPOINT, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            });
            if (!res.ok) {
                console.warn("Could not fetch weight data. Status:", res.status);
                isLoadingWeight = false;
                return;
            }

            const data = await res.json();
            if (Array.isArray(data)) {
                weightData = data;
            } else if (Array.isArray(data.weight)) {
                weightData = data.weight;
            } else {
                console.warn("Weight data is invalid or missing. Using zeros.");
            }
        } catch (err) {
            console.error("Error fetching weight data:", err);
        }

        isLoadingWeight = false;
        await tick(); // ensure canvas is mounted
        drawWeightChart();
    }

    function drawWeightChart() {
        if (!weightChartCanvas) return;
        const ctx = weightChartCanvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, weightChartCanvas.width, weightChartCanvas.height);

        const margin = 40;
        const width = weightChartCanvas.width;
        const height = weightChartCanvas.height;
        const usableWidth = width - 2 * margin;
        const usableHeight = height - 2 * margin;
        const yMin = 40;
        const yMax = 130;
        const xStep = usableWidth / (12 - 1);

        // Axes
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;

        // X-axis
        ctx.beginPath();
        ctx.moveTo(margin, height - margin);
        ctx.lineTo(width - margin, height - margin);
        ctx.stroke();

        // Y-axis
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, height - margin);
        ctx.stroke();

        // Weight line
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            const w = weightData[i];
            const x = margin + i * xStep;
            const y = height - margin - ((w - yMin) / (yMax - yMin)) * usableHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.strokeStyle = "rgba(241, 196, 15, 0.8)";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Points
        for (let i = 0; i < 12; i++) {
            const w = weightData[i];
            const x = margin + i * xStep;
            const y = height - margin - ((w - yMin) / (yMax - yMin)) * usableHeight;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "#000";
            ctx.fill();
        }

        // X-axis labels
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        for (let i = 0; i < 12; i++) {
            const x = margin + i * xStep;
            const y = height - margin + 15;
            ctx.fillText(shortMonths[i], x, y);
        }

        // Y-axis labels
        ctx.textAlign = "right";
        for (let w = yMin; w <= yMax; w += 10) {
            const y = height - margin - ((w - yMin) / (yMax - yMin)) * usableHeight;
            ctx.fillText(w.toString(), margin - 5, y + 3);
        }
    }

    // --------------------------------
    //  Update weight
    // --------------------------------
    async function updateWeight() {
        const parsed = parseFloat(inputWeight);
        if (isNaN(parsed) || parsed <= 40 || parsed > 130) {
            showToast("error", "Please enter a valid weight between 40 and 130.");
            return;
        }

        const authToken = getAuthToken();
        if (!authToken) {
            console.warn("No auth token found. Cannot update weight.");
            showToast("error", "No auth token found.");
            return;
        }

        // Update the local weightData array for the selected month
        let updatedWeightData = [...weightData];
        const index = parseInt(selectedMonth, 10);
        updatedWeightData[index] = parsed;

        try {
            const res = await fetch(WEIGHT_UPDATE_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({ weightData: updatedWeightData })
            });

            if (!res.ok) {
                console.warn("Weight update failed. Status:", res.status);
                showToast("error", "Weight update failed. Please try again.");
                return;
            }

            const result = await res.json();
            // The backend returns { success: true, weight: [...] }
            if (result.success && Array.isArray(result.weight)) {
                weightData = result.weight;
                drawWeightChart();
                inputWeight = "";
                showToast("success", "Weight updated successfully!");
            } else {
                console.warn("Unexpected response from server:", result);
                showToast("error", "Unexpected response from server.");
            }
        } catch (err) {
            console.error("Error updating weight:", err);
            showToast("error", "Error updating weight. Please try again.");
        }
    }

    // --------------------------------
    //  onMount
    // --------------------------------
    onMount(async () => {
        // Load basic profile info
        await loadUserProfile();

        // Draw the static pie chart
        drawPieChart();

        // Load streak data + draw chart
        fetchAndDrawStreakChart();

        // Load weight data + draw chart
        // (spinner will be displayed until fetchWeightData() finishes)
        fetchWeightData();
    });

    // Re-draw pie chart if its values change
    $: if (pieChartCanvas) {
        drawPieChart();
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
    }

    html, body {
        height: 100%;
        margin: 0;
        font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;
        background: var(--background-color);
        color: var(--primary-color);
    }

    .dashboard {
        display: flex;
        height: 95vh;
        width: 100vw;
    }

    .sidebar {
        flex: 1;
        max-width: 300px;
        background: var(--card-bg);
        border-right: 1px solid var(--card-border);
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .profile-info {
        text-align: center;
        flex: 5;
    }
    .profile-info h2 {
        margin: 0 0 10px;
        font-size: 1.8rem;
    }
    .profile-info p {
        font-style: italic;
        font-size: 1rem;
        color: var(--secondary-color);
    }

    .btncontainer {
        display: flex;
        justify-content: flex-start;
        width: 100%;
        padding: 0 1rem 5rem 0;
    }
    .send-button {
        background-color: var(--accent-color);
        color: var(--background-color);
        border: none;
        border-radius: 8px;
        padding: 0.6em 1.2em;
        font-size: 1rem;
        font-family: inherit;
        cursor: pointer;
        width: 100%;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s ease, filter 0.2s ease;
    }

    .main {
        flex: 3;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .charts-container {
        display: flex;
        overflow: auto;
        flex-direction: column;
        gap: 24px;
        flex: 1;
    }

    fluent-card.chart-card {
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 12px;
        box-shadow: var(--box-shadow);
        padding: 24px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    fluent-card.chart-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }

    .card-content {
        display: flex;
        align-items: center;
        gap: 24px;
    }

    .vertical-title-container {
        width: 80px;
        text-align: center;
    }
    .vertical-title {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
    }
    .vertical-title-row {
        display: flex;
        justify-content: center;
        line-height: 1.2;
    }
    .vertical-title-row span {
        display: inline-block;
        width: 1.2em;
        font-weight: bold;
        font-size: 1.2rem;
    }

    .chart-container {
        flex: 1;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    /* Spinner */
    .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid var(--accent-color);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Weight update form */
    .weight-update-form {
        margin-top: 16px;
        display: flex;
        gap: 8px;
        align-items: center;
    }
    .weight-update-form input {
        max-width: 70px;
        padding: 4px;
        font-size: 0.9rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    .weight-update-form select {
        padding: 4px;
        font-size: 0.9rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    .weight-update-form button {
        background-color: var(--accent-color);
        color: var(--background-color);
        border: none;
        border-radius: 4px;
        padding: 0.4em 0.8em;
        font-size: 0.9rem;
        cursor: pointer;
    }

    /* Toast styles */
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
        pointer-events: auto;
    }
    .toast.success {
        background-color: #4CAF50;
    }
    .toast.error {
        background-color: #f44336;
    }
</style>

<div class="dashboard">
    <!-- Left Sidebar: Profile Card -->
    <div class="sidebar">
        <div class="profile-info">
            <h2 style="color:black">{username}</h2>
            <p>"{motivationQuote}"</p>
        </div>
        <div class="btncontainer">
            <button class="send-button" on:click={logout}>Logout</button>
        </div>
    </div>

    <!-- Right Main Area: Charts -->
    <div class="main">
        <div class="charts-container">
            <!-- Card 3: Weight Loss Tracker -->
            <fluent-card class="chart-card">
                <div class="card-content">
                    <div class="vertical-title-container">
                        <div class="vertical-title">
                            {#each Array(Math.max(title1_card3.length, title2_card3.length)) as _, i}
                                <div class="vertical-title-row">
                                    <span>{title1_card3[i] || ''}</span>
                                    <span>{title2_card3[i] || ''}</span>
                                </div>
                            {/each}
                        </div>
                    </div>
                    <div class="chart-container">
                        {#if isLoadingWeight}
                            <div class="spinner"></div>
                        {:else}
                            <canvas bind:this={weightChartCanvas} width="600" height="300"></canvas>
                            <!-- Weight Update Form Below the Chart -->
                            <div class="weight-update-form">
                                <input
                                        type="number"
                                        placeholder="Weight (kg)"
                                        bind:value={inputWeight}
                                        min="1" max="500"
                                />
                                <select bind:value={selectedMonth}>
                                    {#each shortMonths as month, i}
                                        <option value={i}>{month}</option>
                                    {/each}
                                </select>
                                <button on:click={updateWeight}>
                                    Update
                                </button>
                            </div>
                        {/if}
                    </div>
                </div>
            </fluent-card>
            <!-- Card 2: Streak Chart -->
            <fluent-card class="chart-card">
                <div class="card-content">
                    <div class="vertical-title-container">
                        <div class="vertical-title">
                            {#each Array(Math.max(title1_card2.length, title2_card2.length)) as _, i}
                                <div class="vertical-title-row">
                                    <span>{title1_card2[i] || ''}</span>
                                    <span>{title2_card2[i] || ''}</span>
                                </div>
                            {/each}
                        </div>
                    </div>
                    <div class="chart-container">
                        {#if isLoadingStreak}
                            <div class="spinner"></div>
                        {:else}
                            <canvas bind:this={lineChartCanvas} width="600" height="300"></canvas>
                        {/if}
                    </div>
                </div>
            </fluent-card>


        </div>
    </div>
</div>

{#if showToastFlag}
    <div class="toast {toastAppearance} show">
        {toastMessage}
    </div>
{/if}




