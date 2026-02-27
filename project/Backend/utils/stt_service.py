"""
STT Service using Faster-Whisper (local, no Google/network dependency).

The model is lazy-loaded on first use.
Model size is controlled by the WHISPER_MODEL env var (default: tiny.en).
  tiny.en  ~75 MB  — fastest, English-only
  base     ~145 MB — slightly better accuracy, multilingual
  small    ~461 MB — good accuracy
"""
import os
import tempfile
import threading

from faster_whisper import WhisperModel

_model: WhisperModel | None = None
_lock = threading.Lock()


def _get_model() -> WhisperModel:
    """Lazy-load and cache the Whisper model (thread-safe)."""
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                model_size = os.getenv("WHISPER_MODEL", "tiny.en")
                # Use CPU with int8 quantisation for low memory usage.
                # Change to "cuda" if a GPU is available.
                _model = WhisperModel(model_size, device="cpu", compute_type="int8")
    return _model


def transcribe_audio(audio_bytes: bytes, suffix: str = ".webm") -> str:
    """
    Transcribe raw audio bytes using Faster-Whisper.

    Parameters
    ----------
    audio_bytes : bytes
        Raw audio data (WebM, OGG, WAV, MP4 — anything ffmpeg can decode).
    suffix : str
        File extension hint used when writing the temp file.

    Returns
    -------
    str
        Transcribed text, stripped of leading/trailing whitespace.
        Returns an empty string if no speech was detected.
    """
    model = _get_model()

    # Faster-Whisper requires a file path, not a buffer.
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        segments, _ = model.transcribe(tmp_path, beam_size=5, language="en")
        text = " ".join(seg.text for seg in segments).strip()
        print("Transcribed text : ", text)
        return text
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass
