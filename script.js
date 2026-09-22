/* =========================================================
   HIẾU XOĂN TRADER - SCRIPT HOÀN CHỈNH
   Đã gộp:
   - Chống lỗi #numberGrid null
   - Tự cuộn màn hình về ảnh QR sau khi quay xong
   - Highlight QR sau khi cuộn
   ========================================================= */

const AMOUNTS = (() => {
  const TOTAL = 10000;
  const MIN = 200000;
  const MAX = 5000000;
  const STEP = 100; // Bước 100đ để đủ số lượng không trùng

  const totalPossible = Math.floor((MAX - MIN) / STEP) + 1;
  const pool = Array.from({ length: totalPossible }, (_, i) => MIN + i * STEP);

  // Xáo trộn mảng (Fisher-Yates)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Lấy 10.000 số đầu tiên và sắp xếp tăng dần
  const result = pool.slice(0, TOTAL).sort((a, b) => a - b);
  return result;
})();

console.log('Tổng số phần tử:', AMOUNTS.length);
console.log('Số nhỏ nhất:', AMOUNTS[0]);
console.log('Số lớn nhất:', AMOUNTS[AMOUNTS.length - 1]);
console.log('Có trùng lặp không?', new Set(AMOUNTS).size !== AMOUNTS.length);

const ACCOUNT_NO = "19034697615019";
const ACCOUNT_NAME = "NGUYEN VAN HIEU";
const BANK_ID = "970407"; // Techcombank
const NOTE = "DONATE HIEU XOAN TRADER";

const displayAmount = document.getElementById("displayAmount");
const resultAmount = document.getElementById("resultAmount");
const transferAmount = document.getElementById("transferAmount");
const transferNote = document.getElementById("transferNote");
const vietqr = document.getElementById("vietqr");
const qrPlaceholder = document.getElementById("qrPlaceholder");
const qrLink = document.getElementById("qrLink");
const drawBtn = document.getElementById("drawBtn");
const copyBtn = document.getElementById("copyBtn");
const soundBtn = document.getElementById("soundBtn");
const statusEl = document.getElementById("status");
const grid = document.getElementById("numberGrid"); // có thể null nếu HTML không có

let currentAmount = null;
let soundOn = true;
let audioCtx = null;
let spinTimer = null;

/* ---------- Helpers ---------- */
function formatVND(n) {
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

function initGrid() {
  if (!grid) return; // HTML không có #numberGrid → bỏ qua an toàn
  grid.innerHTML = "";
  AMOUNTS.forEach((amount, i) => {
    const el = document.createElement("div");
    el.className = "number-item";
    el.dataset.index = i;
    el.textContent = formatVND(amount);
    grid.appendChild(el);
  });
}

function selectGridItem(index) {
  if (!grid) return;
  document.querySelectorAll(".number-item").forEach(el => el.classList.remove("active"));
  const item = document.querySelector(`.number-item[data-index="${index}"]`);
  if (item) {
    item.classList.add("active");
    item.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

/* ---------- Âm thanh ---------- */
function tone(freq, duration = 0.08, type = "sine", volume = 0.035) {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function fanfare() {
  if (!soundOn) return;
  [523, 659, 784, 1046].forEach((f, i) => {
    setTimeout(() => tone(f, 0.22, "triangle", 0.05), i * 110);
  });
}

/* ---------- QR ---------- */
function setQR(amount) {
  const params = new URLSearchParams({
    amount: String(amount),
    addInfo: NOTE,
    accountName: ACCOUNT_NAME
  });
  const url = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?${params.toString()}`;
  vietqr.src = url;
  vietqr.hidden = false;
  qrPlaceholder.style.display = "none";
  qrLink.href = url;
  qrLink.classList.remove("disabled");
  qrLink.setAttribute("aria-disabled", "false");
}

/* ---------- Cuộn về QR sau khi quay ---------- */
let hasScrolledToQR = false; // đổi thành false nếu muốn cuộn mỗi lần quay

function scrollToQR() {
  if (hasScrolledToQR) return;
  hasScrolledToQR = true;

  const qrImg = document.getElementById("vietqr");
  const resultCard = document.getElementById("resultCard");
  const qrWrap = document.querySelector(".qr-wrap");

  const doScroll = (el) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const headerOffset = 80; // chừa chỗ cho topbar
    const y = window.pageYOffset + rect.top - headerOffset;
    window.scrollTo({ top: y, behavior: "smooth" });

    // Highlight nhẹ quanh khung QR
    if (qrWrap) {
      qrWrap.classList.add("highlight");
      setTimeout(() => qrWrap.classList.remove("highlight"), 1500);
    }
  };

  // Đợi 1 nhịp để ảnh QR kịp render
  requestAnimationFrame(() => {
    if (qrImg && !qrImg.hidden) {
      if (qrImg.complete && qrImg.naturalWidth > 0) {
        doScroll(qrImg);
      } else {
        qrImg.onload = () => doScroll(qrImg);
        qrImg.onerror = () => doScroll(resultCard); // fallback nếu ảnh lỗi
      }
    } else {
      doScroll(resultCard);
    }
  });
}

/* ---------- Quay số ---------- */
function draw() {
  if (drawBtn.disabled) return;
  drawBtn.disabled = true;
  copyBtn.disabled = true;
  resultAmount.textContent = "ĐANG QUAY...";
  statusEl.textContent = "🎰 Đang quay số...";
  let ticks = 0;
  const totalTicks = 38;
  let index = 0;

  spinTimer = setInterval(() => {
    index = Math.floor(Math.random() * AMOUNTS.length);
    displayAmount.textContent = formatVND(AMOUNTS[index]);
    selectGridItem(index);
    tone(220 + (ticks % 5) * 45, 0.045, "square", 0.018);
    ticks++;

    if (ticks >= totalTicks) {
      clearInterval(spinTimer);
      const finalIndex = Math.floor(Math.random() * AMOUNTS.length);
      currentAmount = AMOUNTS[finalIndex];
      displayAmount.textContent = formatVND(currentAmount);
      resultAmount.textContent = formatVND(currentAmount);
      transferAmount.textContent = formatVND(currentAmount);
      transferNote.textContent = NOTE;
      selectGridItem(finalIndex);
      setQR(currentAmount);
      copyBtn.disabled = false;
      statusEl.textContent = "🎉 Đã có kết quả!";
      fanfare();

      // ✅ Cuộn màn hình về vị trí ảnh QR
      scrollToQR();

      drawBtn.disabled = false;
    }
  }, 70);
}

/* ---------- Copy thông tin ---------- */
copyBtn.addEventListener("click", async () => {
  if (!currentAmount) return;
  const text =
`NGÂN HÀNG: Techcombank
CHỦ TÀI KHOẢN: ${ACCOUNT_NAME}
SỐ TÀI KHOẢN: 1903 4697 6150 19
SỐ TIỀN: ${formatVND(currentAmount)}
NỘI DUNG: ${NOTE}`;

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "✅ Đã sao chép";
    setTimeout(() => copyBtn.textContent = "📋 Sao chép thông tin", 1800);
  } catch (e) {
    alert(text);
  }
});

/* ---------- Âm thanh bật/tắt ---------- */
soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊 Âm thanh: BẬT" : "🔇 Âm thanh: TẮT";
  if (soundOn) tone(660, 0.12, "triangle", 0.04);
});

/* ---------- Khởi tạo ---------- */
drawBtn.addEventListener("click", draw);
initGrid();
