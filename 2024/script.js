// Show the alert message on page load
window.onload = function() {
    alert("Welcome! Kindly click on Ok to see what Ezekiel has prepared for you.");
    document.getElementById("revealButton1").classList.remove("hidden");
};

// First button click to reveal the second button
document.getElementById("revealButton1").addEventListener("click", function() {
    document.getElementById("revealButton2").classList.remove("hidden");
    this.classList.add("hidden"); // Hide the first button
});

// Second button click to reveal the thank you message and flowers
document.getElementById("revealButton2").addEventListener("click", function() {
    document.getElementById("thankYouMessage").classList.remove("hidden");
    this.classList.add("hidden"); // Hide the second button

    // Create flowers that fall
    createFlowers();
});

// Function to create flowers
function createFlowers() {
    const flowerContainer = document.getElementById("flowerContainer");
    flowerContainer.classList.remove("hidden");

    for (let i = 0; i < 20; i++) { // Create 20 flowers
        const flower = document.createElement('div');
        flower.className = 'flower';
        flower.style.left = Math.random() * 100 + 'vw'; // Random horizontal position
        flower.style.top = Math.random() * -100 + 'px'; // Start above the viewport
        flowerContainer.appendChild(flower);

        // Remove the flower after animation ends
        flower.addEventListener('animationend', () => {
            flower.remove();
        });
    }
}
