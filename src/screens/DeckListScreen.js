import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Button,
} from "react-native";

export default function DeckListScreen({ navigation, decks, setDecks }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const addDeck = () => setModalVisible(true);

  const confirmAdd = () => {
    if (!newTitle.trim()) return;
    const newDeck = { id: Date.now().toString(), title: newTitle.trim(), cards: [] };
    setDecks([...decks, newDeck]);
    setNewTitle("");
    setModalVisible(false);
    //navigation.navigate("DeckDetail", { deckId: newDeck.id });
  };

  const cancelAdd = () => {
    setNewTitle("");
    setModalVisible(false);
  };

  // 덱 없을 때
  if (decks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <TouchableOpacity style={styles.centerButton} onPress={addDeck}>
          <Text style={styles.centerButtonText}>＋ Add Deck</Text>
        </TouchableOpacity>
        <Text style={styles.emptyText}>No decks yet</Text>

        {/* 입력 모달 */}
        <DeckInputModal
          visible={modalVisible}
          title={newTitle}
          setTitle={setNewTitle}
          onConfirm={confirmAdd}
          onCancel={cancelAdd}
        />
      </View>
    );
  }

  // 덱 리스트 있을 때
  return (
    <View style={styles.container}>
      <View style={styles.topRightButtonContainer}>
        <TouchableOpacity onPress={addDeck}>
          <Text style={styles.topRightButton}>＋</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.deckItem}
            onPress={() =>
              navigation.navigate("DeckDetail", { deckId: item.id })
            }
          >
            <Text style={styles.deckTitle}>{item.title}</Text>
            <Text style={styles.cardCount}>{item.cards.length} cards</Text>
          </TouchableOpacity>
        )}
      />

      {/* 입력 모달 */}
      <DeckInputModal
        visible={modalVisible}
        title={newTitle}
        setTitle={setNewTitle}
        onConfirm={confirmAdd}
        onCancel={cancelAdd}
      />
    </View>
  );
}

// 모달을 별도 컴포넌트로 분리
function DeckInputModal({ visible, title, setTitle, onConfirm, onCancel }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>New Deck</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter deck title"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <Button title="취소" onPress={onCancel} />
            <Button title="확인" onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f2f2f2" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f2f2f2" },
  emptyText: { fontSize: 18, color: "#666", marginTop: 20 },
  centerButton: { padding: 20, backgroundColor: "white", borderRadius: 8 },
  centerButtonText: { fontSize: 18, fontWeight: "bold", color: "black" },
  topRightButtonContainer: { alignItems: "flex-end", marginBottom: 10 },
  topRightButton: { fontSize: 28, color: "black" },
  deckItem: { padding: 20, backgroundColor: "white", borderRadius: 8, marginBottom: 10 },
  deckTitle: { fontSize: 20, fontWeight: "bold", color: "black" },
  cardCount: { fontSize: 14, color: "#666", marginTop: 5 },

  // 모달 관련
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
});
