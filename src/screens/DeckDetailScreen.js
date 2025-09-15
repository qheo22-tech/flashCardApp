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

export default function DeckDetailScreen({ route, navigation, decks, setDecks }) {
  const { strings } = useContext(LanguageContext);
  const { deckId } = route.params;
  const deck = decks.find((d) => d.id === deckId);
  const [modalVisible, setModalVisible] = useState(false);
  const [wrongThreshold, setWrongThreshold] = useState("1");

  if (!deck) return <Text>{strings.deckNotFound || "Deck not found"}</Text>;

  // 덱 삭제
  const deleteDeck = () => {
    Alert.alert(strings.deleteDeck, strings.deleteConfirm || "Are you sure?", [
      { text: strings.cancel, style: "cancel" },
      {
        text: strings.confirm,
        style: "destructive",
        onPress: () => {
          const updated = decks.filter((d) => d.id !== deck.id);
          setDecks(updated);
          navigation.navigate("DeckList");
        },
      },
    ]);
  };

  // 카드 추가
  const addCard = () => navigation.navigate("AddCard", { deckId: deck.id });

  // 퀴즈 시작
  const startQuiz = () => {
    if (deck.cards.length === 0) {
      Alert.alert(strings.noCards, strings.noCardsMsg || "This deck has no cards.");
      return;
    }
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    navigation.navigate("Quiz", { deckId: deck.id, cards: shuffled });
  };

  // 틀린 문제 모달 열기
  const openRetryWrongModal = () => setModalVisible(true);

  const startRetryWrong = () => {
    const threshold = parseInt(wrongThreshold);
    if (isNaN(threshold) || threshold < 1) {
      Alert.alert(
        strings.invalidNumber || "Invalid number",
        strings.enterValidNumber || "Please enter a valid number."
      );
      return;
    }
    const filtered = deck.cards.filter((c) => (c.wrong || 0) >= threshold);
    if (filtered.length === 0) {
      Alert.alert(
        strings.noWrongCards || "No cards",
        `${strings.noWrongCardsMsg || "No cards with wrong attempts ≥"} ${threshold}`
      );
      return;
    }
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    setModalVisible(false);
    navigation.navigate("Quiz", { deckId: deck.id, cards: shuffled, retryWrong: true });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.iconButton} onPress={addCard}>
          <Text style={styles.iconText}>＋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={deleteDeck}>
          <Text style={styles.iconText}>🗑</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{deck.title}</Text>
      <Text style={styles.cardCount}>
        {deck.cards.length} {strings.cards}
      </Text>

      <View style={styles.quizContainer}>
        <TouchableOpacity
          style={[styles.quizButton, { backgroundColor: "white" }]}
          onPress={startQuiz}
        >
          <Text style={[styles.quizText, { color: "black" }]}>
            {strings.startQuiz}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quizButton, { backgroundColor: "white" }]}
          onPress={openRetryWrongModal}
        >
          <Text style={[styles.quizText, { color: "black" }]}>
            {strings.retryWrong}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={deck.cards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardItem}
            onPress={() =>
              navigation.navigate("CardDetail", {
                deckId: deck.id,
                cardId: item.id,
              })
            }
          >
            {/* 🔽 HTML 파싱 렌더링 */}
            <RenderHTML
              contentWidth={Dimensions.get("window").width - 40}
              source={{ html: item.front || "<p>(내용 없음)</p>" }}
            />

            <Text style={styles.cardStats}>
              {strings.attempts}: {item.attempts || 0} | {strings.correct}:{" "}
              {item.correct || 0} | {strings.wrong}: {item.wrong || 0}
            </Text>
          </TouchableOpacity>
        )}
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
            <View style={{ flexDirection: "row", marginTop: 15 }}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {strings.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "green" }]}
                onPress={startRetryWrong}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {strings.retryWrong}
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
  topRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 10 },
  iconButton: { marginLeft: 10 },
  iconText: { fontSize: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 5, color: "black" },
  cardCount: { fontSize: 16, color: "#666", marginBottom: 20 },
  quizContainer: { marginBottom: 20 },
  quizButton: {
    padding: 20,
    marginVertical: 5,
    borderRadius: 8,
    alignItems: "center",
  },
  quizText: { fontSize: 18, fontWeight: "bold" },
  cardItem: {
    padding: 15,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 10,
  },
  cardFront: { fontSize: 16, color: "black" },
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
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  modalButton: {
    padding: 10,
    backgroundColor: "red",
    borderRadius: 6,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});
