#!/usr/bin/env python3
"""
SkillsBridge Diagnostics Script
Tests if all dependencies are correctly installed for the interview feature.
"""

import sys
import subprocess
import importlib
import os


def check_ffmpeg():
    """Check if ffmpeg is installed and accessible."""
    print("\n[CHECK] Testing FFmpeg installation...")
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"], capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0:
            print("[OK] FFmpeg is installed")
            # Extract version
            version_line = result.stdout.split("\n")[0]
            print(f"   Version: {version_line}")
            return True
        else:
            print("[ERROR] FFmpeg command failed")
            return False
    except FileNotFoundError:
        print("[ERROR] FFmpeg NOT FOUND in PATH")
        print("   SOLUTION:")
        print(
            "   1. Download: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.7z"
        )
        print("   2. Extract to C:\\ffmpeg")
        print("   3. Add C:\\ffmpeg\\bin to your system PATH")
        print("   4. Restart terminal and run this script again")
        print("   5. Or use: choco install ffmpeg (if using Chocolatey)")
        return False
    except Exception as e:
        print(f"[ERROR] Error checking FFmpeg: {e}")
        return False


def check_whisper():
    """Check if Faster-Whisper model can be loaded."""
    print("\n[CHECK] Testing Faster-Whisper model...")
    try:
        from utils.stt_service import _get_model

        model = _get_model()
        print("[OK] Faster-Whisper model loaded successfully")
        return True
    except Exception as e:
        print(f"[ERROR] Faster-Whisper failed: {e}")
        return False


def check_imports():
    """Check if all required modules can be imported."""
    print("\n[CHECK] Testing module imports...")
    modules = [
        ("faster_whisper", "Faster-Whisper"),
    ]
    all_ok = True

    for module_name, display_name in modules:
        try:
            importlib.import_module(module_name)
            print(f"[OK] {display_name} imported successfully")
        except ImportError as e:
            print(f"[ERROR] {display_name} import failed: {e}")
            all_ok = False

    return all_ok


def test_transcription():
    """Test actual transcription with a small audio file."""
    print("\n[CHECK] Testing transcription (this may take a minute)...")

    # Create a simple test audio (1 second of silence)
    try:
        import io
        import wave

        # Create a minimal WAV file
        buffer = io.BytesIO()
        with wave.open(buffer, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(16000)
            wav_file.setnframes(16000)
            # Write 1 second of silence
            wav_file.writeframes(b"\x00\x00" * 16000)

        audio_bytes = buffer.getvalue()

        # Import after verifying ffmpeg
        from utils.stt_service import transcribe_audio

        print("   Transcribing test audio...")
        result = transcribe_audio(audio_bytes, suffix=".wav")
        print(f"[OK] Transcription successful: '{result}'")
        return True

    except Exception as e:
        print(f"[ERROR] Transcription failed: {e}")
        return False


def main():
    print("=" * 60)
    print("SkillsBridge Interview Feature Diagnostics")
    print("=" * 60)

    checks = [
        check_ffmpeg,
        check_imports,
        check_whisper,
        test_transcription,
    ]

    results = []
    for check in checks:
        try:
            results.append(check())
        except Exception as e:
            print(f"\n[ERROR] Check failed with error: {e}")
            results.append(False)

    print("\n" + "=" * 60)
    print("DIAGNOSTICS RESULTS")
    print("=" * 60)

    if all(results):
        print("[OK] ALL CHECKS PASSED - Interview feature should work!")
        print("\nYou can now start the servers:")
        print("  Terminal 1: cd Backend && python app.py")
        print("  Terminal 2: cd Frontend && npm run dev")
        sys.exit(0)
    else:
        print("[ERROR] SOME CHECKS FAILED - Please fix the issues above")
        print("\nMost common issues:")
        print("  1. FFmpeg not installed (required for transcription)")
        print("  2. Whisper model not downloaded")
        print("  3. Missing Python packages")
        sys.exit(1)


if __name__ == "__main__":
    main()
