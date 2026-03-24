// ── Tab switching ───────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ── Constants ────────────────────────────────────────────────────────────────
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR   = 3600;
const SECONDS_PER_DAY    = 86400;

// ── Helpers ─────────────────────────────────────────────────────────────────
function toMinutes(h, m) {
  return parseInt(h, 10) * SECONDS_PER_MINUTE + parseInt(m, 10);
}

function padTwoDigits(n) {
  return String(Math.abs(n)).padStart(2, '0');
}

function showResult(id, html) {
  const el = document.getElementById(id);
  el.innerHTML = html;
}

// ── 1. Time Difference ───────────────────────────────────────────────────────
document.getElementById('diff-btn').addEventListener('click', () => {
  const t1 = document.getElementById('diff-start').value;
  const t2 = document.getElementById('diff-end').value;

  if (!t1 || !t2) {
    showResult('diff-result', '<span style="color:#e74c3c">시작 시간과 종료 시간을 모두 입력하세요.</span>');
    return;
  }

  const [h1, m1] = t1.split(':').map(Number);
  const [h2, m2] = t2.split(':').map(Number);

  let diff = toMinutes(h2, m2) - toMinutes(h1, m1);

  // support overnight spans
  if (diff < 0) diff += 24 * SECONDS_PER_MINUTE;

  const hours = Math.floor(diff / SECONDS_PER_MINUTE);
  const mins = diff % SECONDS_PER_MINUTE;
  showResult('diff-result',
    `<strong>${hours}시간 ${padTwoDigits(mins)}분</strong>` +
    `<span style="font-size:0.88rem;color:#666;margin-top:4px;display:block">` +
    `총 ${diff}분 / ${(diff / SECONDS_PER_MINUTE).toFixed(2)}시간</span>`
  );
});

// ── 2. Time Addition / Subtraction ───────────────────────────────────────────
document.getElementById('addsub-btn').addEventListener('click', () => {
  const base = document.getElementById('addsub-base').value;
  const addH = parseInt(document.getElementById('addsub-hours').value || '0', 10);
  const addM = parseInt(document.getElementById('addsub-minutes').value || '0', 10);
  const op = document.querySelector('input[name="operation"]:checked').value;

  if (!base) {
    showResult('addsub-result', '<span style="color:#e74c3c">기준 시간을 입력하세요.</span>');
    return;
  }
  if (isNaN(addH) || isNaN(addM) || addH < 0 || addM < 0) {
    showResult('addsub-result', '<span style="color:#e74c3c">올바른 시간/분을 입력하세요.</span>');
    return;
  }

  const [bH, bM] = base.split(':').map(Number);
  const MINUTES_PER_DAY = 24 * SECONDS_PER_MINUTE;
  let totalMinutes = toMinutes(bH, bM) + (op === 'add' ? 1 : -1) * (addH * SECONDS_PER_MINUTE + addM);

  // normalize to 0~1439 (24h)
  totalMinutes = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

  const rH = Math.floor(totalMinutes / SECONDS_PER_MINUTE);
  const rM = totalMinutes % SECONDS_PER_MINUTE;
  const opLabel = op === 'add' ? '더하기' : '빼기';

  showResult('addsub-result',
    `<strong>${padTwoDigits(rH)}:${padTwoDigits(rM)}</strong>` +
    `<span style="font-size:0.88rem;color:#666;margin-top:4px;display:block">` +
    `${base} ${opLabel} ${addH}h ${addM}m</span>`
  );
});

// ── 3. Time Unit Conversion ──────────────────────────────────────────────────
document.getElementById('conv-btn').addEventListener('click', () => {
  const val = parseFloat(document.getElementById('conv-value').value);
  const from = document.getElementById('conv-from').value;

  if (isNaN(val) || val < 0) {
    showResult('conv-result', '<span style="color:#e74c3c">올바른 숫자를 입력하세요.</span>');
    return;
  }

  // convert everything to seconds first
  const toSeconds = {
    seconds: 1,
    minutes: SECONDS_PER_MINUTE,
    hours:   SECONDS_PER_HOUR,
    days:    SECONDS_PER_DAY,
  };
  const totalSeconds = val * toSeconds[from];

  const days    = Math.floor(totalSeconds / SECONDS_PER_DAY);
  const hours   = Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = Math.floor(totalSeconds % SECONDS_PER_MINUTE);

  const fromLabels = { seconds: '초', minutes: '분', hours: '시간', days: '일' };

  showResult('conv-result',
    `<strong>${val} ${fromLabels[from]}</strong>` +
    `<span style="font-size:0.88rem;color:#666;margin-top:4px;display:block">` +
    `= ${days}일 ${hours}시간 ${minutes}분 ${seconds}초<br>` +
    `= ${totalSeconds.toLocaleString()}초 / ${(totalSeconds / SECONDS_PER_MINUTE).toFixed(2)}분 / ${(totalSeconds / SECONDS_PER_HOUR).toFixed(4)}시간` +
    `</span>`
  );
});
