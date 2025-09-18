// src/screens/DeckDetailScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Dimensions,
  Alert,
} from "react-native";
import { LanguageContext } from "../contexts/LanguageContext";
import { ThemeContext } from "../contexts/ThemeContext";
import RenderHTML from "react-native-render-html";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// 숨김 변환
const normalizeHidden = (html) => {
  if (!html) return "";
  return html.replace(
    /<span style="[^"]*(color:\s*transparent|background-color:\s*black)[^"]*">(.*?)<\/span>/gi,
    (match, _style, innerText) =>
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

  const [modalVisible, setModalVisible] = useState(false);
  const [wrongThreshold, setWrongThreshold] = useState("1");
  const [deleteDeckModalVisible, setDeleteDeckModalVisible] = useState(false);
  const [deleteCardsModalVisible, setDeleteCardsModalVisible] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);

  if (!deck) {
    return <Text style={{ color: colors.text }}>{strings.deckNotFound || "Deck not found"}</Text>;
  }

  // 카드 추가
  const addCard = () => navigation.navigate("AddCard", { deckId: deck.id });

  // 카드 선택
  const toggleSelectCard = (cardId) => {
    setSelectedCards((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  // 삭제모드 토글
  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedCards([]);
  };

  // 선택 카드 삭제
  const handleConfirmDeleteCards = () => {
    const updatedDecks = decks.map((d) =>
      d.id === deck.id ? { ...d, cards: d.cards.filter((c) => !selectedCards.includes(c.id)) } : d
    );
    setDecks(updatedDecks);
    setDeleteMode(false);
    setSelectedCards([]);
    setDeleteCardsModalVisible(false);
  };

  // 덱 삭제
  const handleConfirmDeleteDeck = () => {
    const updatedDecks = decks.filter((d) => d.id !== deck.id);
    setDecks(updatedDecks);
    setDeleteDeckModalVisible(false);
    navigation.goBack();
  };

  // 공통: 퀴즈 시작 시 삭제모드 해제
  const exitDeleteMode = () => {
    setDeleteMode(false);
    setSelectedCards([]);
  };

  // 퀴즈 시작 (보기)
  const startQuizView = () => {
    if (deck.cards.length === 0) return;
    exitDeleteMode(); // ✅ 삭제 모드 해제
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    navigation.navigate("Quiz", { deckId: deck.id, cards: shuffled, mode: "view" });
  };

  // 퀴즈 시작 (정답풀기)
  const startQuizSolve = () => {
    if (deck.cards.length === 0) return;
    exitDeleteMode(); // ✅ 삭제 모드 해제
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    navigation.navigate("Quiz", { deckId: deck.id, cards: shuffled, mode: "solve" });
  };

  // 틀린 문제 풀기
  const startRetryWrong = () => {
    const threshold = parseInt(wrongThreshold);
    if (isNaN(threshold) || threshold < 1) return;
    const filtered = deck.cards.filter((c) => (c.wrong || 0) >= threshold);
    if (filtered.length === 0) return;
    exitDeleteMode(); // ✅ 삭제 모드 해제
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    setModalVisible(false);
    navigation.navigate("Quiz", { deckId: deck.id, cards: shuffled, retryWrong: true });
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
                  cards: d.cards.map((c) => ({ ...c, attempts: 0, correct: 0, wrong: 0 })),
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
        <TouchableOpacity onPress={() => setDeleteDeckModalVisible(true)}>
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
            style={[styles.quizButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={startQuizView}
          >
            <Text style={[styles.quizText, { color: colors.text }]}>{strings.startQuiz}(보기)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quizButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={startQuizSolve}
          >
            <Text style={[styles.quizText, { color: colors.text }]}>{strings.startQuiz}(정답풀기)</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.quizButtonSingle, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.quizText, { color: colors.text }]}>{strings.retryWrong}</Text>
        </TouchableOpacity>
      </View>

      {/* 카드 액션 버튼 */}
      <View style={styles.actionRow}>
        {deleteMode ? (
          <>
            <TouchableOpacity
              onPress={() =>
                selectedCards.length === 0 ? setDeleteCardsModalVisible(false) : setDeleteCardsModalVisible(true)
              }
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

      {/* ───────── 모달 (버튼 순서統一: 취소 → 확인) ───────── */}

      {/* 틀린 문제 모달 */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: "#fff" }]}>
            <Text style={{ marginBottom: 10, color: isDarkMode ? "#000" : colors.text }}>
              {strings.enterWrongThreshold || "최소 틀린 횟수 입력:"}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { color: isDarkMode ? "#000" : colors.text, borderColor: colors.border },
              ]}
              keyboardType="number-pad"
              value={wrongThreshold}
              onChangeText={setWrongThreshold}
              placeholder="1"
              placeholderTextColor={colors.placeholder}
            />
            <View style={styles.modalButtons}>
              {/* 취소 → 확인 순서 */}
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDarkMode ? "#444" : "#ddd" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>{strings.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.accent }]}
                onPress={startRetryWrong}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>{strings.retryWrong}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 덱 삭제 모달 */}
      <Modal visible={deleteDeckModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: "#fff" }]}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? "#000" : colors.text }]}>
              {strings.deleteDeck}
            </Text>
            <Text style={{ marginBottom: 20, color: isDarkMode ? "#000" : colors.text }}>
              {strings.deleteConfirm || "선택한 덱을 삭제하시겠습니까?"}
            </Text>
            <View style={styles.modalButtons}>
              {/* 취소 → 확인 순서 */}
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDarkMode ? "#444" : "#ddd" }]}
                onPress={() => setDeleteDeckModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>{strings.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.accent }]}
                onPress={handleConfirmDeleteDeck}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>{strings.confirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 카드 삭제 모달 */}
      <Modal visible={deleteCardsModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: "#fff" }]}>
            <Text style={{ marginBottom: 10, color: isDarkMode ? "#000" : colors.text }}>
              {strings.deleteSelectedCards || "선택한 카드를 삭제하시겠습니까?"}
            </Text>
            <View style={styles.modalButtons}>
              {/* 취소 → 확인 순서 */}
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDarkMode ? "#444" : "#ddd" }]}
                onPress={() => setDeleteCardsModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>{strings.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.accent }]}
                onPress={handleConfirmDeleteCards}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>{strings.confirm || "삭제"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  title: { fontSize: 24, fontWeight: "bold" },
  cardCount: { fontSize: 16, marginBottom: 20 },
  quizContainer: { marginBottom: 10 },
  quizRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  quizButton: { flex: 1, padding: 15, marginHorizontal: 5, borderRadius: 8, alignItems: "center", borderWidth: 1 },
  quizButtonSingle: { padding: 15, borderRadius: 8, alignItems: "center", borderWidth: 1 },
  quizText: { fontSize: 16, fontWeight: "bold" },
  actionRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 20, gap: 10 },
  cardItem: { flexDirection: "row", alignItems: "center", padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1 },
  cardItemSelected: { borderColor: "red", borderWidth: 2 },
  cardStats: { fontSize: 12, marginTop: 5 },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "80%", maxWidth: 400, padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalInput: { borderWidth: 1, borderRadius: 6, padding: 10, marginBottom: 10 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6 },
  modalButtonText: { fontSize: 16, fontWeight: "bold" },
});
