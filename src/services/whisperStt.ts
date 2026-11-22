import { pipeline } from '@huggingface/transformers';

let transcriberPromise: Promise<any> | null = null;

export async function getWhisperTranscriber(
  onProgress?: (percent: number, statusText: string) => void
) {
  if (!transcriberPromise) {
    transcriberPromise = pipeline(
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
    ).catch((err) => {
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
