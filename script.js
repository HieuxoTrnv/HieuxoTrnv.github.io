const AMOUNTS = [
      360000,
      380000,
      540000,
      920000,
      1120000,
      1290000,
      1430000,
      1480000,
      1650000,
      1800000,
      1890000,
      1910000,
      1930000,
      2040000,
      2180000,
      2230000,
      2280000,
      2300000,
      2310000,
      2390000,
      2460000,
      2490000,
      2710000,
      2730000,
      2760000,
      2790000,
      2810000,
      2930000,
      3030000,
      3060000,
      3130000,
      3220000,
      3370000,
      3490000,
      3640000,
      3650000,
      3740000,
      3830000,
      3900000,
      3930000,
      4000000,
      4010000,
      4070000,
      4250000,
      4350000,
      4430000,
      4510000,
      4590000,
      4600000,
      4630000,
      4640000,
      4850000,
      4920000,
      5020000,
      5260000,
      5280000,
      5310000,
      5330000,
      5350000,
      5490000,
      5500000,
      5650000,
      5690000,
      5780000,
      5820000,
      6120000,
      6170000,
      6190000,
      6400000,
      6430000,
      6560000,
      6600000,
      6690000,
      7060000,
      7150000,
      7280000,
      7500000,
      7560000,
      7570000,
      7800000,
      7900000,
      7940000,
      8000000,
      8030000,
      8090000,
      8290000,
      8340000,
      8370000,
      8390000,
      8470000,
      8500000,
      8510000,
      8900000,
      9110000,
      9480000,
      9590000,
      9700000,
      9750000,
      9840000,
      9900000
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
