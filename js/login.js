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


document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector(".form");
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = loginForm.querySelector("input[name='text']").value;

        try {
            const response = await fetch("https://chatbotdevplus-3.onrender.com/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (data.success) {
                // Lưu trạng thái thông báo vào localStorage
                localStorage.setItem("showSuccessAlert", "true");

                // Lưu verifyToken cho bước xác thực OTP
                localStorage.setItem("verifyToken", data.verifyToken);
                localStorage.setItem("userId", data.userId);
                
                // Chuyển hướng đến trang OTP
                window.location.href = "/html/otp.html";
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
});
