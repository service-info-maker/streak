<script>
    import {PAGES} from "../utils/shared.ts";
    import {currentPage} from "../utils/store.ts";


</script>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
<style>
    /* Container that fills the parent's size */
    .profile {
        display: flex;

        padding-right: 3rem;
        justify-content: flex-end; /* Pushes content to the right */
        align-items: center;       /* Centers content vertically */
        width: 100%;
        height: 100%;
        position: relative;        /* Ensures proper positioning of pseudo-elements */
    }

    .avatar {
        /* Basic circle shape */
        width: 4rem;
        height: 4rem;
        border-radius: 50%;
        border: 2px solid rgba(0,0,0,0.5);

        /* Center content */
        display: flex;
        justify-content: center;
        align-items: center;

        /* Default styling */
        background-color: white;
        color:  rgba(0,0,0,0.8);
        font-family: Arial, sans-serif;
        font-size: 1.5rem;
        font-weight: bold;

        /* Hover effect */
        transition: transform 0.2s, box-shadow 0.2s;
        position: relative; /* Needed for the status indicator */
    }

    .avatar:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    /* Optional status indicator */
    .avatar::after {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        border: 2px solid white;
        background-color: rgba(245, 196, 0, 0.9);
    }

    /* Alternative image avatar */
    .avatar-image {
        background-image: url('https://example.com/profile-image.jpg');
        background-size: cover;
        background-position: center;
    }

    /* Icon-based avatar */
    .avatar-icon::before {
        content: '\f007'; /* Font Awesome user icon */
        font-family: 'Font Awesome 5 Free';
        font-weight: 900; /* Ensures the icon renders properly */
    }
</style>


<div class="profile">
    <div class="avatar avatar-icon" onclick={()=>{
                            currentPage.set(PAGES.PROFILE);
                             }
                             }></div>
</div>
