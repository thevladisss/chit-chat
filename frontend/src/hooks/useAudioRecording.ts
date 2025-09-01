import { useState, useRef, useCallback } from "react";

interface UseAudioRecordingReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  audioBlob: Blob | null;
  error: string | null;
  resetRecording: () => void;
  playAudioRecording: (recording: Blob) => void
}

export const useAudioRecording = ({
  onStartRecording,
  onStopRecording,
  onRecordingError,
}: {
  onStartRecording?: () => void;
  onStopRecording?: (recording: Blob) => void;
  onRecordingError?: () => void;
} = {}): UseAudioRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setAudioBlob(null);

      if (onStartRecording) onStartRecording();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/mp4",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setIsRecording(false);

        if (onStopRecording) onStopRecording(blob);

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        setError("Recording error occurred");
        setIsRecording(false);
        if (onRecordingError) onRecordingError();
        console.error("MediaRecorder error:", event);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start recording";
      setError(errorMessage);
      setIsRecording(false);
      console.error("Audio recording error:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setError(null);

    audioChunksRef.current = [];
  }, []);

  const playAudioRecording = (recording: Blob) => {
    const audioUrl = URL.createObjectURL(recording);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      // Clean up the object URL to free memory
      URL.revokeObjectURL(audioUrl);
    };

    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
      URL.revokeObjectURL(audioUrl);
    });
  };

  // Cleanup on unmount

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioBlob,
    error,
    resetRecording,
    playAudioRecording
  };
};
