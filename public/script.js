// SIGNUP
async function signup(event) {
  event.preventDefault();

  const fullname = document.getElementById("fullname").value;
  const email = document.getElementById("email").value;
  const username = document.getElementById("user").value;
  const password = document.getElementById("pass").value;
  const confirm = document.getElementById("confirm").value;
  const msgDiv = document.getElementById("msg");

  // Validation
  if (password.length < 8) {
    showMessage(msgDiv, "Password must be at least 8 characters", "error");
    return;
  }

  if (password !== confirm) {
    showMessage(msgDiv, "Passwords do not match", "error");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullname, email, username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      showMessage(
        msgDiv,
        "Account created successfully! Redirecting to login...",
        "success",
      );
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else {
      showMessage(msgDiv, data.message || "Signup failed", "error");
    }
  } catch (error) {
    showMessage(msgDiv, "Error during signup. Please try again.", "error");
    console.error(error);
  }
}

// LOGIN
async function login(event) {
  event.preventDefault();

  const username = document.getElementById("user").value;
  const password = document.getElementById("pass").value;
  const msgDiv = document.getElementById("msg");

  try {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      showMessage(msgDiv, "Login successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "booking.html";
      }, 1500);
    } else {
      showMessage(msgDiv, data.message || "Invalid credentials", "error");
    }
  } catch (error) {
    showMessage(msgDiv, "Error during login. Please try again.", "error");
    console.error(error);
  }
}

// BOOK
async function book(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const room = document.getElementById("room").value;
  const checkin = document.getElementById("checkin").value;
  const checkout = document.getElementById("checkout").value;
  const guests = document.getElementById("guests").value;
  const notes = document.getElementById("notes").value;
  const msgDiv = document.getElementById("msg");

  // Validation
  if (new Date(checkin) >= new Date(checkout)) {
    showMessage(msgDiv, "Check-out date must be after check-in date", "error");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        room,
        checkin,
        checkout,
        guests,
        notes,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      showMessage(
        msgDiv,
        "Booking confirmed! Check your email for confirmation.",
        "success",
      );
      setTimeout(() => {
        window.location.href = "index.html";
      }, 3000);
    } else {
      showMessage(msgDiv, data.message || "Booking failed", "error");
    }
  } catch (error) {
    showMessage(msgDiv, "Error during booking. Please try again.", "error");
    console.error(error);
  }
}

// HELPER FUNCTION FOR MESSAGES
function showMessage(element, message, type) {
  element.textContent = message;
  element.className = `msg show ${type}`;

  // Auto-hide after 5 seconds if error
  if (type === "error") {
    setTimeout(() => {
      element.classList.remove("show");
    }, 5000);
  }
}

// Set minimum checkout date
document.addEventListener("DOMContentLoaded", function () {
  const checkinInput = document.getElementById("checkin");
  const checkoutInput = document.getElementById("checkout");

  if (checkinInput) {
    // Set minimum date to today
    const today = new Date().toISOString().split("T")[0];
    checkinInput.setAttribute("min", today);

    // Update checkout minimum date when checkin changes
    checkinInput.addEventListener("change", function () {
      const nextDay = new Date(checkinInput.value);
      nextDay.setDate(nextDay.getDate() + 1);
      checkoutInput.setAttribute("min", nextDay.toISOString().split("T")[0]);
    });
  }
});

// PAYMENT (SIMULATION)
function pay() {
  alert("Payment Successful 💳 (Demo)");
}

// AMENITIES AUTO SLIDER
document.addEventListener("DOMContentLoaded", function () {
  const slider = document.getElementById("amenitiesSlider");
  const prevBtn = document.querySelector(".amenity-nav-prev");
  const nextBtn = document.querySelector(".amenity-nav-next");
  if (!slider || !prevBtn || !nextBtn) return;

  const cards = slider.querySelectorAll(".amenity");
  if (!cards.length) return;

  const gap = 24;
  const cardWidth = cards[0].offsetWidth + gap;
  let autoSlideInterval;

  function goNext() {
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    if (slider.scrollLeft >= maxScroll - 2) {
      slider.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      slider.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
  }

  function goPrev() {
    if (slider.scrollLeft <= 2) {
      slider.scrollTo({ left: maxScroll, behavior: "smooth" });
    } else {
      slider.scrollBy({ left: -cardWidth, behavior: "smooth" });
    }
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(goNext, 3000);
  }

  function stopAutoSlide() {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
      autoSlideInterval = null;
    }
  }

  nextBtn.addEventListener("click", () => {
    goNext();
    startAutoSlide();
  });

  prevBtn.addEventListener("click", () => {
    goPrev();
    startAutoSlide();
  });

  slider.addEventListener("mouseenter", stopAutoSlide);
  slider.addEventListener("mouseleave", startAutoSlide);
  slider.style.cursor = "grab";

  startAutoSlide();
});
