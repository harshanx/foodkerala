// Function to handle login form submission
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("form");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent default form submission

            // Simulate authentication (Replace with actual backend logic)
            const phone = document.querySelector("input[name='phone']").value;
            const password = document.querySelector("input[name='password']").value;

            if (phone && password) {
                alert("Login successful! Redirecting to home page...");
                window.location.href = "home.html"; // Redirect to home page
            } else {
                alert("Please enter valid login credentials.");
            }
        });
    }
});

// Function to animate the header (if elements exist)
function animateHeader() {
    const headerTitle = document.querySelector(".header-title");
    const headerSubtitle = document.querySelector(".header-subtitle");

    if (headerTitle) headerTitle.classList.add("animate-header");
    if (headerSubtitle) headerSubtitle.classList.add("animate-header");
}

// Run animations when the page loads
document.addEventListener("DOMContentLoaded", animateHeader);
