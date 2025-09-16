// src/screens/DeckDetailScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import { LanguageContext } from "../contexts/LanguageContext";
import RenderHTML from "react-native-render-html";

// 🔹 숨김 span 변환 유틸 함수 (글자 단위 변환)
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

// 🔹 숨김 텍스트 스타일
const classesStyles = {
  "hidden-text": {
    color: "transparent",
    backgroundColor: "#000",
  },
};

export default function DeckDetailScreen({ route, navigation, decks, setDecks }) {
  const { strings } = useContext(LanguageContext);
  const { deckId } = route.params;
  const deck = decks.find((d) => d.id === deckId);
  const [modalVisible, setModalVisible] = useState(false);
  const [wrongThreshold, setWrongThreshold] = useState("1");

  // 다중 삭제 모드
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);

  if (!deck) return <Text>{strings.deckNotFound || "Deck not found"}</Text>;

  // 카드 추가
  const addCard = () => navigation.navigate("AddCard", { deckId: deck.id });

  // 카드 선택/해제
  const toggleSelectCard = (cardId) => {
    setSelectedCards((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  // 삭제 모드 토글
  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedCards([]);
  };

  // 카드 다중 삭제
  const confirmDelete = () => {
    if (selectedCards.length === 0) {
      Alert.alert(strings.deleteCard, strings.noCards || "선택된 카드가 없습니다.");
      return;
    }
    Alert.alert(strings.deleteCard, strings.deleteConfirm || "삭제하시겠습니까?", [
      { text: strings.cancel, style: "cancel" },
      {
        text: strings.confirm,
        style: "destructive",
        onPress: () => {
          const updatedDecks = decks.map((d) =>
            d.id === deck.id
              ? { ...d, cards: d.cards.filter((c) => !selectedCards.includes(c.id)) }
              : d
          );
          setDecks(updatedDecks);
          setDeleteMode(false);
          setSelectedCards([]);
        },
      },
    ]);
  };

  // 퀴즈 시작
  const startQuiz = () => {
    if (deck.cards.length === 0) {
      Alert.alert(strings.noCards, strings.noCardsMsg || "This deck has no cards.");
      return;
    }
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    navigation.navigate("Quiz", { deckId: deck.id, cards: shuffled });
  };

  // 틀린 문제 모달
  const startRetryWrong = () => {
    const threshold = parseInt(wrongThreshold);
    if (isNaN(threshold) || threshold < 1) {
      Alert.alert(strings.invalidNumber || "Invalid number", strings.enterValidNumber || "Please enter a valid number.");
      return;
    }
    const filtered = deck.cards.filter((c) => (c.wrong || 0) >= threshold);
    if (filtered.length === 0) {
      Alert.alert(strings.noWrongCards || "No cards", `${strings.noWrongCardsMsg || "No cards with wrong attempts ≥"} ${threshold}`);
      return;
    }
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    setModalVisible(false);
    navigation.navigate("Quiz", { deckId: deck.id, cards: shuffled, retryWrong: true });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{deck.title}</Text>
      <Text style={styles.cardCount}>
        {deck.cards.length} {strings.cards}
      </Text>

      {/* 퀴즈 / 틀린 문제 풀기 */}
      <View style={styles.quizContainer}>
        <TouchableOpacity style={styles.quizButton} onPress={startQuiz}>
          <Text style={styles.quizText}>{strings.startQuiz}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quizButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.quizText}>{strings.retryWrong}</Text>
        </TouchableOpacity>
      </View>

      {/* 카드 추가 / 삭제 버튼 (퀴즈 버튼 아래, 우측) */}
      <View style={styles.actionRow}>
        {deleteMode ? (
          <>
            <TouchableOpacity onPress={confirmDelete}>
              <Text style={styles.actionButton}>🗑</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleDeleteMode}>
              <Text style={styles.actionButton}>✖</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={addCard}>
              <Text style={styles.actionButton}>＋</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleDeleteMode}>
              <Text style={styles.actionButton}>🗑</Text>
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
                deleteMode && isSelected && { borderColor: "red", borderWidth: 2 },
              ]}
              onPress={() =>
                deleteMode
                  ? toggleSelectCard(item.id)
                  : navigation.navigate("CardDetail", { deckId: deck.id, cardId: item.id })
              }
            >
              {deleteMode && (
                <View style={styles.checkboxContainer}>
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <RenderHTML
                  contentWidth={Dimensions.get("window").width - 40}
                  source={{
                    html: normalizeHidden(item.front || "<p>(내용 없음)</p>"),
                  }}
                  classesStyles={classesStyles}
                />
                <Text style={styles.cardStats}>
                  {strings.attempts}: {item.attempts || 0} | {strings.correct}: {item.correct || 0} | {strings.wrong}: {item.wrong || 0}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* 틀린 문제 모달 */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ marginBottom: 10 }}>{strings.enterWrongThreshold || "최소 틀린 횟수 입력:"}</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={wrongThreshold}
              onChangeText={setWrongThreshold}
            />
            <View style={{ flexDirection: "row", marginTop: 15 }}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={{ color: "white", fontWeight: "bold" }}>{strings.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: "green" }]} onPress={startRetryWrong}>
                <Text style={{ color: "white", fontWeight: "bold" }}>{strings.retryWrong}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f2f2f2" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 5, color: "black" },
  cardCount: { fontSize: 16, color: "#666", marginBottom: 20 },
  quizContainer: { marginBottom: 10 },
  quizButton: {
    padding: 20,
    marginVertical: 5,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "white",
  },
  quizText: { fontSize: 18, fontWeight: "bold", color: "black" },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  actionButton: { fontSize: 28, color: "black", marginHorizontal: 10 },

  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 10,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#666",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkbox: { width: 12, height: 12, borderRadius: 6 },
  checkboxSelected: { backgroundColor: "red" },
  cardStats: { fontSize: 12, color: "#666", marginTop: 5 },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: 250,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 8,
  },
  modalInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10, marginBottom: 10 },
  modalButton: {
    padding: 10,
    backgroundColor: "red",
    borderRadius: 6,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
});
