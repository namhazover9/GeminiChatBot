// Some random colors
const colors = ["#c7c1c171"];

const numBalls = 50;
const balls = [];

for (let i = 0; i < numBalls; i++) {
  let ball = document.createElement("div");
  ball.classList.add("ball");
  ball.style.background = colors[Math.floor(Math.random() * colors.length)];
  ball.style.left = `${Math.floor(Math.random() * 100)}vw`;
  ball.style.top = `${Math.floor(Math.random() * 100)}vh`;
  ball.style.transform = `scale(${Math.random()})`;
  ball.style.width = `${Math.random()}em`;
  ball.style.height = ball.style.width;

  balls.push(ball);
  document.body.append(ball);
}

// Keyframes
balls.forEach((el, i) => {
  let to = {
    x: Math.random() * (i % 2 === 0 ? -11 : 11),
    y: -150// Y luôn âm để chỉ trôi lên
  };

  let anim = el.animate(
    [
      { transform: "translate(0, 0)" },
      { transform: `translate(${to.x}rem, ${to.y}rem)` }
    ],
    {
      duration: (Math.random() + 1) * 10000, // random duration
      direction: "normal", // Chỉ đi theo một hướng
      fill: "both",
      iterations: Infinity,
      easing: "linear"
    }
  );
});

// otp.js
document.addEventListener("DOMContentLoaded", () => {
    const verifyForm = document.querySelector(".form");
    const inputs = document.querySelectorAll(".input");
    const showSuccessAlert = localStorage.getItem("showSuccessAlert");
    
    if (showSuccessAlert === "true") {
        // Hiển thị thông báo thành công
        Swal.fire({
            position: "top",
            icon: "success",
            title: "OTP sent to your email",
            showConfirmButton: false,
            timer: 1500,
            width: '300px', // Điều chỉnh chiều rộng
            padding: '1em', // Điều chỉnh padding
            customClass: {
                popup: 'small-swal-popup' // Thêm lớp tùy chỉnh nếu cần
            }
        });

        // Xóa trạng thái thông báo để không hiển thị lại khi refresh trang
        localStorage.removeItem("showSuccessAlert");
    }

    
    
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
                // alert("Logged in successfully!");
                // Lưu trạng thái thông báo vào localStorage
                localStorage.setItem("showSuccessAlertIndex", "true");
                // Lưu token vào localStorage nếu cần thiết
                localStorage.setItem("token", data.token);
                localStorage.setItem("avatarUrl", "/images/fkava.png"); // Giả sử abc.jpg là ảnh avatar
                localStorage.setItem("helloName", "Hello my friend,"); // Giả sử abc.jpg là ảnh avatar
                window.location.href = "/index.html"; // Điều hướng đến trang home
            } else {
                Swal.fire({
                    position: "top",
                    icon: "error",
                    title: "Wrong OTP",
                    showConfirmButton: false,
                    timer: 1500,
                    width: '300px', // Điều chỉnh chiều rộng
                    padding: '1em', // Điều chỉnh padding
                    customClass: {
                        popup: 'small-swal-popup' // Thêm lớp tùy chỉnh nếu cần
                    }
                });
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
});
