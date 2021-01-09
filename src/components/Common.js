export const SOUND_PLAYER_SOUNDFONTS_URL = 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus';

export const MEL_TWINKLE = {
  notes: [
    {
      pitch: 60,
      quantizedStartStep: 0,
      quantizedEndStep: 2,
      program: 0,
      instrument: 0
    },
    {
      pitch: 60,
      quantizedStartStep: 2,
      quantizedEndStep: 4,
      program: 0,
      instrument: 0
    },
    {
      pitch: 67,
      quantizedStartStep: 4,
      quantizedEndStep: 6,
      program: 0,
      instrument: 0
    },
    {
      pitch: 67,
      quantizedStartStep: 6,
      quantizedEndStep: 8,
      program: 0,
      instrument: 0
    },
    {
      pitch: 69,
      quantizedStartStep: 8,
      quantizedEndStep: 10,
      program: 0,
      instrument: 0
    },
    {
      pitch: 69,
      quantizedStartStep: 10,
      quantizedEndStep: 12,
      program: 0,
      instrument: 0
    },
    {
      pitch: 67,
      quantizedStartStep: 12,
      quantizedEndStep: 16,
      program: 0,
      instrument: 0
    },
    {
      pitch: 65,
      quantizedStartStep: 16,
      quantizedEndStep: 18,
      program: 0,
      instrument: 0
    },
    {
      pitch: 65,
      quantizedStartStep: 18,
      quantizedEndStep: 20,
      program: 0,
      instrument: 0
    },
    {
      pitch: 64,
      quantizedStartStep: 20,
      quantizedEndStep: 22,
      program: 0,
      instrument: 0
    },
    {
      pitch: 64,
      quantizedStartStep: 22,
      quantizedEndStep: 24,
      program: 0,
      instrument: 0
    },
    {
      pitch: 62,
      quantizedStartStep: 24,
      quantizedEndStep: 26,
      program: 0,
      instrument: 0
    },
    {
      pitch: 62,
      quantizedStartStep: 26,
      quantizedEndStep: 28,
      program: 0,
      instrument: 0
    },
    {
      pitch: 60,
      quantizedStartStep: 28,
      quantizedEndStep: 32,
      program: 0,
      instrument: 0
    }
  ],
  quantizationInfo: { stepsPerQuarter: 4 },
  totalQuantizedSteps: 32,
};

export const MEL_TEAPOT = {
  notes: [
    { pitch: 69, quantizedStartStep: 0, quantizedEndStep: 2, program: 0 },
    { pitch: 71, quantizedStartStep: 2, quantizedEndStep: 4, program: 0 },
    { pitch: 73, quantizedStartStep: 4, quantizedEndStep: 6, program: 0 },
    { pitch: 74, quantizedStartStep: 6, quantizedEndStep: 8, program: 0 },
    { pitch: 76, quantizedStartStep: 8, quantizedEndStep: 10, program: 0 },
    { pitch: 81, quantizedStartStep: 12, quantizedEndStep: 16, program: 0 },
    { pitch: 78, quantizedStartStep: 16, quantizedEndStep: 20, program: 0 },
    { pitch: 81, quantizedStartStep: 20, quantizedEndStep: 24, program: 0 },
    { pitch: 76, quantizedStartStep: 24, quantizedEndStep: 32, program: 0 }
  ],
  quantizationInfo: { stepsPerQuarter: 4 },
  totalQuantizedSteps: 32,
};

export function writeMemory(bytes, name = 'leaked-memory') {
  console.log('name:' + bytes.toString() + ' bytes');
}

export function saveBlob(blob, fileName) {
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";

  var url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};