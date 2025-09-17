// src/screens/DeckListScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";
import { ThemeContext } from "../contexts/ThemeContext";
import { LanguageContext } from "../contexts/LanguageContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function DeckListScreen({ navigation, decks, setDecks }) {
  const colors = useContext(ThemeContext);   // 👈 테마 색상 가져오기
  const { strings } = useContext(LanguageContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedDecks, setSelectedDecks] = useState([]);
  const [deleteDeckModalVisible, setDeleteDeckModalVisible] = useState(false);

  // 덱 추가
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

  // 삭제 모드 토글
  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedDecks([]);
  };

  // 덱 선택/해제
  const toggleSelectDeck = (deckId) => {
    setSelectedDecks((prev) =>
      prev.includes(deckId) ? prev.filter((id) => id !== deckId) : [...prev, deckId]
    );
  };

  // 덱 삭제 확인
  const handleConfirmDeleteDecks = () => {
    const updated = decks.filter((d) => !selectedDecks.includes(d.id));
    setDecks(updated);
    setDeleteMode(false);
    setSelectedDecks([]);
    setDeleteDeckModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 상단 버튼 */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 10, alignItems: "center" }}>
        {deleteMode ? (
          <>
            <TouchableOpacity onPress={() => setDeleteDeckModalVisible(true)}>
              <MaterialIcons name="delete" size={28} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleDeleteMode} style={{ marginLeft: 10 }}>
              <MaterialIcons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={addDeck}>
              <MaterialIcons name="add" size={28} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleDeleteMode} style={{ marginLeft: 10 }}>
              <MaterialIcons name="delete" size={28} color={colors.text} />
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
                { backgroundColor: colors.card, borderColor: colors.border },
                deleteMode && isSelected && { borderColor: "red", borderWidth: 2 },
              ]}
              onPress={() =>
                deleteMode
                  ? toggleSelectDeck(item.id)
                  : navigation.navigate("DeckDetail", { deckId: item.id })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.deckTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.cardCount, { color: colors.placeholder }]}>
                  {item.cards.length} {strings.cards}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* 덱 추가 모달 */}
      <DeckInputModal
        visible={modalVisible}
        title={newTitle}
        setTitle={setNewTitle}
        onConfirm={confirmAdd}
        onCancel={cancelAdd}
        strings={strings}
      />

      {/* 덱 삭제 모달 */}
      <Modal visible={deleteDeckModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{strings.deleteDeck}</Text>
            <Text style={{ marginBottom: 20, color: colors.text }}>
              {strings.deleteConfirm || "선택한 덱을 삭제하시겠습니까?"}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setDeleteDeckModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>{strings.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.text }]}
                onPress={handleConfirmDeleteDecks}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>{strings.confirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DeckInputModal({ visible, title, setTitle, onConfirm, onCancel, strings }) {
  const colors = useContext(ThemeContext);  // 👈 모달도 테마 적용

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{strings.newDeck}</Text>
          <TextInput
            style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
            placeholder={strings.enterDeckTitle}
            placeholderTextColor={colors.placeholder}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.border }]} onPress={onCancel}>
              <Text style={[styles.modalButtonText, { color: colors.text }]}>{strings.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.text }]} onPress={onConfirm}>
              <Text style={[styles.modalButtonText, { color: colors.background }]}>{strings.confirm}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  deckItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  deckTitle: { fontSize: 20, fontWeight: "bold" },
  cardCount: { fontSize: 14, marginTop: 5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    maxWidth: 400,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
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
