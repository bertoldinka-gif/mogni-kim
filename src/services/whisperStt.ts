let transcriberPromise: Promise<any> | null = null;

async function loadTransformersPipeline() {
  const mirrors = [
    'https://esm.sh/@huggingface/transformers@3.4.0',
    'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.4.0',
    'https://unpkg.com/@huggingface/transformers@3.4.0',
  ];

  let lastError: unknown = null;

  for (const url of mirrors) {
    try {
      const mod = await import(/* @vite-ignore */ url);
      if (mod?.pipeline) {
        return mod.pipeline;
      }
      // Модуль загрузился, но pipeline не найден — пробуем следующее зеркало
      lastError = new Error(`Модуль по адресу ${url} не содержит pipeline.`);
    } catch (err) {
      lastError = err;
      // Пробуем следующее зеркало
    }
  }

  const detail =
    lastError instanceof Error ? ` Последняя ошибка: ${lastError.message}` : '';
  throw new Error(
    `Не удалось загрузить библиотеку @huggingface/transformers ни с одного зеркала (esm.sh, jsdelivr, unpkg). Проверьте подключение к интернету или доступность CDN.${detail}`
  );
}

export async function getWhisperTranscriber(
  onProgress?: (percent: number, statusText: string) => void
) {
  if (!transcriberPromise) {
    transcriberPromise = (async () => {
      const pipeline = await loadTransformersPipeline();
      return pipeline(
        'automatic-speech-recognition',
        'onnx-community/whisper-tiny',
        {
          dtype: 'q8',
          device: 'wasm',
          progress_callback: (info: any) => {
            if (info?.status === 'progress' && typeof info?.progress === 'number') {
              onProgress?.(
                Math.round(info.progress),
                `Загрузка речевой модели в браузер: ${Math.round(info.progress)}%`
              );
            } else if (info?.status === 'ready') {
              onProgress?.(100, 'Речевая модель готова');
            }
          },
        }
      );
    })().catch((err) => {
      transcriberPromise = null;
      throw err;
    });
  }
  return transcriberPromise;
}

export async function decodeAudioBlobTo16kHz(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtx({ sampleRate: 16000 });
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    if (audioBuffer.sampleRate === 16000) {
      return audioBuffer.getChannelData(0);
    }
    const offlineCtx = new OfflineAudioContext(
      1,
      Math.ceil(audioBuffer.duration * 16000),
      16000
    );
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);
    const rendered = await offlineCtx.startRendering();
    return rendered.getChannelData(0);
  } finally {
    await audioCtx.close().catch(() => {});
  }
}

export async function transcribeRussianAudio(
  audioBlob: Blob,
  onProgress?: (percent: number, statusText: string) => void
): Promise<string> {
  const [transcriber, audioData] = await Promise.all([
    getWhisperTranscriber(onProgress),
    decodeAudioBlobTo16kHz(audioBlob),
  ]);

  const result = await transcriber(audioData, {
    language: 'russian',
    task: 'transcribe',
    chunk_length_s: 30,
    stride_length_s: 5,
  });

  const text = Array.isArray(result)
    ? result.map((r: any) => r?.text ?? '').join(' ')
    : result?.text ?? '';

  return text.trim();
}
