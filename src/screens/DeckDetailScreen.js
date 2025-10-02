// src/screens/DeckDetailScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Alert,
  Modal,
} from "react-native";
import { LanguageContext } from "../contexts/LanguageContext";
import { ThemeContext } from "../contexts/ThemeContext";
import RenderHTML from "react-native-render-html";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import KeywordQuizModal from "../components/modals/KeywordQuizModal"; // ✅ 키워드 모달
import modalCommon from "../styles/modalCommon"; // 파일 맨 위에 추가


// 숨김 변환
const normalizeHidden = (html) => {
  if (!html) return "";
  return html.replace(
    /<span style="[^"]*(color:\s*transparent|background-color:\s*black)[^"]*">(.*?)<\/span>/gi,
    (_match, _style, innerText) =>
      innerText
        .split("")
        .map((ch) => `<span class="hidden-text">${ch}</span>`)
        .join("")
  );
};

// 숨김 스타일
const classesStyles = {
  "hidden-text": {
    color: "transparent",
    backgroundColor: "#000",
  },
};

export default function DeckDetailScreen({ route, navigation, decks, setDecks }) {
  const { strings } = useContext(LanguageContext);
  const colors = useContext(ThemeContext);
  const isDarkMode = colors.background === "#000";

  const { deckId } = route.params;
  const deck = decks.find((d) => d.id === deckId);

  // 모드/선택 상태
  const [deleteMode, setDeleteMode] = useState(false);       // ✅ 삭제 모드 토글
  const [selectedCards, setSelectedCards] = useState([]);    // ✅ 선택된 카드 ID 목록

  // 틀린 문제 재도전 모달용
  const [modalVisible, setModalVisible] = useState(false);
  const [wrongThreshold, setWrongThreshold] = useState("1");

  // 키워드 문제풀기 모달
  const [keywordQuizModalVisible, setKeywordQuizModalVisible] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState([]);

  // 모든 키워드 풀 추출
  const allKeywords = [...new Set(deck?.cards.flatMap((c) => c.keywords || []))];

  if (!deck) {
    return (
      <Text style={{ color: colors.text }}>
        {strings.deckNotFound || "Deck not found"}a
      </Text>
    );
  }

  // 카드 추가
  const addCard = () => navigation.navigate("AddCard", { deckId: deck.id });

  // 카드 선택 토글
  const toggleSelectCard = (cardId) => {
    setSelectedCards((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  // 삭제모드 토글
  const toggleDeleteMode = () => {
    setDeleteMode((v) => !v);
    setSelectedCards([]);
  };

  // 선택 카드 삭제 실행
  const handleConfirmDeleteCards = () => {
    const updatedDecks = decks.map((d) =>
      d.id === deck.id
        ? { ...d, cards: d.cards.filter((c) => !selectedCards.includes(c.id)) }
        : d
    );
    setDecks(updatedDecks);
    setDeleteMode(false);
    setSelectedCards([]);
  };

  // 덱 삭제 실행
  const handleConfirmDeleteDeck = () => {
    const updatedDecks = decks.filter((d) => d.id !== deck.id);
    setDecks(updatedDecks);
    navigation.goBack();
  };

  // 공통: 퀴즈 시작 시 삭제모드 해제
  const exitDeleteMode = () => {
    setDeleteMode(false);
    setSelectedCards([]);
  };

  // 퀴즈 시작(보기)
  const startQuizView = () => {
    if (deck.cards.length === 0) {
      Alert.alert("알림", "카드가 없습니다. 카드를 추가한 후 퀴즈를 시작하세요.");
      return;
    }
    exitDeleteMode();
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    navigation.navigate("Quiz", { deckId: deck.id, cards: shuffled, mode: "view" });
  };

  // 퀴즈 시작(정답풀기)
  const startQuizSolve = () => {
    if (deck.cards.length === 0) {
      Alert.alert("알림", "카드가 없습니다. 카드를 추가한 후 퀴즈를 시작하세요.");
      return;
    }
    exitDeleteMode();
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    navigation.navigate("Quiz", { deckId: deck.id, cards: shuffled, mode: "solve" });
  };

  // 틀린 문제 풀기
  const startRetryWrong = () => {
    if (deck.cards.length === 0) {
      Alert.alert("알림", "카드가 없습니다. 카드를 추가한 후 다시 시도하세요.");
      return;
    }
    const threshold = parseInt(wrongThreshold);
    if (isNaN(threshold) || threshold < 1) {
      Alert.alert("알림", "유효한 기준 값을 입력하세요.");
      return;
    }
    const filtered = deck.cards.filter((c) => (c.wrong || 0) >= threshold);
    if (filtered.length === 0) {
      Alert.alert("알림", "조건을 만족하는 틀린 카드가 없습니다.");
      return;
    }
    exitDeleteMode();
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    setModalVisible(false);
    navigation.navigate("Quiz", { deckId: deck.id, cards: shuffled, retryWrong: true });
  };

  // 키워드 문제풀기 시작
  const startKeywordQuiz = () => {
    if (selectedKeywords.length === 0) {
      Alert.alert("알림", "적어도 하나의 키워드를 선택하세요.");
      return;
    }
    const filtered = deck.cards.filter((c) =>
      (c.keywords || []).some((kw) => selectedKeywords.includes(kw))
    );
    if (filtered.length === 0) {
      Alert.alert("알림", "선택한 키워드에 해당하는 카드가 없습니다.");
      return;
    }
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setKeywordQuizModalVisible(false);
    setSelectedKeywords([]);
    navigation.navigate("Quiz", { deckId: deck.id, cards: shuffled, mode: "keyword" });
  };

  // 풀이횟수 초기화
  const resetAttempts = () => {
    Alert.alert("초기화", "풀이횟수를 초기화 하시겠습니까?", [
      { text: "아니오", style: "cancel" },
      {
        text: "예",
        style: "destructive",
        onPress: () => {
          const updatedDecks = decks.map((d) =>
            d.id === deck.id
              ? {
                  ...d,
                  cards: d.cards.map((c) => ({
                    ...c,
                    attempts: 0,
                    correct: 0,
                    wrong: 0,
                  })),
                }
              : d
          );
          setDecks(updatedDecks);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 제목 + 덱 삭제 */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>{deck.title}</Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert("덱 삭제", "이 덱을 삭제할까요? 복구할 수 없습니다.", [
              { text: "취소", style: "cancel" },
              { text: "삭제", style: "destructive", onPress: handleConfirmDeleteDeck },
            ])
          }
        >
          <MaterialIcons name="delete" size={28} color="red" />
        </TouchableOpacity>
      </View>

      <Text style={[styles.cardCount, { color: colors.placeholder }]}>
        {deck.cards.length} {strings.cards}
      </Text>

      {/* 퀴즈 버튼 */}
      <View style={styles.quizContainer}>
        <View style={styles.quizRow}>
          <TouchableOpacity
            style={[
              styles.quizButton,
              { backgroundColor: colors.card, borderColor: colors.border, flex: 1 },
            ]}
            onPress={startQuizView}
          >
            <Text style={[styles.quizText, { color: colors.text }]}>
              {strings.startQuiz}(보기)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quizButton,
              { backgroundColor: colors.card, borderColor: colors.border, flex: 1 },
            ]}
            onPress={startQuizSolve}
          >
            <Text style={[styles.quizText, { color: colors.text }]}>
              {strings.startQuiz}(정답풀기)
            </Text>
          </TouchableOpacity>
        </View>

        {/* 틀린 문제 풀기 */}
        <TouchableOpacity
          style={[styles.quizButtonFull, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            if (deck.cards.length === 0) {
              Alert.alert("알림", "카드가 없습니다.");
              return;
            }
            setModalVisible(true);
          }}
        >
          <Text style={[styles.quizText, { color: colors.text }]}>{strings.retryWrong}</Text>
        </TouchableOpacity>

        {/* 키워드 문제풀기 */}
        <TouchableOpacity
          style={[styles.quizButtonFull, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            if (deck.cards.length === 0) {
              Alert.alert("알림", "카드가 없습니다.");
              return;
            }
            setKeywordQuizModalVisible(true);
          }}
        >
          <Text style={[styles.quizText, { color: colors.text }]}>키워드 문제풀기</Text>
        </TouchableOpacity>
      </View>

      {/* 카드 액션 버튼 */}
      <View style={styles.actionRow}>
        {deleteMode ? (
          <>
            <TouchableOpacity
              onPress={() => {
                if (selectedCards.length === 0) {
                  Alert.alert("알림", "삭제할 카드를 선택하세요.");
                  return;
                }
                Alert.alert(
                  "카드 삭제",
                  `선택한 ${selectedCards.length}개 카드를 삭제할까요?`,
                  [
                    { text: "취소", style: "cancel" },
                    { text: "삭제", style: "destructive", onPress: handleConfirmDeleteCards },
                  ]
                );
              }}
            >
              <MaterialIcons name="delete" size={28} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleDeleteMode}>
              <MaterialIcons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={addCard}>
              <MaterialIcons name="add" size={28} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleDeleteMode}>
              <MaterialIcons name="delete" size={28} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={resetAttempts}>
              <MaterialIcons name="refresh" size={28} color={colors.text} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* 카드 리스트 */}
      <FlatList
        data={deck.cards}
        keyExtractor={(item) => item.id}
        extraData={{ selectedCards, deleteMode }}
        renderItem={({ item }) => {
          const isSelected = selectedCards.includes(item.id);
          return (
            <TouchableOpacity
              style={[
                styles.cardItem,
                { backgroundColor: colors.card, borderColor: colors.border },
                deleteMode && isSelected && styles.cardItemSelected,
              ]}
              onPress={() =>
                deleteMode
                  ? toggleSelectCard(item.id)
                  : navigation.navigate("CardDetail", { deckId: deck.id, cardId: item.id })
              }
            >
              <View style={{ flex: 1 }}>
                <RenderHTML
                  contentWidth={Dimensions.get("window").width - 40}
                  source={{ html: normalizeHidden(item.front || "<p>(내용 없음)</p>") }}
                  classesStyles={classesStyles}
                />
                <Text style={[styles.cardStats, { color: colors.placeholder }]}>
                  {strings.attempts}: {item.attempts || 0} | {strings.correct}: {item.correct || 0} |{" "}
                  {strings.wrong}: {item.wrong || 0}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* ✅ 틀린 문제 풀기 모달 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalCommon.background}>
          <View style={[modalCommon.container, { backgroundColor: colors.card }]}>
            <Text style={[modalCommon.title, { color: colors.text }]}>{strings.retryWrong}</Text>
            <TextInput
              style={[
                modalCommon.input,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={wrongThreshold}
              onChangeText={setWrongThreshold}
              keyboardType="numeric"
              placeholder="기준 횟수"
              placeholderTextColor={colors.placeholder}
            />
            <View style={modalCommon.buttons}>
              <TouchableOpacity
                style={[modalCommon.button, { backgroundColor: colors.card }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: colors.text }}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalCommon.button, { backgroundColor: "red" }]}
                onPress={startRetryWrong}
              >
                <Text style={{ color: "#fff" }}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

  {/* ✅ 키워드 문제풀기 모달 */}
<KeywordQuizModal
  visible={keywordQuizModalVisible}
  onClose={() => setKeywordQuizModalVisible(false)}
  onConfirm={startKeywordQuiz}
  allKeywords={allKeywords}
  selectedKeywords={selectedKeywords}
  setSelectedKeywords={setSelectedKeywords}
  colors={colors}
  isDarkMode={isDarkMode}
/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  title: { fontSize: 24, fontWeight: "bold" },
  cardCount: { fontSize: 16, marginBottom: 20 },
  quizContainer: { marginBottom: 10 },
  quizRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  quizButton: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  quizButtonFull: {
    padding: 15,
    marginHorizontal: 5,
    marginTop: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  quizText: { fontSize: 16, fontWeight: "bold" },
  actionRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 20, gap: 10 },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardItemSelected: { borderColor: "red", borderWidth: 2 },
  cardStats: { fontSize: 12, marginTop: 5 },
});
