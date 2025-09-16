import React, { useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Button,
  Alert,
} from "react-native";
import { LanguageContext } from "../contexts/LanguageContext";

export default function DeckListScreen({ navigation, decks, setDecks }) {
  const { strings } = useContext(LanguageContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedDecks, setSelectedDecks] = useState([]);

  const addDeck = () => setModalVisible(true);

  const confirmAdd = () => {
    if (!newTitle.trim()) return;
    const newDeck = { id: Date.now().toString(), title: newTitle.trim(), cards: [] };
    setDecks([...decks, newDeck]);
    setNewTitle("");
    setModalVisible(false);
  };

  const cancelAdd = () => {
    setNewTitle("");
    setModalVisible(false);
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedDecks([]);
  };

  const toggleSelectDeck = (deckId) => {
    setSelectedDecks((prev) =>
      prev.includes(deckId) ? prev.filter((id) => id !== deckId) : [...prev, deckId]
    );
  };

  const confirmDelete = () => {
    if (selectedDecks.length === 0) {
      Alert.alert(strings.deleteDeck, strings.noCards || "선택된 덱이 없습니다.");
      return;
    }
    Alert.alert(strings.deleteDeck, strings.deleteConfirm || "삭제하시겠습니까?", [
      { text: strings.cancel, style: "cancel" },
      {
        text: strings.confirm,
        style: "destructive",
        onPress: () => {
          const updated = decks.filter((d) => !selectedDecks.includes(d.id));
          setDecks(updated);
          setDeleteMode(false);
          setSelectedDecks([]);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 상단 버튼 */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 10 }}>
        {deleteMode ? (
          <>
            <TouchableOpacity onPress={confirmDelete}>
              <Text style={styles.topRightButton}>🗑</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleDeleteMode}>
              <Text style={styles.topRightButton}>✖</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={addDeck}>
              <Text style={styles.topRightButton}>＋</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleDeleteMode}>
              <Text style={styles.topRightButton}>🗑</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* 덱 리스트 */}
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        numColumns={1}
        renderItem={({ item }) => {
          const isSelected = selectedDecks.includes(item.id);
          return (
            <TouchableOpacity
              style={[
                styles.deckItem,
                deleteMode && isSelected && { borderColor: "red", borderWidth: 2 },
              ]}
              onPress={() =>
                deleteMode
                  ? toggleSelectDeck(item.id)
                  : navigation.navigate("DeckDetail", { deckId: item.id })
              }
            >
              {deleteMode && (
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.deckTitle}>{item.title}</Text>
                <Text style={styles.cardCount}>
                  {item.cards.length} {strings.cards}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <DeckInputModal
        visible={modalVisible}
        title={newTitle}
        setTitle={setNewTitle}
        onConfirm={confirmAdd}
        onCancel={cancelAdd}
        strings={strings}
      />
    </View>
  );
}

function DeckInputModal({ visible, title, setTitle, onConfirm, onCancel, strings }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{strings.newDeck}</Text>
          <TextInput
            style={styles.modalInput}
            placeholder={strings.enterDeckTitle}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <Button title={strings.cancel} onPress={onCancel} />
            <Button title={strings.confirm} onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f2f2f2" },
  topRightButton: { fontSize: 28, color: "black", marginHorizontal: 10 },
  deckItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "white",
    borderRadius: 8,
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
  checkbox: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkboxSelected: {
    backgroundColor: "red",
  },
  deckTitle: { fontSize: 20, fontWeight: "bold", color: "black" },
  cardCount: { fontSize: 14, color: "#666", marginTop: 5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: { width: "80%", backgroundColor: "white", borderRadius: 10, padding: 20 },
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
