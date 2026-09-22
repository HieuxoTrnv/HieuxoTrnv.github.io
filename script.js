const// =========================================================
// TẠO MẢNG AMOUNTS GỒM 10000 SỐ TỪ 200.000 ĐẾN 5.000.000
// Định dạng giống mẫu: số nguyên, làm tròn đến hàng nghìn
// =========================================================

const AMOUNTS = (() => {
    const TOTAL = 10000;
    const MIN = 200000;
    const MAX = 5000000;
    const STEP = 1000; // Bước nhảy 1000đ để số đẹp

    const result = [];
    const used = new Set();

    // Tính số lượng giá trị có thể có (từ 200k đến 5tr, bước 1k)
    // (5.000.000 - 200.000) / 1000 + 1 = 4801 giá trị
    const totalPossible = Math.floor((MAX - MIN) / STEP) + 1;

    // Nếu số lượng cần tạo > số lượng giá trị có thể có -> phải lặp lại
    // Ở đây 10000 > 4801, nên chắc chắn sẽ có sự lặp lại.
    // Ta sẽ tạo ngẫu nhiên có trùng lặp, sau đó sắp xếp tăng dần.

    for (let i = 0; i < TOTAL; i++) {
        const randomIndex = Math.floor(Math.random() * totalPossible);
        const value = MIN + randomIndex * STEP;
        result.push(value);
    }

    // Sắp xếp tăng dần giống mẫu
    result.sort((a, b) => a - b);

    return result;
})();

// =========================================================
// KIỂM TRA KẾT QUẢ
// =========================================================
console.log('Tổng số phần tử:', AMOUNTS.length);
console.log('Số nhỏ nhất:', AMOUNTS[0]);
console.log('Số lớn nhất:', AMOUNTS[AMOUNTS.length - 1]);
console.log('10 số đầu tiên:', AMOUNTS.slice(0, 10));
console.log('10 số cuối cùng:', AMOUNTS.slice(-10));

// Kiểm tra tất cả số đều nằm trong khoảng 200k - 5tr
const isValid = AMOUNTS.every(v => v >= 200000 && v <= 5000000);
console.log('Tất cả số hợp lệ (200k-5tr):', isValid);

// Kiểm tra tất cả số đều là bội số của 1000
const isRounded = AMOUNTS.every(v => v % 1000 === 0);
console.log('Tất cả số làm tròn nghìn:', isRounded);
];

const ACCOUNT_NO = "19034697615019";
const ACCOUNT_NAME = "NGUYEN VAN HIEU";
const BANK_ID = "970407"; // Techcombank
const NOTE = "HIEU XOAN TRADER";

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
const grid = document.getElementById("numberGrid");

let currentAmount = null;
let soundOn = true;
let audioCtx = null;
let spinTimer = null;

function formatVND(n) {
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

function initGrid() {
  grid.innerHTML = "";
  AMOUNTS.forEach((amount, i) => {
    const el = document.createElement("div");
    el.className = "number-item";
    el.dataset.index = i;
    el.textContent = formatVND(amount);
    grid.appendChild(el);
  });
}

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
  } catch(e) {}
}

function fanfare() {
  if (!soundOn) return;
  [523,659,784,1046].forEach((f, i) => {
    setTimeout(() => tone(f, 0.22, "triangle", 0.05), i * 110);
  });
}

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

function selectGridItem(index) {
  document.querySelectorAll(".number-item").forEach(el => el.classList.remove("active"));
  const item = document.querySelector(`.number-item[data-index="${index}"]`);
  if (item) {
    item.classList.add("active");
    item.scrollIntoView({behavior:"smooth", block:"nearest"});
  }
}

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
      drawBtn.disabled = false;
    }
  }, 70);
}

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
  } catch(e) {
    alert(text);
  }
});

soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊 Âm thanh: BẬT" : "🔇 Âm thanh: TẮT";
  if (soundOn) tone(660, 0.12, "triangle", 0.04);
});

drawBtn.addEventListener("click", draw);
initGrid();
