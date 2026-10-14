import { useState, useCallback } from "react";
import type { SymptomEntry } from "../types/patient";
import type { InterviewQuestion } from "../types/ai";
import { fetchNextQuestion } from "../services/api/apiClient";

export function useConversation(language = "English", patientInfo: any = {}) {
  const [answers, setAnswers] = useState<SymptomEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [thinking, setThinking] = useState(false);

  const getNext = useCallback(async () => {
    if (answers.length >= 7) {
      setCurrentQuestion(null);
      return;
    }
    setThinking(true);
    try {
      const q = await fetchNextQuestion(answers, patientInfo, language);
      setCurrentQuestion(q);
    } finally {
      setThinking(false);
    }
  }, [answers, patientInfo, language]);

  const addAnswer = useCallback((answerText: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => [
      ...prev,
      {
        question: currentQuestion.text,
        answer: answerText,
        at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setCurrentQuestion(null);
  }, [currentQuestion]);

  const reset = useCallback(() => {
    setAnswers([]);
    setCurrentQuestion(null);
    setThinking(false);
  }, []);

  return {
    answers,
    currentQuestion,
    thinking,
    getNext,
    addAnswer,
    reset,
  };
}
