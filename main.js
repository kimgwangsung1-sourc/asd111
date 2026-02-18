import { removeBackground } from '@imgly/background-removal';

const dom = {
  dropzone: document.getElementById('dropzone'),
  fileInput: document.getElementById('fileInput'),
  selectBtn: document.getElementById('selectBtn'),
  removeBtn: document.getElementById('removeBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  resetBtn: document.getElementById('resetBtn'),
  status: document.getElementById('status'),
  inputCanvas: document.getElementById('inputCanvas'),
  outputCanvas: document.getElementById('outputCanvas'),
  modelTag: document.getElementById('modelTag'),
  bgMode: document.getElementById('bgMode'),
  solidColor: document.getElementById('solidColor'),
  gradColorA: document.getElementById('gradColorA'),
  gradColorB: document.getElementById('gradColorB'),
  gradAngle: document.getElementById('gradAngle'),
  bgImageInput: document.getElementById('bgImageInput')
};

const state = {
  originalFile: null,
  originalBitmap: null,
  cutoutBitmap: null,
  bgImageBitmap: null,
  busy: false
};

const inputCtx = dom.inputCanvas.getContext('2d');
const outputCtx = dom.outputCanvas.getContext('2d');

dom.selectBtn.addEventListener('click', () => dom.fileInput.click());
dom.fileInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (file) handleFile(file);
});

dom.dropzone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dom.dropzone.classList.add('dragging');
});

dom.dropzone.addEventListener('dragleave', () => {
  dom.dropzone.classList.remove('dragging');
});

dom.dropzone.addEventListener('drop', (event) => {
  event.preventDefault();
  dom.dropzone.classList.remove('dragging');
  const file = event.dataTransfer.files?.[0];
  if (file) handleFile(file);
});

dom.removeBtn.addEventListener('click', () => runRemoval());
dom.resetBtn.addEventListener('click', resetAll);
dom.downloadBtn.addEventListener('click', downloadOutput);

dom.bgMode.addEventListener('change', () => {
  updateBackgroundControls();
  renderOutput();
});
[dom.solidColor, dom.gradColorA, dom.gradColorB, dom.gradAngle].forEach((input) => {
  input.addEventListener('input', renderOutput);
});

dom.bgImageInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  state.bgImageBitmap = await createImageBitmap(file);
  renderOutput();
});

function updateStatus(message, tone = 'default') {
  dom.status.textContent = message;
  dom.status.style.color = tone === 'error' ? '#ffb4a2' : '';
}

function resetAll() {
  state.originalFile = null;
  state.originalBitmap = null;
  state.cutoutBitmap = null;
  state.bgImageBitmap = null;
  dom.fileInput.value = '';
  dom.bgImageInput.value = '';
  dom.removeBtn.disabled = true;
  dom.downloadBtn.disabled = true;
  dom.modelTag.textContent = '모델 준비 중';
  inputCtx.clearRect(0, 0, dom.inputCanvas.width, dom.inputCanvas.height);
  outputCtx.clearRect(0, 0, dom.outputCanvas.width, dom.outputCanvas.height);
  updateStatus('이미지를 선택하면 바로 누끼를 따요.');
}

async function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    updateStatus('이미지 파일만 업로드할 수 있어요.', 'error');
    return;
  }
  state.originalFile = file;
  state.originalBitmap = await createImageBitmap(file);
  renderInput();
  dom.removeBtn.disabled = false;
  updateStatus('준비 완료. “배경 제거 시작”을 눌러주세요.');
}

function renderInput() {
  if (!state.originalBitmap) return;
  const { width, height } = state.originalBitmap;
  dom.inputCanvas.width = width;
  dom.inputCanvas.height = height;
  inputCtx.clearRect(0, 0, width, height);
  inputCtx.drawImage(state.originalBitmap, 0, 0, width, height);
}

async function runRemoval() {
  if (!state.originalFile || state.busy) return;
  state.busy = true;
  dom.removeBtn.disabled = true;
  dom.downloadBtn.disabled = true;
  updateStatus('AI 모델 준비 중...');
  dom.modelTag.textContent = '모델 로딩 중';
  try {
    const resultBlob = await removeBackground(state.originalFile, {
      progress: (_, current, total) => {
        const percent = total ? Math.round((current / total) * 100) : 0;
        updateStatus(`배경 제거 중... ${percent}%`);
      }
    });
    state.cutoutBitmap = await createImageBitmap(resultBlob);
    dom.modelTag.textContent = '모델 준비 완료';
    updateStatus('완료! 배경 스튜디오에서 새 배경을 골라보세요.');
    dom.downloadBtn.disabled = false;
    renderOutput();
  } catch (error) {
    console.error(error);
    updateStatus('처리 중 오류가 발생했어요. 다른 이미지를 시도해 주세요.', 'error');
    dom.modelTag.textContent = '모델 오류';
  } finally {
    state.busy = false;
    dom.removeBtn.disabled = false;
  }
}

function renderOutput() {
  if (!state.cutoutBitmap) return;
  const { width, height } = state.cutoutBitmap;
  dom.outputCanvas.width = width;
  dom.outputCanvas.height = height;
  outputCtx.clearRect(0, 0, width, height);

  const mode = dom.bgMode.value;
  if (mode === 'solid') {
    outputCtx.fillStyle = dom.solidColor.value;
    outputCtx.fillRect(0, 0, width, height);
  } else if (mode === 'gradient') {
    const gradient = createAngleGradient(width, height, Number(dom.gradAngle.value));
    gradient.addColorStop(0, dom.gradColorA.value);
    gradient.addColorStop(1, dom.gradColorB.value);
    outputCtx.fillStyle = gradient;
    outputCtx.fillRect(0, 0, width, height);
  } else if (mode === 'image' && state.bgImageBitmap) {
    drawCover(outputCtx, state.bgImageBitmap, width, height);
  }

  outputCtx.drawImage(state.cutoutBitmap, 0, 0, width, height);
}

function createAngleGradient(width, height, angle) {
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians);
  const y = Math.sin(radians);
  const half = Math.max(width, height);
  const x0 = width / 2 - x * half;
  const y0 = height / 2 - y * half;
  const x1 = width / 2 + x * half;
  const y1 = height / 2 + y * half;
  return outputCtx.createLinearGradient(x0, y0, x1, y1);
}

function drawCover(ctx, bitmap, width, height) {
  const ratio = Math.max(width / bitmap.width, height / bitmap.height);
  const drawWidth = bitmap.width * ratio;
  const drawHeight = bitmap.height * ratio;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;
  ctx.drawImage(bitmap, offsetX, offsetY, drawWidth, drawHeight);
}

function updateBackgroundControls() {
  document.querySelectorAll('[data-mode]').forEach((row) => {
    row.style.display = row.dataset.mode === dom.bgMode.value ? 'flex' : 'none';
  });
}

function downloadOutput() {
  if (!state.cutoutBitmap) return;
  const link = document.createElement('a');
  link.download = 'pixelcut.png';
  link.href = dom.outputCanvas.toDataURL('image/png');
  link.click();
}

updateBackgroundControls();
resetAll();
