// otp.js
document.addEventListener("DOMContentLoaded", () => {
    const verifyForm = document.querySelector(".form");
    const inputs = document.querySelectorAll(".input");

    // Chuyển sang ô tiếp theo khi nhập xong một ô
    inputs.forEach((input, index) => {
        input.addEventListener("input", () => {
            if (input.value.length > 0 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
    });

    verifyForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const otp = Array.from(inputs).map(input => input.value).join("");
        const verifyToken = localStorage.getItem("verifyToken");

        try {
            const response = await fetch("https://chatbotdevplus-3.onrender.com/api/user/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otp, verifyToken }),
            });

            const data = await response.json();
            if (data.isAuth) {
                alert("Logged in successfully!");
                // Lưu token vào localStorage nếu cần thiết
                localStorage.setItem("token", data.token);
                localStorage.setItem("avatarUrl", "images/profile.png"); // Giả sử abc.jpg là ảnh avatar
                localStorage.setItem("helloName", "Hello Nam Le,"); // Giả sử abc.jpg là ảnh avatar
                window.location.href = "index.html"; // Điều hướng đến trang home
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
});
