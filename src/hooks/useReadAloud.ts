import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TTS_SETTINGS_KEY = "snippedia-tts-settings";
const DEFAULT_RATE = 1.0;
const RATE_STEPS = [0.9, 1.0, 1.2, 1.4] as const;
const PIPER_TTS_ENDPOINT = "/api/tts";
const PIPER_TTS_LANG = "en-US";
const PIPER_TTS_MODEL = "en_US-amy-medium";
const PIPER_TTS_ENGINE = "Piper";
const PIPER_STRICT_MODE = false;

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function supportsTTS() {
  return typeof window !== "undefined" && typeof Audio !== "undefined";
}

function supportsBrowserSpeechTTS() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export const useReadAloud = () => {
  const isSupported = supportsTTS();
  const canUseBrowserSpeech = supportsBrowserSpeechTTS();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const modeRef = useRef<"piper" | "browser" | null>(null);
  const browserStartedRef = useRef(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorId, setErrorId] = useState(0);
  const hasShownPiperWarningRef = useRef(false);
  const piperUnavailableRef = useRef(false);
  const [rate, setRate] = useState<number>(() => {
    const saved = safeParse<{ rate?: number }>(localStorage.getItem(TTS_SETTINGS_KEY), {});
    return typeof saved.rate === "number" ? saved.rate : DEFAULT_RATE;
  });

  useEffect(() => {
    localStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify({ rate }));
  }, [rate]);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (!isSupported) return;
    browserStartedRef.current = false;
    if (modeRef.current === "browser" && canUseBrowserSpeech) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }

    if (modeRef.current === "piper" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
      revokeObjectUrl();
    }

    modeRef.current = null;
    utteranceRef.current = null;
    setIsSpeaking(false);
    setIsPaused(false);
    setErrorMessage(null);
  }, [canUseBrowserSpeech, isSupported, revokeObjectUrl]);

  const speakWithBrowser = useCallback(
    (content: string) => {
      if (!canUseBrowserSpeech) return false;

      const utterance = new SpeechSynthesisUtterance(content);
      browserStartedRef.current = false;
      utterance.rate = rate;
      utterance.onstart = () => {
        browserStartedRef.current = true;
        modeRef.current = "browser";
        setIsSpeaking(true);
        setIsPaused(false);
      };
      utterance.onend = () => {
        browserStartedRef.current = false;
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
        modeRef.current = null;
      };
      utterance.onerror = () => {
        browserStartedRef.current = false;
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
        modeRef.current = null;
        setErrorMessage("Text-to-speech is unavailable on this device.");
        setErrorId((prev) => prev + 1);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);

      // Some mobile browsers fail silently; surface a clear message.
      window.setTimeout(() => {
        if (!utteranceRef.current) return;
        if (modeRef.current !== "browser") return;
        if (browserStartedRef.current) return;
        setErrorMessage("Text-to-speech is unavailable on this device.");
        setErrorId((prev) => prev + 1);
      }, 1500);
      return true;
    },
    [canUseBrowserSpeech, rate]
  );

  const fetchPiperAudio = useCallback(async (content: string, playbackRate: number) => {
    if (piperUnavailableRef.current) {
      throw new Error("Piper endpoint unavailable");
    }

    const payload = {
      text: content,
      engine: PIPER_TTS_ENGINE,
      lang: PIPER_TTS_LANG,
      model: PIPER_TTS_MODEL,
      format: "wav",
      rate: playbackRate,
    };

    // Try POST JSON first (most common for TTS APIs)
    const postResponse = await fetch(PIPER_TTS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (postResponse.ok) return postResponse.blob();
    if (postResponse.status === 404) {
      piperUnavailableRef.current = true;
      throw new Error("Piper endpoint not found");
    }

    // Fallback to GET query format for compatibility
    const params = new URLSearchParams({
      text: content,
      engine: PIPER_TTS_ENGINE,
      lang: PIPER_TTS_LANG,
      model: PIPER_TTS_MODEL,
      format: "wav",
      rate: String(playbackRate),
    });
    const getResponse = await fetch(`${PIPER_TTS_ENDPOINT}?${params.toString()}`);
    if (getResponse.status === 404) {
      piperUnavailableRef.current = true;
      throw new Error("Piper endpoint not found");
    }
    if (!getResponse.ok) {
      throw new Error(`Piper TTS request failed: ${postResponse.status}/${getResponse.status}`);
    }
    return getResponse.blob();
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!isSupported) return;
      const content = String(text ?? "").trim();
      if (!content) return;

      stop();

      try {
        const audioBlob = await fetchPiperAudio(content, rate);
        const audioUrl = URL.createObjectURL(audioBlob);
        objectUrlRef.current = audioUrl;
        const audio = new Audio(audioUrl);
        audio.playbackRate = rate;
        audio.onended = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          audioRef.current = null;
          modeRef.current = null;
          revokeObjectUrl();
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          audioRef.current = null;
          modeRef.current = null;
          revokeObjectUrl();
        };

        modeRef.current = "piper";
        audioRef.current = audio;
        setIsSpeaking(true);
        setIsPaused(false);
        setErrorMessage(null);
        await audio.play();
        return;
      } catch {
        if (!hasShownPiperWarningRef.current) {
          hasShownPiperWarningRef.current = true;
          setErrorMessage("Piper voice is unavailable right now. Switching to device voice.");
          setErrorId((prev) => prev + 1);
        }
        if (PIPER_STRICT_MODE) {
          modeRef.current = null;
          setIsSpeaking(false);
          setIsPaused(false);
          setErrorMessage("Text-to-speech is temporarily unavailable. Please try again.");
          setErrorId((prev) => prev + 1);
          return;
        }
        // Keep UX resilient: fallback to browser TTS if server-side Piper is unavailable.
      }

      const started = speakWithBrowser(content);
      if (!started) {
        setIsSpeaking(false);
        setIsPaused(false);
        setErrorMessage("Text-to-speech is unavailable on this device.");
        setErrorId((prev) => prev + 1);
      }
    },
    [fetchPiperAudio, isSupported, rate, speakWithBrowser, stop, revokeObjectUrl]
  );

  const pause = useCallback(() => {
    if (!isSupported || !isSpeaking || isPaused) return;
    if (modeRef.current === "piper" && audioRef.current) {
      audioRef.current.pause();
    } else if (modeRef.current === "browser" && canUseBrowserSpeech) {
      window.speechSynthesis.pause();
    }
    setIsPaused(true);
  }, [canUseBrowserSpeech, isSupported, isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return;
    if (modeRef.current === "piper" && audioRef.current) {
      void audioRef.current.play();
    } else if (modeRef.current === "browser" && canUseBrowserSpeech) {
      window.speechSynthesis.resume();
    }
    setIsPaused(false);
  }, [canUseBrowserSpeech, isSupported, isPaused]);

  const cycleRate = useCallback(() => {
    setRate((prev) => {
      const idx = RATE_STEPS.findIndex((v) => v === prev);
      return RATE_STEPS[(idx + 1) % RATE_STEPS.length];
    });
  }, []);

  useEffect(() => {
    return () => {
      if (!isSupported) return;
      if (canUseBrowserSpeech) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      revokeObjectUrl();
    };
  }, [canUseBrowserSpeech, isSupported, revokeObjectUrl]);

  return useMemo(
    () => ({
      isSupported,
      isSpeaking,
      isPaused,
      errorMessage,
      errorId,
      rate,
      speak,
      pause,
      resume,
      stop,
      cycleRate,
    }),
    [isSupported, isSpeaking, isPaused, errorMessage, errorId, rate, speak, pause, resume, stop, cycleRate]
  );
};
