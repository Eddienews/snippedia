
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useVoiceSearch } from "../hooks/useVoiceSearch";
import { Mic, MicOff } from "lucide-react";

interface VoiceSearchButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

const VoiceSearchButton = ({ onTranscript, className }: VoiceSearchButtonProps) => {
  const { toast } = useToast();
  const { 
    isListening, 
    transcript, 
    isSupported,
    startListening,
    stopListening,
    clearTranscript
  } = useVoiceSearch();

  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
      clearTranscript();
    }
  }, [transcript, onTranscript, clearTranscript]);

  const handleClick = () => {
    if (!isSupported) {
      toast({
        title: "Voice search not supported",
        description: "Your browser doesn't support voice search",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={`${className} ${isListening ? 'text-red-400 animate-pulse' : 'text-white/60 hover:text-white'}`}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};

export default VoiceSearchButton;
