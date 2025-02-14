<script lang="ts">
 import Navbar from "./components/Navbar.svelte";
 import Container from "./components/Container.svelte";
 import SignIn from "./components/SignIn.svelte";

 // A simple check for the authToken cookie
 let authToken: string | null = null;

 function updateAuthToken() {
  const matches = document.cookie.match(/(^|;) ?authToken=([^;]*)(;|$)/);
  authToken = matches ? matches[2] : null;
 }

 // Run this on initialization
 updateAuthToken();

 // When the SignIn component dispatches "signedIn",
 // update our authToken state.
 function handleSignedIn() {
  updateAuthToken();
 }
</script>

<main>
 <Navbar />
 <!-- If there is no authToken cookie, show SignIn, else show Container -->
 {#if !authToken}
  <SignIn on:signedIn={handleSignedIn} />
 {:else}
  <Container />
 {/if}
</main>
