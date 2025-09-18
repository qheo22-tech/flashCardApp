// src/screens/QuizScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useWindowDimensions,
  TextInput,
} from "react-native";
import RenderHTML from "react-native-render-html";
import { LanguageContext } from "../contexts/LanguageContext";
import { ThemeContext } from "../contexts/ThemeContext";

// 숨김 변환 함수
const normalizeHidden = (html) => {
  if (!html) return "";
  return html.replace(
    /<span style="[^"]*(color:\s*transparent|background-color:\s*black)[^"]*">(.*?)<\/span>/gi,
    (match, _style, innerText) => {
      return innerText
        .split("")
        .map((ch) => `<span class="hidden-text">${ch}</span>`)
        .join("");
    }
  );
};

// 숨김 스타일
const baseClassesStyles = {
  "hidden-text": {
    color: "transparent",
    backgroundColor: "#000",
    borderRadius: 2,
    paddingHorizontal: 2,
  },
};

export default function QuizScreen({ route, navigation, decks, setDecks }) {
  const { strings } = useContext(LanguageContext);
  const colors = useContext(ThemeContext);
  const { deckId, cards: passedCards, mode } = route.params || {};
  const deck = decks.find((d) => d.id === deckId);

  if (!deck || !passedCards || passedCards.length === 0) {
    Alert.alert(strings.noCards, strings.noCardsMsg || "This deck has no cards.");
    navigation.goBack();
    return null;
  }

  const [cards] = useState(passedCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [revealed, setRevealed] = useState({});
  const [userInput, setUserInput] = useState(""); // ✅ 사용자 입력 값
  const { width } = useWindowDimensions();

  const card = cards[currentIndex];

  // 카드별 숨김 해제 토글
  const toggleReveal = () => {
    setRevealed((prev) => ({ ...prev, [card.id]: !prev[card.id] }));
  };

  const classesStyles = revealed[card.id]
    ? { "hidden-text": { color: colors.text, backgroundColor: "transparent" } }
    : baseClassesStyles;

  // 통계 반영
  const handleAnswer = (isCorrect) => {
    const updatedDecks = decks.map((d) => {
      if (d.id !== deckId) return d;
      const updatedCards = d.cards.map((c) => {
        if (c.id !== card.id) return c;
        return {
          ...c,
          attempts: (c.attempts || 0) + 1,
          correct: isCorrect ? (c.correct || 0) + 1 : (c.correct || 0),
          wrong: !isCorrect ? (c.wrong || 0) + 1 : (c.wrong || 0),
        };
      });
      return { ...d, cards: updatedCards };
    });
    setDecks(updatedDecks);

    // 마지막 문제일 때 결과 출력
    if (currentIndex + 1 >= cards.length) {
      // 전체 통계 계산
      const totalAttempts = cards.length;
      const totalCorrect = cards.filter((c) => (c.correct || 0) > 0).length;
      const totalWrong = totalAttempts - totalCorrect;

      Alert.alert(
        strings.quizFinished || "퀴즈 종료",
        `푼 문제 수: ${totalAttempts}\n맞춘 문제 수: ${totalCorrect}\n틀린 문제 수: ${totalWrong}`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } else {
      setCurrentIndex((i) => i + 1);
      setShowAnswer(false);
      setUserInput(""); // ✅ 다음 문제 시 입력칸 초기화
    }
  };

  // solve 모드일 때 입력값 검사
  const checkUserAnswer = () => {
    // HTML 태그 제거 후 텍스트 비교
    const correctAnswer = (card.back || "").replace(/<[^>]+>/g, "").trim();
    const userAnswer = userInput.trim();
    const isCorrect = userAnswer === correctAnswer;
    handleAnswer(isCorrect);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 진행도 + 숨김 해제 */}
      <View style={styles.topRow}>
        <Text style={[styles.progress, { color: colors.text }]}>
          {currentIndex + 1} / {cards.length}
        </Text>
        <TouchableOpacity onPress={toggleReveal} style={styles.revealButton}>
          <Text style={[styles.revealText, { color: colors.accent }]}>
            {revealed[card.id] ? "🙈 다시 숨기기" : "👀 숨김 해제"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 문제 */}
      <View style={[styles.questionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          {strings.question || "문제"}
        </Text>
        <RenderHTML
          contentWidth={width}
          source={{ html: normalizeHidden(card.front || "") }}
          classesStyles={classesStyles}
        />
      </View>

      {/* ✅ solve 모드일 때 입력칸 */}
      {mode === "solve" && (
        <TextInput
          style={[
            styles.inputBox,
            { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
          ]}
          placeholder="정답을 입력하세요"
          placeholderTextColor={colors.placeholder}
          value={userInput}
          onChangeText={setUserInput}
        />
      )}

      {/* 정답 표시 (보기 모드에서만 버튼으로 토글) */}
      {mode !== "solve" && showAnswer && (
        <View style={[styles.answerBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            {strings.answer || "정답"}
          </Text>
          <RenderHTML
            contentWidth={width}
            source={{ html: normalizeHidden(card.back || "") }}
            classesStyles={classesStyles}
          />
        </View>
      )}

      {mode !== "solve" && (
        <TouchableOpacity onPress={() => setShowAnswer(!showAnswer)}>
          <Text style={[styles.showAnswerButton, { color: colors.accent }]}>
            {showAnswer
              ? strings.hideAnswer || "정답 숨기기"
              : strings.showAnswer || "정답 보기"}
          </Text>
        </TouchableOpacity>
      )}

      {/* 정답/오답 버튼 */}
      <View style={styles.buttonRow}>
        {mode === "solve" ? (
          <TouchableOpacity
            style={[styles.answerButton, { backgroundColor: colors.accent }]}
            onPress={checkUserAnswer}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>
              제출
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.answerButton, { backgroundColor: "green" }]}
              onPress={() => handleAnswer(true)}
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>
                {strings.correct || "정답"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.answerButton, { backgroundColor: "red" }]}
              onPress={() => handleAnswer(false)}
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>
                {strings.wrong || "오답"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* 통계 */}
      <Text style={[styles.stats, { color: colors.placeholder }]}>
        {strings.attempts}: {card.attempts || 0} | {strings.correct}: {card.correct || 0} |{" "}
        {strings.wrong}: {card.wrong || 0}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progress: { fontSize: 16, fontWeight: "bold" },
  revealButton: { padding: 5 },
  revealText: { fontSize: 14 },

  sectionLabel: { fontSize: 14, fontWeight: "bold", marginBottom: 8 },
  questionBox: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
  },
  answerBox: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
  },
  inputBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  showAnswerButton: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  answerButton: { padding: 15, borderRadius: 8, width: 120, alignItems: "center" },
  buttonText: { fontWeight: "bold", fontSize: 16 },
  stats: { fontSize: 14, textAlign: "center" },
});
