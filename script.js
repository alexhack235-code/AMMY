// ========================================================
// AMMANDA'S ROYAL BIRTHDAY EXPERIENCE SCRIPT
// Particle systems, audio triggers, German music popup & widgets
// ========================================================

document.addEventListener("DOMContentLoaded", () => {
  initConfettiCanvas();
  initSparkleCursor();
  initPartyPopper();
  initEnvelope();
  initBalloons();
  initCakeAndCandles();
  initGiftBox();
  initReasonCards();
  initMirror();
  initCupcakeStudio();
  initWishbook();
  initPolaroidWall();
  initAudioControls();
  initGermanMusicPopup();
});

// ========================================================
// 1. FULLSCREEN CONFETTI & PARTICLES ENGINE (ANDROID OPTIMIZED)
// ========================================================
let confettiCanvas, ctx;
let particles = [];
let prevWidth = 0;
let lastRenderTime = 0;
const isMobileDevice = window.innerWidth < 768 || /Android|iPhone|iPad/i.test(navigator.userAgent);
const maxAmbientParticles = isMobileDevice ? 22 : 45;

function initConfettiCanvas() {
  confettiCanvas = document.getElementById("confetti-canvas");
  if (!confettiCanvas) return;
  ctx = confettiCanvas.getContext("2d", { alpha: true });

  function resize() {
    const currentWidth = window.innerWidth;
    // On mobile Android, ignore vertical-only resize events caused by address bar collapsing/expanding
    if (Math.abs(currentWidth - prevWidth) < 12 && prevWidth !== 0) return;
    prevWidth = currentWidth;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    confettiCanvas.width = window.innerWidth * dpr;
    confettiCanvas.height = window.innerHeight * dpr;
    confettiCanvas.style.width = window.innerWidth + "px";
    confettiCanvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("orientationchange", () => {
    prevWidth = 0;
    setTimeout(resize, 100);
  }, { passive: true });
  resize();

  requestAnimationFrame(renderConfetti);
}

function triggerConfetti(originX, originY, count = 60) {
  if (!confettiCanvas) return;
  // Cap burst count on mobile to keep 60/120 fps butter smooth
  const actualCount = isMobileDevice ? Math.min(count, 35) : count;
  const colors = [
    "#f43f73", "#ff758f", "#ffd700", "#f472b6", 
    "#d8b4fe", "#fed7aa", "#fff", "#fb7185", "#fbb6ce"
  ];
  const shapes = ["circle", "rect", "heart", "star"];

  for (let i = 0; i < actualCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 3;
    particles.push({
      x: originX || window.innerWidth / 2,
      y: originY || window.innerHeight / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      gravity: 0.22,
      friction: 0.96,
      opacity: 1,
      decay: Math.random() * 0.016 + 0.01
    });
  }
}

function renderConfetti(timestamp) {
  if (!ctx || !confettiCanvas) return;

  // Frame rate throttling for mobile stability (~60fps ceiling)
  if (timestamp) {
    const elapsed = timestamp - lastRenderTime;
    if (elapsed < 14) {
      requestAnimationFrame(renderConfetti);
      return;
    }
    lastRenderTime = timestamp;
  }

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.vx *= p.friction;
    p.vy *= p.friction;
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;
    p.opacity -= p.decay;

    if (p.opacity <= 0 || p.y > window.innerHeight + 40) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = Math.max(0, p.opacity);
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;

    if (p.shape === "rect") {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    } else if (p.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === "heart") {
      drawHeart(ctx, 0, 0, p.size * 0.8);
    } else if (p.shape === "star") {
      drawStar(ctx, 0, 0, 5, p.size * 0.8, p.size * 0.4);
    } else if (p.shape === "petal") {
      drawPetal(ctx, 0, 0, p.size);
    }
    ctx.restore();
  }

  // Gentle ambient falling blossom petals
  ambientPetalTick();

  requestAnimationFrame(renderConfetti);
}

let ambientCounter = 0;
function ambientPetalTick() {
  if (!confettiCanvas) return;
  ambientCounter++;
  const interval = isMobileDevice ? 55 : 38;
  if (ambientCounter % interval === 0 && particles.length < maxAmbientParticles) {
    const petalColors = ["#fbcfe8", "#fbb6ce", "#f472b6", "#fed7aa", "#ffd700", "#ffffff"];
    particles.push({
      x: Math.random() * window.innerWidth,
      y: -20,
      vx: Math.sin(ambientCounter * 0.04) * 0.8,
      vy: Math.random() * 0.9 + 0.6,
      size: Math.random() * 6 + 7,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      shape: Math.random() > 0.4 ? "petal" : (Math.random() > 0.5 ? "heart" : "star"),
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      gravity: 0.01,
      friction: 0.99,
      opacity: 0.7,
      decay: 0.0012
    });
  }
}

function drawPetal(c, x, y, size) {
  c.beginPath();
  c.ellipse(x, y, size * 0.5, size * 0.9, Math.PI / 4, 0, Math.PI * 2);
  c.fill();
}

function drawHeart(c, x, y, size) {
  c.beginPath();
  const topCurveHeight = size * 0.3;
  c.moveTo(x, y + topCurveHeight);
  c.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
  c.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 1.4, x, y + size);
  c.bezierCurveTo(x, y + (size + topCurveHeight) / 1.4, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
  c.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
  c.fill();
}

function drawStar(c, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  c.beginPath();
  c.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    c.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    c.lineTo(x, y);
    rot += step;
  }
  c.lineTo(cx, cy - outerRadius);
  c.closePath();
  c.fill();
}

function celebrateScreenShower() {
  let count = 0;
  const interval = setInterval(() => {
    triggerConfetti(Math.random() * window.innerWidth, -20, 35);
    count++;
    if (count > 8) clearInterval(interval);
  }, 250);
}

// ========================================================
// 2. SPARKLE CURSOR TRAIL
// ========================================================
let isCursorTrailActive = true;

function initSparkleCursor() {
  document.body.classList.add("sparkle-cursor-active");

  let throttle = 0;
  window.addEventListener("mousemove", (e) => {
    if (!isCursorTrailActive) return;
    const now = Date.now();
    if (now - throttle < 35) return;
    throttle = now;

    createSparkleParticle(e.clientX, e.clientY);
  });
}

function createSparkleParticle(x, y) {
  const sparkle = document.createElement("div");
  const emojis = ["✨", "💖", "🌸", "⭐", "🎀"];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  sparkle.innerText = randomEmoji;
  sparkle.style.position = "fixed";
  sparkle.style.left = `${x + (Math.random() * 16 - 8)}px`;
  sparkle.style.top = `${y + (Math.random() * 16 - 8)}px`;
  sparkle.style.fontSize = `${Math.random() * 10 + 10}px`;
  sparkle.style.pointerEvents = "none";
  sparkle.style.zIndex = "9998";
  sparkle.style.transition = "transform 0.8s ease-out, opacity 0.8s ease-out";
  sparkle.style.transform = `scale(1) translate(0, 0)`;
  sparkle.style.opacity = "0.9";

  document.body.appendChild(sparkle);

  requestAnimationFrame(() => {
    const offsetX = (Math.random() - 0.5) * 40;
    const offsetY = Math.random() * 30 + 20;
    sparkle.style.transform = `scale(0.3) translate(${offsetX}px, ${offsetY}px)`;
    sparkle.style.opacity = "0";
  });

  setTimeout(() => {
    sparkle.remove();
  }, 800);
}

// ========================================================
// 3. PARTY POPPER BUTTON
// ========================================================
function initPartyPopper() {
  const popperBtn = document.getElementById("party-popper-top-btn");
  if (!popperBtn) return;

  popperBtn.addEventListener("click", () => {
    if (window.birthdayAudio) {
      window.birthdayAudio.playCelebration();
    }
    const rect = popperBtn.getBoundingClientRect();
    triggerConfetti(rect.left + rect.width / 2, rect.bottom + 20, 60);
    celebrateScreenShower();
    showToast("🎉 YAAY! Happy Birthday Queen Ammanda! 🌸✨");
  });
}

// ========================================================
// 4. ROYAL ENVELOPE & LETTER
// ========================================================
function initEnvelope() {
  const envelope = document.getElementById("royal-envelope-elem");
  const letter = document.getElementById("unfolded-parchment-letter");
  if (!envelope || !letter) return;

  envelope.addEventListener("click", () => {
    if (window.birthdayAudio) {
      window.birthdayAudio.playGiftOpen();
    }
    const rect = envelope.getBoundingClientRect();
    triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 70);

    envelope.style.transition = "transform 0.5s ease, opacity 0.5s ease";
    envelope.style.transform = "scale(0.8) translateY(-20px)";
    envelope.style.opacity = "0";

    setTimeout(() => {
      envelope.style.display = "none";
      letter.style.display = "block";
      letter.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 450);

    showToast("💌 Wax seal broken! Read your royal birthday letter!");
  });
}

// ========================================================
// 5. BALLOON POPPING & COMPLIMENTS
// ========================================================
const balloonCompliments = [
  "A - Ammanda, you radiate pure sunshine and warmth! ☀️",
  "M - Magnetic charm! You light up every room you enter! 💖",
  "M - Mind-blowingly gorgeous, inside and out! 🌸",
  "A - Absolutely irreplaceable to everyone in your life! 👑",
  "N - Naturally fabulous and effortlessly graceful! ✨",
  "D - Darling, sweet, and the best friend anyone could wish for! 🎀",
  "A - Always inspiring with your laughter and kindness! 🧁"
];

function initBalloons() {
  const balloons = document.querySelectorAll(".balloon-item");
  balloons.forEach((balloon, index) => {
    balloon.addEventListener("click", () => {
      const rect = balloon.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      if (window.birthdayAudio) {
        window.birthdayAudio.playPop();
      }
      triggerConfetti(x, y, 40);

      balloon.style.transform = "scale(1.4)";
      balloon.style.opacity = "0";
      setTimeout(() => {
        balloon.style.visibility = "hidden";
      }, 150);

      showToast(balloonCompliments[index] || "Happy Birthday Ammanda! 🌸");

      setTimeout(() => {
        balloon.style.visibility = "visible";
        balloon.style.opacity = "1";
        balloon.style.transform = "scale(1)";
      }, 5000);
    });
  });
}

// ========================================================
// 6. INTERACTIVE CAKE & CANDLE BLOW
// ========================================================
let areCandlesLit = true;

function initCakeAndCandles() {
  const blowBtn = document.getElementById("blow-candles-btn");
  const relightBtn = document.getElementById("relight-candles-btn");
  const flames = document.querySelectorAll(".flame");
  const puffs = document.querySelectorAll(".smoke-puff");
  const wishStatus = document.getElementById("wish-status-badge");
  const saveWishBtn = document.getElementById("save-wish-btn");
  const wishInput = document.getElementById("secret-wish-input");
  const wishDisplay = document.getElementById("wish-jar-display");

  const savedWishes = JSON.parse(localStorage.getItem("ammanda_wishes") || "[]");
  savedWishes.forEach(w => renderWishTag(w, wishDisplay));

  function blowCandles() {
    if (!areCandlesLit) return;
    areCandlesLit = false;

    if (window.birthdayAudio) {
      window.birthdayAudio.playBlow();
      setTimeout(() => {
        window.birthdayAudio.playCelebration();
      }, 350);
    }

    flames.forEach(f => f.classList.add("extinguished"));
    puffs.forEach(p => {
      p.classList.add("rising");
      setTimeout(() => p.classList.remove("rising"), 1600);
    });

    const cakeRect = document.querySelector(".cake-scene").getBoundingClientRect();
    triggerConfetti(cakeRect.left + cakeRect.width / 2, cakeRect.top, 90);
    celebrateScreenShower();

    if (wishStatus) {
      wishStatus.innerHTML = `✨ <b>Wish Granted!</b> Happy Birthday Queen Ammanda! 💖`;
      wishStatus.style.background = "#dcfce7";
      wishStatus.style.borderColor = "#86efac";
    }

    if (blowBtn) blowBtn.style.display = "none";
    if (relightBtn) relightBtn.style.display = "inline-flex";

    showToast("🎉 Candles blown! May all Ammanda's dreams come true!");
  }

  function relightCandles() {
    areCandlesLit = true;
    flames.forEach(f => f.classList.remove("extinguished"));
    if (window.birthdayAudio) {
      window.birthdayAudio.playSparkle();
    }
    if (wishStatus) {
      wishStatus.innerHTML = `🎂 Candles glowing! Make a wish and blow! ✨`;
      wishStatus.style.background = "#fff";
      wishStatus.style.borderColor = "var(--pink-400)";
    }
    if (blowBtn) blowBtn.style.display = "inline-flex";
    if (relightBtn) relightBtn.style.display = "none";
  }

  if (blowBtn) blowBtn.addEventListener("click", blowCandles);
  if (relightBtn) relightBtn.addEventListener("click", relightCandles);

  const candles = document.querySelectorAll(".candle");
  candles.forEach(candle => {
    candle.addEventListener("click", () => {
      const flame = candle.querySelector(".flame");
      if (flame) {
        if (flame.classList.contains("extinguished")) {
          flame.classList.remove("extinguished");
          if (window.birthdayAudio) window.birthdayAudio.playSparkle();
        } else {
          flame.classList.add("extinguished");
          if (window.birthdayAudio) window.birthdayAudio.playBlow();
        }
      }
    });
  });

  if (saveWishBtn && wishInput && wishDisplay) {
    saveWishBtn.addEventListener("click", () => {
      const wishText = wishInput.value.trim();
      if (!wishText) {
        showToast("🌸 Please type a sweet wish first!");
        return;
      }
      savedWishes.push(wishText);
      localStorage.setItem("ammanda_wishes", JSON.stringify(savedWishes));
      renderWishTag(wishText, wishDisplay);
      wishInput.value = "";
      if (window.birthdayAudio) window.birthdayAudio.playSparkle();
      showToast("💌 Secret Wish safely sealed in Ammanda's Constellation Jar! ✨");
      triggerConfetti(window.innerWidth / 2, window.innerHeight * 0.6, 40);
    });
  }
}

function renderWishTag(text, container) {
  const tag = document.createElement("span");
  tag.className = "wish-tag";
  tag.innerHTML = `⭐ "${escapeHtml(text)}"`;
  container.appendChild(tag);
}

// ========================================================
// 7. SURPRISE GIFT BOX UNBOXING
// ========================================================
function initGiftBox() {
  const giftBox = document.getElementById("main-gift-box");
  const couponsArea = document.getElementById("gift-coupons-container");

  if (!giftBox) return;

  giftBox.addEventListener("click", () => {
    if (giftBox.classList.contains("opened")) return;
    giftBox.classList.add("opened");

    if (window.birthdayAudio) {
      window.birthdayAudio.playGiftOpen();
    }

    const rect = giftBox.getBoundingClientRect();
    triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 80);

    setTimeout(() => {
      if (couponsArea) {
        couponsArea.style.display = "grid";
        couponsArea.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 600);

    showToast("🎁 Woohoo! You unlocked Ammanda's VIP Birthday Perk Pass!");
  });

  const redeemButtons = document.querySelectorAll(".redeem-btn");
  redeemButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      btn.classList.add("redeemed");
      btn.innerText = "✓ Redeemed with Love 💕";
      if (window.birthdayAudio) {
        window.birthdayAudio.playSparkle();
      }
      const rect = btn.getBoundingClientRect();
      triggerConfetti(rect.left + rect.width / 2, rect.top, 30);
      showToast("💖 Coupon officially honored! Enjoy your perk, Queen Ammanda!");
    });
  });
}

// ========================================================
// 8. 10 REASONS FLIP CARDS
// ========================================================
function initReasonCards() {
  const cards = document.querySelectorAll(".reason-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
      if (window.birthdayAudio) window.birthdayAudio.playSparkle();
    });
  });
}

// ========================================================
// 9. QUEEN'S COMPLIMENT MIRROR
// ========================================================
const royalCompliments = [
  "\"Ammanda's smile is 100% contagious and known to instantly brighten dull days!\"",
  "\"Today's Royal Decree: Ammanda is officially entitled to unlimited desserts and adoration!\"",
  "\"Even the stars get a little jealous of how effortlessly you glow, Ammanda!\"",
  "\"You bring an unmatched elegance, sweetness, and genuine magic wherever you go.\"",
  "\"Fun Fact: The world became 10,000x sweeter on the day Ammanda was born!\"",
  "\"Never forget how capable, loved, and breathtakingly wonderful you are.\"",
  "\"Ammanda's laughter is ranked #1 in heartwarming sounds worldwide.\"",
  "\"Warning: Ammanda's style and vibe are too fabulous for ordinary Mondays!\"",
  "\"May your coming year be filled with passport stamps, sweet latte dates, and endless joy!\"",
  "\"You don't just sparkle, Ammanda — you light up the entire galaxy.\""
];

function initMirror() {
  const mirror = document.getElementById("magic-mirror-card");
  const fortuneText = document.getElementById("mirror-fortune-display");
  if (!mirror || !fortuneText) return;

  let lastIndex = -1;

  mirror.addEventListener("click", () => {
    if (window.birthdayAudio) {
      window.birthdayAudio.playSparkle();
    }

    fortuneText.style.opacity = "0";

    const rect = mirror.getBoundingClientRect();
    triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);

    setTimeout(() => {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * royalCompliments.length);
      } while (nextIndex === lastIndex && royalCompliments.length > 1);
      lastIndex = nextIndex;

      fortuneText.innerText = royalCompliments[nextIndex];
      fortuneText.style.opacity = "1";
    }, 280);
  });
}

// ========================================================
// 10. CUPCAKE CREATOR MINI-STUDIO
// ========================================================
function initCupcakeStudio() {
  const sponge = document.getElementById("cupcake-sponge-elem");
  const frosting = document.getElementById("cupcake-frosting-elem");
  const frostingTop = document.getElementById("cupcake-frosting-top-elem");
  const topper = document.getElementById("cupcake-topper-elem");
  const serveBtn = document.getElementById("serve-cupcake-btn");

  const spongeColors = {
    "strawberry": "#f472b6",
    "vanilla": "#fef08a",
    "chocolate": "#854d0e",
    "lavender": "#d8b4fe"
  };

  const frostingColors = {
    "pink-buttercream": "#fbb6ce",
    "lavender-swirl": "#e9d5ff",
    "gold-cream": "#fed7aa",
    "mint-cloud": "#bbf7d0"
  };

  document.querySelectorAll("[data-cupcake-sponge]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-cupcake-sponge]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const val = btn.getAttribute("data-cupcake-sponge");
      if (sponge && spongeColors[val]) {
        sponge.style.background = spongeColors[val];
      }
      if (window.birthdayAudio) window.birthdayAudio.playSparkle();
    });
  });

  document.querySelectorAll("[data-cupcake-frosting]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-cupcake-frosting]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const val = btn.getAttribute("data-cupcake-frosting");
      if (frosting && frostingColors[val]) {
        frosting.style.background = frostingColors[val];
        frostingTop.style.background = frostingColors[val];
      }
      if (window.birthdayAudio) window.birthdayAudio.playSparkle();
    });
  });

  document.querySelectorAll("[data-cupcake-topper]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-cupcake-topper]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const icon = btn.getAttribute("data-cupcake-topper");
      if (topper) topper.innerText = icon;
      if (window.birthdayAudio) window.birthdayAudio.playSparkle();
    });
  });

  if (serveBtn) {
    serveBtn.addEventListener("click", () => {
      if (window.birthdayAudio) window.birthdayAudio.playCelebration();
      const rect = serveBtn.getBoundingClientRect();
      triggerConfetti(rect.left + rect.width / 2, rect.top, 50);
      showToast("🧁 Delicious Masterpiece served to Birthday Queen Ammanda!");
    });
  }
}

// ========================================================
// 11. FAIRY LIGHT WISHBOOK / GUESTBOOK
// ========================================================
const defaultNotes = [
  {
    name: "Sophie & Mia",
    msg: "Happy Birthday to the most gorgeous, kindest girl ever! Keep shining bright, Ammanda!",
    color: "pink",
    sticker: "👑"
  },
  {
    name: "Alex",
    msg: "To another year of hilarious inside jokes, fun road trips, and endless laughter. Have the best day!",
    color: "peach",
    sticker: "🌸"
  },
  {
    name: "Your Secret Admirer",
    msg: "May your day be as sweet, sweet as strawberry frosting and filled with magic!",
    color: "lavender",
    sticker: "💖"
  },
  {
    name: "Chloe",
    msg: "Ammanda, you are literally the queen of good energy. Love you tons, happy birthday babe!",
    color: "yellow",
    sticker: "🎀"
  }
];

function initWishbook() {
  const container = document.getElementById("wishbook-notes-container");
  const form = document.getElementById("leave-wish-form");
  const nameInput = document.getElementById("wish-author-name");
  const msgInput = document.getElementById("wish-author-msg");

  let selectedColor = "pink";
  let selectedSticker = "💖";

  document.querySelectorAll(".color-dot").forEach(dot => {
    dot.addEventListener("click", () => {
      document.querySelectorAll(".color-dot").forEach(d => d.classList.remove("active"));
      dot.classList.add("active");
      selectedColor = dot.getAttribute("data-color");
    });
  });

  document.querySelectorAll(".sticker-option").forEach(stk => {
    stk.addEventListener("click", () => {
      document.querySelectorAll(".sticker-option").forEach(s => s.classList.remove("active"));
      stk.classList.add("active");
      selectedSticker = stk.getAttribute("data-sticker");
    });
  });

  let storedNotes = JSON.parse(localStorage.getItem("ammanda_guestbook_notes"));
  if (!storedNotes || storedNotes.length === 0) {
    storedNotes = defaultNotes;
    localStorage.setItem("ammanda_guestbook_notes", JSON.stringify(storedNotes));
  }

  function renderNotes() {
    if (!container) return;
    container.innerHTML = "";
    storedNotes.forEach(note => {
      const noteEl = document.createElement("div");
      noteEl.className = `wish-sticky-note color-${note.color}`;
      noteEl.innerHTML = `
        <div class="push-pin"></div>
        <div class="note-message">"${escapeHtml(note.msg)}"</div>
        <div class="note-author">— With love, ${escapeHtml(note.name)}</div>
        <div class="note-sticker">${note.sticker}</div>
      `;
      container.appendChild(noteEl);
    });
  }

  renderNotes();

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const msg = msgInput.value.trim();

      if (!name || !msg) {
        showToast("🌸 Please enter both your name and a sweet message!");
        return;
      }

      const newNote = {
        name,
        msg,
        color: selectedColor,
        sticker: selectedSticker
      };

      storedNotes.unshift(newNote);
      localStorage.setItem("ammanda_guestbook_notes", JSON.stringify(storedNotes));
      renderNotes();

      nameInput.value = "";
      msgInput.value = "";

      if (window.birthdayAudio) window.birthdayAudio.playSparkle();
      const rect = form.getBoundingClientRect();
      triggerConfetti(rect.left + rect.width / 2, rect.top, 50);
      showToast("💌 Your birthday wish is pinned on Ammanda's Fairy Light Board!");
    });
  }
}

// ========================================================
// 12. POLAROID MEMORY WALL & CUSTOM PHOTO ADDER
// ========================================================
const defaultMemories = [
  {
    img: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80",
    caption: "Birthday Girl Glamour ✨",
    tag: "Queen Energy"
  },
  {
    img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80",
    caption: "Balloons & Champagne Toasts 🥂",
    tag: "Fabulous Celebrations"
  },
  {
    img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop&q=80",
    caption: "Sweetest Moments & Sweetest Treats 🍓",
    tag: "Pure Joy"
  },
  {
    img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80",
    caption: "Making Unforgettable Memories 💖",
    tag: "Laughter & Love"
  }
];

function initPolaroidWall() {
  const gallery = document.getElementById("polaroids-gallery-container");
  const modal = document.getElementById("add-memory-modal");
  const openModalBtn = document.getElementById("open-add-memory-btn");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const uploadForm = document.getElementById("add-memory-form");
  const captionInput = document.getElementById("memory-caption-input");
  const fileInput = document.getElementById("memory-file-input");
  const urlInput = document.getElementById("memory-url-input");

  let memories = JSON.parse(localStorage.getItem("ammanda_memories"));
  if (!memories || memories.length === 0) {
    memories = defaultMemories;
    localStorage.setItem("ammanda_memories", JSON.stringify(memories));
  }

  function renderMemories() {
    if (!gallery) return;
    gallery.innerHTML = "";
    memories.forEach(m => {
      const card = document.createElement("div");
      card.className = "polaroid-card";
      card.innerHTML = `
        <div class="washi-tape"></div>
        <div class="polaroid-photo-frame">
          <img src="${escapeHtml(m.img)}" alt="${escapeHtml(m.caption)}" class="polaroid-photo" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80'">
        </div>
        <div class="polaroid-caption">${escapeHtml(m.caption)}</div>
        <div class="polaroid-tag">#${escapeHtml(m.tag || "AmmandaDay")}</div>
      `;
      card.addEventListener("click", () => {
        if (window.birthdayAudio) window.birthdayAudio.playSparkle();
        const rect = card.getBoundingClientRect();
        triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
      });
      gallery.appendChild(card);
    });
  }

  renderMemories();

  if (openModalBtn && modal) {
    openModalBtn.addEventListener("click", () => {
      modal.classList.add("active");
    });
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  if (uploadForm) {
    uploadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const caption = captionInput.value.trim() || "Cherished Birthday Memory 💕";

      const saveAndAdd = (imgUrl) => {
        memories.unshift({
          img: imgUrl,
          caption: caption,
          tag: "Unforgettable"
        });
        localStorage.setItem("ammanda_memories", JSON.stringify(memories));
        renderMemories();
        if (modal) modal.classList.remove("active");
        uploadForm.reset();
        if (window.birthdayAudio) window.birthdayAudio.playSparkle();
        showToast("📸 New memory pinned to Ammanda's Polaroid Wall!");
      };

      if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          saveAndAdd(event.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else if (urlInput && urlInput.value.trim()) {
        saveAndAdd(urlInput.value.trim());
      } else {
        showToast("🌸 Please select an image file or provide an image link!");
      }
    });
  }
}

// ========================================================
// 13. AUDIO & FLOATING CONTROLS
// ========================================================
function initAudioControls() {
  const musicToggleBtn = document.getElementById("music-toggle-btn");
  const nextTrackBtn = document.getElementById("next-track-btn");
  const vinylDisc = document.getElementById("nav-vinyl-disc");
  const trackInfo = document.getElementById("nav-track-title");
  const muteBtn = document.getElementById("audio-mute-btn");
  const cursorToggleBtn = document.getElementById("cursor-toggle-btn");

  if (musicToggleBtn && window.birthdayAudio) {
    musicToggleBtn.addEventListener("click", () => {
      const isPlaying = window.birthdayAudio.toggleMusic((trackName) => {
        if (trackInfo) trackInfo.innerText = trackName;
      });

      if (isPlaying) {
        musicToggleBtn.innerHTML = "⏸";
        if (vinylDisc) vinylDisc.classList.add("spinning");
        showToast("🎵 Playing Birthday Music Box melody! ✨");
      } else {
        musicToggleBtn.innerHTML = "▶";
        if (vinylDisc) vinylDisc.classList.remove("spinning");
      }
    });
  }

  if (nextTrackBtn && window.birthdayAudio) {
    nextTrackBtn.addEventListener("click", () => {
      window.birthdayAudio.nextTrack((trackName) => {
        if (trackInfo) trackInfo.innerText = trackName;
      });
      showToast("🎶 Next tune loaded!");
    });
  }

  if (muteBtn && window.birthdayAudio) {
    muteBtn.addEventListener("click", () => {
      const isMuted = window.birthdayAudio.toggleMute();
      muteBtn.innerHTML = isMuted ? "🔇" : "🔔";
      showToast(isMuted ? "Sound muted" : "Sound effects active! 🔔");
    });
  }

  if (cursorToggleBtn) {
    cursorToggleBtn.addEventListener("click", () => {
      isCursorTrailActive = !isCursorTrailActive;
      document.body.classList.toggle("sparkle-cursor-active", isCursorTrailActive);
      cursorToggleBtn.style.opacity = isCursorTrailActive ? "1" : "0.5";
      showToast(isCursorTrailActive ? "✨ Sparkle cursor on!" : "Cursor trail paused");
    });
  }
}

// ========================================================
// 14. GERMAN BIRTHDAY MUSIC POP-UP MODAL & PLAYER
// ========================================================
function initGermanMusicPopup() {
  const popup = document.getElementById("german-music-popup");
  const openBtn = document.getElementById("open-german-music-btn");
  const closeBtn = document.getElementById("close-german-popup-btn");
  const exploreBtn = document.getElementById("popup-explore-btn");
  const cheerBtn = document.getElementById("popup-cheer-btn");
  const playCircleBtn = document.getElementById("popup-play-btn");
  const listenBtn = document.getElementById("popup-listen-btn");
  const audioEl = document.getElementById("german-audio-element");
  const discWrap = document.getElementById("popup-german-disc");
  const progressSlider = document.getElementById("popup-progress-slider");
  const currTimeEl = document.getElementById("popup-curr-time");
  const totalTimeEl = document.getElementById("popup-total-time");

  if (!popup) return;

  function openPopup() {
    popup.classList.add("active");
    if (window.birthdayAudio) window.birthdayAudio.playSparkle();
    triggerConfetti(window.innerWidth / 2, window.innerHeight * 0.35, 45);
  }

  function closePopup() {
    popup.classList.remove("active");
  }

  // Open on button click
  if (openBtn) {
    openBtn.addEventListener("click", openPopup);
  }

  if (closeBtn) closeBtn.addEventListener("click", closePopup);
  if (exploreBtn) exploreBtn.addEventListener("click", closePopup);

  // Auto bring up the pop up music on load after 1.2s!
  setTimeout(() => {
    openPopup();
    showToast("🇩🇪 Alles Gute zum Geburtstag, Ammanda! 🌸✨");
  }, 1200);

  // Play / Pause German Song
  let isPlaying = false;

  function toggleGermanAudio() {
    if (!audioEl) {
      // Fallback to synthesized German track
      if (window.birthdayAudio) {
        window.birthdayAudio.playTrack(0, (title) => {
          showToast(`🎵 Playing: ${title}`);
        });
      }
      return;
    }

    if (isPlaying) {
      audioEl.pause();
      isPlaying = false;
      updatePlayState(false);
    } else {
      // Pause background music box if playing so they don't clash
      if (window.birthdayAudio && window.birthdayAudio.isMusicPlaying) {
        window.birthdayAudio.stopMusic();
        const musicToggleBtn = document.getElementById("music-toggle-btn");
        if (musicToggleBtn) musicToggleBtn.innerHTML = "▶";
        const vinylDisc = document.getElementById("nav-vinyl-disc");
        if (vinylDisc) vinylDisc.classList.remove("spinning");
      }

      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isPlaying = true;
            updatePlayState(true);
            showToast("🎶 Jetzt läuft: Zum Geburtstag viel Glück! 🇩🇪🎂");
          })
          .catch((err) => {
            console.log("Audio autoplay restriction or file error, using Web Audio synth fallback:", err);
            // Seamlessly fallback to Web Audio API synthesized German track!
            if (window.birthdayAudio) {
              window.birthdayAudio.playTrack(0, (t) => {
                showToast(`🎶 Jetzt läuft: ${t}`);
              });
              isPlaying = true;
              updatePlayState(true);
            }
          });
      }
    }
  }

  function updatePlayState(playing) {
    if (playCircleBtn) playCircleBtn.innerHTML = playing ? "⏸" : "▶";
    if (listenBtn) {
      listenBtn.innerHTML = playing ? "<span>⏸</span> Pause" : "<span>🎵</span> Jetzt Abspielen (Play)";
    }
    if (discWrap) {
      if (playing) discWrap.classList.add("spinning");
      else discWrap.classList.remove("spinning");
    }
  }

  if (playCircleBtn) playCircleBtn.addEventListener("click", toggleGermanAudio);
  if (listenBtn) listenBtn.addEventListener("click", toggleGermanAudio);

  // Audio time update
  if (audioEl) {
    audioEl.addEventListener("timeupdate", () => {
      if (!isNaN(audioEl.duration) && audioEl.duration > 0) {
        const percent = (audioEl.currentTime / audioEl.duration) * 100;
        if (progressSlider) progressSlider.value = percent;
        if (currTimeEl) currTimeEl.innerText = formatTime(audioEl.currentTime);
        if (totalTimeEl) totalTimeEl.innerText = formatTime(audioEl.duration);
      }
    });

    audioEl.addEventListener("ended", () => {
      isPlaying = false;
      updatePlayState(false);
      triggerConfetti(window.innerWidth / 2, window.innerHeight * 0.4, 50);
      showToast("🌸 Noch einmal? Herzlichen Glückwunsch zum Geburtstag! 💕");
    });
  }

  if (progressSlider && audioEl) {
    progressSlider.addEventListener("input", () => {
      if (!isNaN(audioEl.duration)) {
        audioEl.currentTime = (progressSlider.value / 100) * audioEl.duration;
      }
    });
  }

  // Cheer / Prost button
  if (cheerBtn) {
    cheerBtn.addEventListener("click", () => {
      if (window.birthdayAudio) window.birthdayAudio.playCelebration();
      const rect = cheerBtn.getBoundingClientRect();
      triggerConfetti(rect.left + rect.width / 2, rect.top, 60);
      celebrateScreenShower();
      showToast("🥂 Prost auf Ammanda! Herzlichen Glückwunsch! 💖🇩🇪");
    });
  }
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// ========================================================
// TOAST NOTIFICATION UTILITY
// ========================================================
function showToast(message) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "cute-toast";
  toast.innerHTML = `<span>🌸</span> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateX(40px)";
    setTimeout(() => toast.remove(), 400);
  }, 4200);
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
