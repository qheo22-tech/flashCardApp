// src/screens/QuizScreen.js
import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useWindowDimensions,
  TextInput,
  ScrollView,
} from "react-native";
import RenderHTML from "react-native-render-html";
import { LanguageContext } from "../contexts/LanguageContext";
import { ThemeContext } from "../contexts/ThemeContext";

// 숨김 변환
const normalizeHidden = (html) => {
  if (!html) return "";
  return html.replace(
    /<span style="[^"]*(color:\s*transparent|background-color:\s*black)[^"]*">(.*?)<\/span>/gi,
    (m, _s, inner) =>
      inner
        .split("")
        .map((ch) => `<span class="hidden-text">${ch}</span>`)
        .join("")
  );
};

// 숨김 클래스 스타일
const baseClassesStyles = {
  "hidden-text": {
    color: "transparent",
    backgroundColor: "#000",
    borderRadius: 2,
    paddingHorizontal: 2,
  },
};

// ✅ 기본 태그 스타일 (줄 간격/여백 최적화)
const tagsStyles = {
  p: {
    margin: 0,
    padding: 0,
    lineHeight: 22, // 줄 간격 고정
  },
  div: {
    margin: 0,
    padding: 0,
    lineHeight: 22,
  },
  span: {
    lineHeight: 22,
  },
};

export default function QuizScreen({ route, navigation, decks, setDecks }) {
  const { strings } = useContext(LanguageContext);
  const colors = useContext(ThemeContext);
  const { deckId, cards: passedCards, mode } = route.params || {};
  const deck = decks.find((d) => d.id === deckId);

  if (!deck || !passedCards || passedCards.length === 0) {
    Alert.alert(strings?.noCards || "알림", strings?.noCardsMsg || "카드가 없습니다.");
    navigation.goBack();
    return null;
  }

  const [cards] = useState(passedCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const card = cards[currentIndex];

  const [showAnswer, setShowAnswer] = useState(false);
  const [revealed, setRevealed] = useState({});
  const [userInput, setUserInput] = useState("");

  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);

  useEffect(() => {
    setSessionCorrect(0);
    setSessionWrong(0);
    setCurrentIndex(0);
    setShowAnswer(false);
    setUserInput("");
    setRevealed({});
  }, [deckId, mode, passedCards]);

  const { width } = useWindowDimensions();

  const toggleReveal = () => {
    setRevealed((prev) => ({ ...prev, [card.id]: !prev[card.id] }));
  };

  const classesStyles = revealed[card.id]
    ? { "hidden-text": { color: colors.text, backgroundColor: "transparent" } }
    : baseClassesStyles;

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

    if (isCorrect) setSessionCorrect((n) => n + 1);
    else setSessionWrong((n) => n + 1);

    const isLast = currentIndex + 1 >= cards.length;
    if (isLast) {
      const totalAttempts = sessionCorrect + sessionWrong + 1;
      const totalCorrect = sessionCorrect + (isCorrect ? 1 : 0);
      const totalWrong = totalAttempts - totalCorrect;

      Alert.alert(
        strings?.quizFinished || "퀴즈 종료",
        `이번 라운드 결과\n푼 문제 수: ${totalAttempts}\n맞춘 문제 수: ${totalCorrect}\n틀린 문제 수: ${totalWrong}`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } else {
      setCurrentIndex((i) => i + 1);
      setShowAnswer(false);
      setUserInput("");
    }
  };

  const checkUserAnswer = () => {
    const correctAnswer = (card.back || "").replace(/<[^>]+>/g, "").trim();
    const userAnswer = userInput.trim();
    handleAnswer(userAnswer === correctAnswer);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ flexGrow: 1, padding: 20 }}
      keyboardShouldPersistTaps="handled"
    >
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

      {/* 정답/오답 버튼 */}
      <View style={styles.buttonRow}>
        {mode === "solve" ? (
          <TouchableOpacity
            style={[styles.answerButton, { backgroundColor: colors.accent }]}
            onPress={checkUserAnswer}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>제출</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.answerButton, { backgroundColor: "green" }]}
              onPress={() => handleAnswer(true)}
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>
                {strings?.correct || "정답"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.answerButton, { backgroundColor: "red" }]}
              onPress={() => handleAnswer(false)}
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>
                {strings?.wrong || "오답"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* 문제 */}
      <View style={[styles.questionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          {strings?.question || "문제"}
        </Text>
        <RenderHTML
          contentWidth={width}
          source={{ html: normalizeHidden(card.front || "") }}
          classesStyles={classesStyles}
          tagsStyles={tagsStyles} // ✅ 줄간격 최적화 반영
        />
      </View>

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

      {mode !== "solve" && (
        <TouchableOpacity onPress={() => setShowAnswer(!showAnswer)}>
          <Text style={[styles.showAnswerButton, { color: colors.accent }]}>
            {showAnswer ? strings?.hideAnswer || "정답 숨기기" : strings?.showAnswer || "정답 보기"}
          </Text>
        </TouchableOpacity>
      )}

      {mode !== "solve" && showAnswer && (
        <View style={[styles.answerBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            {strings?.answer || "정답"}
          </Text>
          <RenderHTML
            contentWidth={width}
            source={{ html: normalizeHidden(card.back || "") }}
            classesStyles={classesStyles}
            tagsStyles={tagsStyles} // ✅ 줄간격 최적화 반영
          />
        </View>
      )}

      <Text style={[styles.stats, { color: colors.placeholder }]}>
        이번 세션 — 맞춤: {sessionCorrect} | 틀림: {sessionWrong}
      </Text>
      <Text style={[styles.stats, { color: colors.placeholder }]}>
        현재 카드 누적 — {strings?.attempts || "시도"}: {card.attempts || 0} |{" "}
        {strings?.correct || "정답"}: {card.correct || 0} | {strings?.wrong || "오답"}: {card.wrong || 0}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
