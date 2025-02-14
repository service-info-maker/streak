<script lang="ts">
    import { onMount, tick } from 'svelte';
    import {
        provideFluentDesignSystem,
        fluentButton,
        fluentCard,
        fluentDivider
    } from "@fluentui/web-components";

    provideFluentDesignSystem().register(fluentButton(), fluentCard(), fluentDivider());

    // --------------------------------
    //  State for user profile
    // --------------------------------
    let username: string = "JHOHN DOE";
    let motivationQuote: string = "Push yourself because no one else is going to do it for you.";

    // --------------------------------
    //  Logout function
    // --------------------------------
    function logout() {
        // Delete the authToken cookie by setting an expiration date in the past.
        document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/;";
        console.log("Logout clicked: cookie deleted");
        location.reload();
    }

    // --------------------------------
    //  Function to load user profile from Worker
    // --------------------------------
    async function loadUserProfile() {
        // Read the authToken (hash) from the cookie
        const authToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("authToken="))
            ?.split("=")[1];

        if (!authToken) {
            console.warn("No authToken cookie found. Redirect or handle error.");
            return;
        }

        try {
            // Call /login with "Authorization: Bearer <hash>"
            const res = await fetch("https://streak-worker-v2.streak-counter.workers.dev/login", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            if (res.ok) {
                // If user found, parse JSON. Example user object:
                // { name: "Alice", motivational_quote: "...", status: "admin" }
                const user = await res.json();
                username = user.name || username; // fallback to the default if missing
                motivationQuote = user.motivational_quote || motivationQuote;
            } else {
                console.warn("User not found or not authorized:", res.status);
                // Optionally redirect to a login page
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        }
    }

    // --------------------------------
    //  Pie Chart values
    // --------------------------------
    let pieValue1: number = 30;
    let pieValue2: number = 50;
    let pieValue3: number = 20;

    // --------------------------------
    //  Weight Loss Data
    // --------------------------------
    let weightData: number[] = [80, 79, 78, 77, 76, 75, 74, 73, 72, 71, 70, 69];

    // --------------------------------
    //  Canvas references
    // --------------------------------
    let pieChartCanvas: HTMLCanvasElement;
    let lineChartCanvas: HTMLCanvasElement;
    let weightChartCanvas: HTMLCanvasElement;

    // Card text for the vertical labels
    let title1_card2 = "STREAK";
    let title2_card2 = "CHART";

    let title1_card3 = "WEIGHT";
    let title2_card3 = "LOSS";

    // Spinner for the streak chart
    let isLoadingStreak = false;

    // --------------------------------
    //  Pie Chart
    // --------------------------------
    function drawPieChart() {
        if (!pieChartCanvas) return;
        const ctx = pieChartCanvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, pieChartCanvas.width, pieChartCanvas.height);

        const values = [pieValue1, pieValue2, pieValue3];
        const total = values.reduce((sum, val) => sum + val, 0);
        const colors = [
            'rgba(0, 0, 0, 0.8)',       // Black
            'rgba(128, 128, 128, 0.8)', // Gray
            'rgba(241, 196, 15, 0.8)'   // Yellow accent
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
            ctx.strokeStyle = '#fff';
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

        const months: string[] = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const streakDataFood: number[] = new Array(12).fill(0);
        const streakDataSport: number[] = new Array(12).fill(0);
        const streakDataAddiction: number[] = new Array(12).fill(0);

        const currentYear = new Date().getFullYear().toString();
        const API_BASE = "https://streak-worker-v2.streak-counter.workers.dev";

        // Retrieve authToken again if needed
        const AUTH_TOKEN = document.cookie
            .split('; ')
            .find(row => row.startsWith('authToken='))
            ?.split('=')[1];

        for (let i = 0; i < months.length; i++) {
            const month = months[i];
            try {
                const response = await fetch(`${API_BASE}/data?year=${currentYear}&month=${month}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${AUTH_TOKEN}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    streakDataFood[i] = data.food.reduce((sum: number, n: number) => sum + n, 0);
                    streakDataSport[i] = data.sport.reduce((sum: number, n: number) => sum + n, 0);
                    streakDataAddiction[i] = data.addiction.reduce((sum: number, n: number) => sum + n, 0);
                } else {
                    console.warn(`Data not found for ${month}. Using default zeros.`);
                }
            } catch (error) {
                console.error(`Error fetching data for ${month}:`, error);
            }
        }

        isLoadingStreak = false;
        await tick(); // Wait for the DOM to update (canvas is rendered)

        drawLineChart(streakDataFood, streakDataSport, streakDataAddiction, months);
    }

    function drawLineChart(dataFood: number[], dataSport: number[], dataAddiction: number[], months: string[]) {
        if (!lineChartCanvas) return;
        const ctx = lineChartCanvas.getContext('2d');
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
        ctx.strokeStyle = '#000';
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
            'rgba(241, 196, 15, 0.8)',  // Yellow for food
            'rgba(0, 128, 255, 0.8)',   // Blue for sport
            'rgba(34, 139, 34, 0.8)'    // Green for addiction
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
                ctx.fillStyle = '#000';
                ctx.fill();
            });
        }

        drawLine(dataFood, colors[0]);
        drawLine(dataSport, colors[1]);
        drawLine(dataAddiction, colors[2]);

        // X-axis labels
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.font = '10px Arial';
        months.forEach((month, i) => {
            const x = margin + i * xStep;
            const y = height - margin + 15;
            ctx.fillText(month.substring(0, 3), x, y);
        });

        // Y-axis labels
        ctx.textAlign = 'right';
        for (let val = yMin; val <= yMax; val += yMax / 4) {
            const y = height - margin - ((val - yMin) / (yMax - yMin)) * usableHeight;
            ctx.fillText(Math.round(val).toString(), margin - 5, y + 3);
        }
    }

    // --------------------------------
    //  Weight Loss Chart
    // --------------------------------
    function drawWeightChart() {
        if (!weightChartCanvas) return;
        const ctx = weightChartCanvas.getContext('2d');
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
        ctx.strokeStyle = '#000';
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

        // Line
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < 12; i++) {
            const weight = weightData[i];
            if (weight !== 0) {
                const x = margin + i * xStep;
                const y = height - margin - ((weight - yMin) / (yMax - yMin)) * usableHeight;
                if (!started) {
                    ctx.moveTo(x, y);
                    started = true;
                } else {
                    ctx.lineTo(x, y);
                }
            }
        }
        ctx.strokeStyle = 'rgba(241, 196, 15, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Points
        for (let i = 0; i < 12; i++) {
            const weight = weightData[i];
            if (weight !== 0) {
                const x = margin + i * xStep;
                const y = height - margin - ((weight - yMin) / (yMax - yMin)) * usableHeight;
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = '#000';
                ctx.fill();
            }
        }

        // X-axis labels
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        for (let i = 0; i < 12; i++) {
            const x = margin + i * xStep;
            const y = height - margin + 15;
            ctx.fillText(months[i], x, y);
        }

        // Y-axis labels
        ctx.textAlign = 'right';
        for (let w = yMin; w <= yMax; w += 10) {
            const y = height - margin - ((w - yMin) / (yMax - yMin)) * usableHeight;
            ctx.fillText(w.toString(), margin - 5, y + 3);
        }
    }

    // --------------------------------
    //  onMount: Load user profile, then draw charts
    // --------------------------------
    onMount(async () => {
        // 1) Load user profile (name, motivational_quote)
        await loadUserProfile();

        // 2) Now that we have the user info, we can draw our charts
        drawPieChart();
        fetchAndDrawStreakChart();
        drawWeightChart();
    });

    // Redraw pie chart when the pie inputs change
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
        justify-content: center;
        align-items: center;
    }

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
</style>

<div class="dashboard">
    <!-- Left Sidebar: Profile Card -->
    <div class="sidebar">
        <div class="profile-info">
            <!-- These are now populated from the KV user record -->
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
                        <canvas bind:this={weightChartCanvas} width="600" height="300"></canvas>
                    </div>
                </div>
            </fluent-card>
        </div>
    </div>
</div>
