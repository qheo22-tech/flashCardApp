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
import { ThemeContext } from "../contexts/ThemeContext";
import RenderHTML from "react-native-render-html";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

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

const classesStyles = {
  "hidden-text": {
    color: "transparent",
    backgroundColor: "#000",
  },
};

export default function DeckDetailScreen({ route, navigation, decks, setDecks }) {
  const { strings } = useContext(LanguageContext);
  const colors = useContext(ThemeContext);

  const { deckId } = route.params;
  const deck = decks.find((d) => d.id === deckId);

  const [modalVisible, setModalVisible] = useState(false); // 틀린 문제 모달
  const [wrongThreshold, setWrongThreshold] = useState("1");
  const [deleteDeckModalVisible, setDeleteDeckModalVisible] = useState(false);
  const [deleteCardsModalVisible, setDeleteCardsModalVisible] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);

  if (!deck)
    return <Text style={{ color: colors.text }}>{strings.deckNotFound || "Deck not found"}</Text>;

  const addCard = () => navigation.navigate("AddCard", { deckId: deck.id });

  const toggleSelectCard = (cardId) => {
    setSelectedCards((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedCards([]);
  };

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

  const handleConfirmDeleteDeck = () => {
    const updatedDecks = decks.filter((d) => d.id !== deck.id);
    setDecks(updatedDecks);
    setDeleteDeckModalVisible(false);
    navigation.goBack();
  };

  const startQuiz = () => {
    if (deck.cards.length === 0) return;
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    navigation.navigate("Quiz", { deckId: deck.id, cards: shuffled });
  };

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 제목 + 덱 삭제 버튼 */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>{deck.title}</Text>
        <TouchableOpacity onPress={() => setDeleteDeckModalVisible(true)}>
          <MaterialIcons name="delete" size={28} color="red" />
        </TouchableOpacity>
      </View>

      <Text style={[styles.cardCount, { color: colors.placeholder }]}>
        {deck.cards.length} {strings.cards}
      </Text>

      {/* 퀴즈 / 틀린 문제 풀기 */}
      <View style={styles.quizContainer}>
        <TouchableOpacity
          style={[
            styles.quizButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={startQuiz}
        >
          <Text style={[styles.quizText, { color: colors.text }]}>{strings.startQuiz}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.quizButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.quizText, { color: colors.text }]}>{strings.retryWrong}</Text>
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
                  source={{
                    html: normalizeHidden(item.front || "<p>(내용 없음)</p>"),
                  }}
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

      {/* 틀린 문제 모달 */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <Text style={{ marginBottom: 10, color: colors.text }}>
              {strings.enterWrongThreshold || "최소 틀린 횟수 입력:"}
            </Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
              keyboardType="number-pad"
              value={wrongThreshold}
              onChangeText={setWrongThreshold}
              placeholder="1"
              placeholderTextColor={colors.placeholder}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  {strings.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.text }]}
                onPress={startRetryWrong}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>
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
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {strings.deleteDeck}
            </Text>
            <Text style={{ marginBottom: 20, color: colors.text }}>
              {strings.deleteConfirm || "선택한 덱을 삭제하시겠습니까?"}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setDeleteDeckModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  {strings.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.text }]}
                onPress={handleConfirmDeleteDeck}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>
                  {strings.confirm}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* 카드 삭제 모달 */}
      <Modal visible={deleteCardsModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <Text style={{ marginBottom: 10, color: colors.text }}>
              선택한 카드를 삭제하시겠습니까?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setDeleteCardsModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.text }]}
                onPress={handleConfirmDeleteCards}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>삭제</Text>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  cardCount: { fontSize: 16, marginBottom: 20 },
  quizContainer: { marginBottom: 10 },
  quizButton: {
    padding: 20,
    marginVertical: 5,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1, // 테두리 복구
  },
  quizText: { fontSize: 18, fontWeight: "bold" },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardItemSelected: {
    borderColor: "red",
    borderWidth: 2,
  },
  cardStats: { fontSize: 12, marginTop: 5 },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
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
  },
});
