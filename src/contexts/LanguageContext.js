import React, { createContext, useState } from "react";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("kr"); // 기본 한국어

  const strings = {
    deckTitle: language === "kr" ? "덱" : "Deck",
    cards: language === "kr" ? "카드" : "Cards",
    addCard: language === "kr" ? "카드 추가" : "Add Card",
    deleteDeck: language === "kr" ? "덱 삭제" : "Delete Deck",
    startQuiz: language === "kr" ? "퀴즈 시작" : "Start Quiz",
    retryWrong: language === "kr" ? "틀린 문제 풀기" : "Retry Wrong Cards",
    showAnswer: language === "kr" ? "정답 보기" : "Show Answer",
    hideAnswer: language === "kr" ? "정답 숨기기" : "Hide Answer",
    correct: language === "kr" ? "정답" : "Correct",
    wrong: language === "kr" ? "오답" : "Wrong",
    attempts: language === "kr" ? "풀이 횟수" : "Attempts",
    newDeck: language === "kr" ? "새 덱" : "New Deck",
    enterDeckTitle: language === "kr" ? "덱 이름 입력" : "Enter deck title",
    cancel: language === "kr" ? "취소" : "Cancel",
    confirm: language === "kr" ? "확인" : "Confirm",
    noDecksYet: language === "kr" ? "덱이 없습니다" : "No decks yet",
    quizFinished: language === "kr" ? "퀴즈 종료" : "Quiz Finished",

    // DeckDetailScreen 관련
    deckNotFound: language === "kr" ? "덱을 찾을 수 없습니다" : "Deck not found",
    deleteConfirm: language === "kr" ? "정말 삭제하시겠습니까?" : "Are you sure?",
    noCards: language === "kr" ? "카드 없음" : "No cards",
    noCardsMessage: language === "kr" ? "이 덱에는 카드가 없습니다." : "This deck has no cards.",
    enterMinWrong: language === "kr" ? "최소 틀린 횟수를 입력하세요:" : "Enter minimum wrong attempts:",
    invalidNumber: language === "kr" ? "잘못된 숫자" : "Invalid number",
    enterValidNumber: language === "kr" ? "유효한 숫자를 입력하세요" : "Please enter a valid number",
    noCardsWithThreshold:
      language === "kr"
        ? "틀린 횟수가 조건 이상인 카드가 없습니다"
        : "No cards with wrong attempts ≥",
    start: language === "kr" ? "시작" : "Start",
    enterMinWrongAttempt: language === "kr" ? "최소 틀린 횟수 입력" : "Enter minimum wrong attempt",

    // 🔹 QuizScreen 관련 추가
    question: language === "kr" ? "문제" : "Question",
    answer: language === "kr" ? "정답" : "Answer",
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, strings }}>
      {children}
    </LanguageContext.Provider>
  );
};
