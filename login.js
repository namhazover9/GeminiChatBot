

// login.js
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector(".login-page");
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = loginForm.querySelector("input[name='text']").value;
        console.log("email: ", email);

        try {
            const response = await fetch("https://chatbotdevplus-3.onrender.com/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            console.log("data: ", data);
            if (data.success) {
                alert("OTP sent to your email!");
                // Store verifyToken for OTP verification step
                localStorage.setItem("verifyToken", data.verifyToken);
                localStorage.setItem("userId", data.userId);
                window.location.href = "otp.html"; // Redirect to OTP page
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
});
