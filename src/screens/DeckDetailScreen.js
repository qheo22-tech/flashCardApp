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
} from "react-native";
import { LanguageContext } from "../contexts/LanguageContext";
import RenderHTML from "react-native-render-html";
import MaterialIcons from "react-native-vector-icons/MaterialIcons"; // ✅ MaterialIcons 사용

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

  // 삭제 관련 모달 상태
  const [deleteDeckModalVisible, setDeleteDeckModalVisible] = useState(false);
  const [deleteCardsModalVisible, setDeleteCardsModalVisible] = useState(false);

  // 다중 삭제 모드 (카드)
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

  // 삭제 모드 토글 (카드)
  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedCards([]);
  };

  // 카드 다중 삭제 실행
  const handleConfirmDeleteCards = () => {
    const updatedDecks = decks.map((d) =>
      d.id === deck.id
        ? { ...d, cards: d.cards.filter((c) => !selectedCards.includes(c.id)) }
        : d
    );
    setDecks(updatedDecks);
    setDeleteMode(false);
    setSelectedCards([]);
    setDeleteCardsModalVisible(false);
  };

  // 덱 삭제 실행
  const handleConfirmDeleteDeck = () => {
    const updatedDecks = decks.filter((d) => d.id !== deck.id);
    setDecks(updatedDecks);
    setDeleteDeckModalVisible(false);
    navigation.goBack();
  };

  // 퀴즈 시작
  const startQuiz = () => {
    if (deck.cards.length === 0) {
      return;
    }
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    navigation.navigate("Quiz", { deckId: deck.id, cards: shuffled });
  };

  // 틀린 문제 모달 실행
  const startRetryWrong = () => {
    const threshold = parseInt(wrongThreshold);
    if (isNaN(threshold) || threshold < 1) return;

    const filtered = deck.cards.filter((c) => (c.wrong || 0) >= threshold);
    if (filtered.length === 0) return;

    const shuffled = filtered.sort(() => Math.random() - 0.5);
    setModalVisible(false);
    navigation.navigate("Quiz", { deckId: deck.id, cards: shuffled, retryWrong: true });
  };

  return (
    <View style={styles.container}>
      {/* 제목 + 덱 삭제 버튼 */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{deck.title}</Text>
        <TouchableOpacity onPress={() => setDeleteDeckModalVisible(true)}>
          <MaterialIcons name="delete" size={28} color="red" />
        </TouchableOpacity>
      </View>

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

      {/* 카드 추가 / 삭제 버튼 */}
      <View style={styles.actionRow}>
        {deleteMode ? (
          <>
            <TouchableOpacity
              onPress={() =>
                selectedCards.length === 0
                  ? setDeleteCardsModalVisible(false)
                  : setDeleteCardsModalVisible(true)
              }
            >
              <MaterialIcons name="delete" size={28} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleDeleteMode}>
              <MaterialIcons name="close" size={28} color="black" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={addCard}>
              <MaterialIcons name="add" size={28} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleDeleteMode}>
              <MaterialIcons name="delete" size={28} color="black" />
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
            <Text style={{ marginBottom: 10 }}>
              {strings.enterWrongThreshold || "최소 틀린 횟수 입력:"}
            </Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={wrongThreshold}
              onChangeText={setWrongThreshold}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>{strings.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "black" }]}
                onPress={startRetryWrong}
              >
                <Text style={[styles.modalButtonText, { color: "white" }]}>
                  {strings.retryWrong}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 덱 삭제 모달 */}
      <Modal visible={deleteDeckModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ marginBottom: 10 }}>이 덱을 삭제하시겠습니까?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setDeleteDeckModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "black" }]}
                onPress={handleConfirmDeleteDeck}
              >
                <Text style={[styles.modalButtonText, { color: "white" }]}>
                  삭제
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 카드 삭제 모달 */}
      <Modal visible={deleteCardsModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ marginBottom: 10 }}>선택한 카드를 삭제하시겠습니까?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setDeleteCardsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "black" }]}
                onPress={handleConfirmDeleteCards}
              >
                <Text style={[styles.modalButtonText, { color: "white" }]}>
                  삭제
                </Text>
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

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "black" },

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

  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardItemSelected: {
    borderColor: "red",
    borderWidth: 2,
  },
  cardStats: { fontSize: 12, color: "#666", marginTop: 5 },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
 modalContainer: {
  width: "80%",        // ✅ 덱 추가 모달과 동일
  maxWidth: 400,       // ✅ 너무 넓어지지 않게 제한
  padding: 20,
  backgroundColor: "white",
  borderRadius: 10,
},
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },

  // ✅ DeckListScreen과 동일한 버튼 스타일
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});
