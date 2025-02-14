<script>
    // Import SVG assets from your assets folder
    import tate from "../assets/tate.svg";
    import musk from "../assets/musk.svg";
    import trump from "../assets/trump.svg";
    import goggins from "../assets/goggins.svg";
</script>

<style>
    /* Global Styles */
    html,
    body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background: #fff;
        color: #000; /* Force text color to black */
    }

    /* Main Container */
    .container {
        padding-top: 1rem;
        max-width: 800px;
        margin: 0 auto;
        color:black;


    }

    h1 {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
    }

    p.description {
        font-size: 1.2rem;
        margin-bottom: 2rem;
    }

    /* Quote Section Layout */
    .quote-section {
        display: flex;
        align-items: center;
        margin-bottom: 2rem;
        border-radius: 8px;
        padding:2rem;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        animation: fadeIn 0.8s ease forwards;
        opacity: 0;
    }
    /* Stagger animations for each section */
    .quote-section:nth-child(3) { animation-delay: 0.2s; }
    .quote-section:nth-child(4) { animation-delay: 0.4s; }
    .quote-section:nth-child(5) { animation-delay: 0.6s; }
    .quote-section:nth-child(6) { animation-delay: 0.8s; }

    .quote-section:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    /* Fade-in Animation */
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Layout for sections with image on left (SVG first) */
    .quote-section.left-image .svg-container {
        order: 0;
    }

    .quote-section.left-image .arrow {
        order: 1;
        margin: 0 1rem;
    }

    .quote-section.left-image .quote-text {
        order: 2;
    }

    /* Layout for sections with image on right (Text first) */
    .quote-section.right-image .quote-text {
        order: 0;
    }

    .quote-section.right-image .arrow {
        order: 1;
        margin: 0 1rem;
    }

    .quote-section.right-image .svg-container {
        order: 2;
    }

    /* SVG Container: Fixed size so that the image matches the text */
    .svg-container {
        width: 100px;
        height: 100px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #000;
        border-radius: 50%;
        overflow: hidden;
    }
    .svg-container img {
        max-width: 90%;
        max-height: 90%;
        display: block;
    }

    /* Quote text styling */
    .quote-text h3 {
        margin: 0;
        font-size: 1.5rem;
    }
    .quote-text p {
        margin: 0.5rem 0 0;
        font-size: 1rem;
        line-height: 1.4;
    }

    /* Arrow styling */
    .arrow {
        font-size: 2rem;
        transition: transform 0.3s ease;
    }
    .quote-section:hover .arrow {
        transform: translateX(5px);
    }
    /* Reverse arrow animation for sections with image on right */
    .quote-section.right-image:hover .arrow {
        transform: translateX(-5px);
    }
</style>

<div class="container">
    <h1>Motivational Quotes</h1>
    <p class="description">
        A collection of motivational quotes from some of the most talked-about personalities.
    </p>

    <!-- David Goggins: SVG on left -> text -->
    <div class="quote-section left-image">
        <div class="svg-container">
            <img src={goggins} alt="David Goggins" />
        </div>
        <div class="arrow">→</div>
        <div class="quote-text">
            <h3>David Goggins</h3>
            <p>"When you're in hell, you forget how great you really are because you're suffering and you forget the great things you've done.</p>
        </div>
    </div>
    <!-- Elon Musk: text <- SVG on right -->
    <div class="quote-section right-image">
        <div class="quote-text" >
            <h3>Elon Musk</h3>
            <p>"Let that sink in!"</p>
        </div>
        <div class="arrow">←</div>
        <div class="svg-container">
            <img src={musk} alt="Elon Musk" />
        </div>
    </div>

    <!-- Donald Trump: SVG on left -> text -->
    <div class="quote-section left-image">
        <div class="svg-container">
            <img src={trump} alt="Donald Trump" />
        </div>
        <div class="arrow">→</div>
        <div class="quote-text">
            <h3>Donald Trump</h3>
            <p>Trump mocks Chris Christie's weight: 'Don't call him a fat pig'</p>
        </div>
    </div>
    <!-- Andrew Tate: text <- SVG on right -->
    <div class="quote-section right-image" >
        <div class="quote-text" style="margin-bottom: 8rem">
            <h3>Andrew Tate</h3>
            <p>"Do you know whose fault is that talibans conquered Afghanistan? It is the fault of the hoes! You heard me - hoes!"</p>
        </div>
        <div class="arrow">←</div>
        <div class="svg-container">
            <img src={tate} alt="Andrew Tate" />
        </div>
    </div>


</div>
