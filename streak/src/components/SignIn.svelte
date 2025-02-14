<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    // Replace with your Worker endpoint
    const API_BASE = "https://streak-worker-v2.streak-counter.workers.dev";

    let username = "";
    let password = "";
    let errorMessage = "";

    /**
     * A simple SHA-256 hash function (demo purposes).
     * Concatenates username:password into one string, then hashes it.
     * Not secure enough for real-world production use.
     */
    async function simpleHash(input: string): Promise<string> {
        const msgUint8 = new TextEncoder().encode(input);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }

    /**
     * Handle sign-in when user clicks the "Sign In" button.
     */
    async function handleSignIn() {
        errorMessage = "";

        // 1) Combine username & password
        const combined = `${username}:${password}`;

        // 2) Hash them (as per your Worker’s expectation)
        const hashValue = await simpleHash(combined);

        try {
            // 3) Make a POST request to /login with "Authorization: Bearer <hash>"
            const res = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${hashValue}`
                }
            });

            if (res.ok) {
                // 4) User found in KV → store hash in a cookie (or localStorage, your choice)
                document.cookie = `authToken=${hashValue}; Path=/; Secure; SameSite=Strict;`;

                // You can also parse user data if you want to show "Welcome, {name}":
                // const user = await res.json();
                // console.log("Logged in user:", user);

                // Notify parent that user is signed in. The parent might navigate away, etc.
                dispatch("signedIn");
            } else if (res.status === 404) {
                // User not found in KV
                errorMessage = "Invalid credentials or user not found in KV.";
            } else {
                // Other unexpected status code
                errorMessage = `Login failed: ${res.status} ${res.statusText}`;
            }
        } catch (err) {
            console.error("Network error:", err);
            errorMessage = "Network error. Please try again.";
        }
    }
</script>

<style>
    .signin-container {
        max-width: 400px;
        margin: 4rem auto;
        padding: 2rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        font-family: sans-serif;
    }

    .signin-container h1 {
        margin-top: 0;
        font-size: 1.5rem;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    label {
        display: block;
        margin-bottom: 0.25rem;
        font-weight: bold;
    }

    input[type="text"],
    input[type="password"] {
        width: 100%;
        padding: 0.5rem;
        box-sizing: border-box;
    }

    button {
        padding: 0.5rem 1rem;
        font-size: 1rem;
        cursor: pointer;
        background: #f1c40f;
        color: #000;
        border: none;
        border-radius: 4px;
    }

    .error-message {
        margin-top: 1rem;
        color: red;
        font-weight: bold;
    }
</style>

<div class="signin-container">
    <h1>Sign In</h1>

    <div class="form-group">
        <label for="username">Username</label>
        <input
                id="username"
                type="text"
                bind:value={username}
                placeholder="Enter username"
        />
    </div>

    <div class="form-group">
        <label for="password">Password</label>
        <input
                id="password"
                type="password"
                bind:value={password}
                placeholder="Enter password"
        />
    </div>

    <button on:click={handleSignIn}>Sign In</button>

    {#if errorMessage}
        <div class="error-message">{errorMessage}</div>
    {/if}
</div>
