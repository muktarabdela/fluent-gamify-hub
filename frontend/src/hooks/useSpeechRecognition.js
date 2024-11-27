import { useState, useRef } from 'react';

export const useSpeechRecognition = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);

    const startRecording = async (language = 'en-US') => {
        setIsProcessing(false);
        setError(null);

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                throw new Error('Speech recognition not supported in this browser');
            }

            return new Promise((resolve, reject) => {
                const recognition = new SpeechRecognition();
                recognitionRef.current = recognition;

                recognition.lang = language;
                recognition.continuous = false;
                recognition.interimResults = false;

                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    console.log('Raw transcript:', transcript); // Debug log
                    setIsProcessing(false);
                    resolve(transcript);
                };

                recognition.onerror = (event) => {
                    console.error('Speech recognition error:', event.error);
                    setError(event.error);
                    setIsProcessing(false);
                    reject(event.error);
                };

                recognition.onend = () => {
                    setIsProcessing(false);
                };

                setIsProcessing(true);
                recognition.start();
            });
        } catch (error) {
            console.error('Recognition error:', error);
            setError(error.message);
            setIsProcessing(false);
            throw error;
        }
    };

    const stopRecording = async () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    return {
        startRecording,
        stopRecording,
        isProcessing,
        error,
    };
}; 