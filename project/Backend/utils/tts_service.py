"""
TTS Service using Microsoft Edge TTS (edge-tts).
No local model downloads required – uses the cloud-based neural voices.
"""
import asyncio
import io

import edge_tts

# A natural-sounding female voice (en-US Neural)
VOICE = "en-US-AriaNeural"

def generate_speech_bytes(text: str) -> bytes:
    """
    Synthesise text → MP3 bytes in memory (no temp files).

    Returns raw MP3 file content ready to stream as audio/mpeg.
    """
    return asyncio.run(_synthesise(text))


async def _synthesise(text: str) -> bytes:
    """Async helper: streams audio from Edge TTS into a BytesIO buffer."""
    buffer = io.BytesIO()
    communicate = edge_tts.Communicate(text, VOICE)
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            buffer.write(chunk["data"])
    buffer.seek(0)
    return buffer.read()
