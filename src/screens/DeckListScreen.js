import React, { useState, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button } from "react-native";
import { LanguageContext } from "../contexts/LanguageContext";

export default function DeckListScreen({ navigation, decks, setDecks }) {
  const { strings } = useContext(LanguageContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");

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

  if (decks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <TouchableOpacity style={styles.centerButton} onPress={addDeck}>
          <Text style={styles.centerButtonText}>＋ {strings.newDeck}</Text>
        </TouchableOpacity>
        <Text style={styles.emptyText}>{strings.noDecksYet}</Text>

        <DeckInputModal visible={modalVisible} title={newTitle} setTitle={setNewTitle} onConfirm={confirmAdd} onCancel={cancelAdd} strings={strings} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
     <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 10 }}>
       <TouchableOpacity onPress={addDeck}><Text style={styles.topRightButton}>＋</Text></TouchableOpacity>
     </View>


      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.deckItemHorizontal} onPress={() => navigation.navigate("DeckDetail", { deckId: item.id })}>
            <Text style={styles.deckTitle}>{item.title}</Text>
            <Text style={styles.cardCount}>{item.cards.length} {strings.cards}</Text>
          </TouchableOpacity>
        )}
      />

      <DeckInputModal visible={modalVisible} title={newTitle} setTitle={setNewTitle} onConfirm={confirmAdd} onCancel={cancelAdd} strings={strings} />
    </View>
  );
}

function DeckInputModal({ visible, title, setTitle, onConfirm, onCancel, strings }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{strings.newDeck}</Text>
          <TextInput style={styles.modalInput} placeholder={strings.enterDeckTitle} value={title} onChangeText={setTitle} autoFocus />
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
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f2f2f2" },
  emptyText: { fontSize: 18, color: "#666", marginTop: 20 },
  centerButton: { padding: 20, backgroundColor: "white", borderRadius: 8 },
  centerButtonText: { fontSize: 18, fontWeight: "bold", color: "black" },
  topRightButton: { fontSize: 28, color: "black" },
  deckItemHorizontal: { flex: 1, marginHorizontal: 5, padding: 20, backgroundColor: "white", borderRadius: 8, minWidth: 150 },
  deckTitle: { fontSize: 20, fontWeight: "bold", color: "black" },
  cardCount: { fontSize: 14, color: "#666", marginTop: 5 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalBox: { width: "80%", backgroundColor: "white", borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10, marginBottom: 20 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
});
