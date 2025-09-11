// DeckListScreen.js
import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";

export default function DeckListScreen({ navigation, decks, setDecks }) {
  // 새 덱 추가
  const addDeck = () => {
    Alert.prompt(
      "New Deck",
      "Enter deck title",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: (title) => {
            if (!title) return;
            const newDeck = { id: Date.now().toString(), title, cards: [] };
            setDecks([...decks, newDeck]);
            navigation.navigate("DeckDetail", { deckId: newDeck.id });
          },
        },
      ],
      "plain-text"
    );
  };

  // 덱 없을 때 중앙 + 버튼
  if (decks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <TouchableOpacity style={styles.centerButton} onPress={addDeck}>
          <Text style={styles.centerButtonText}>＋ Add Deck</Text>
        </TouchableOpacity>
        <Text style={styles.emptyText}>No decks yet</Text>
      </View>
    );
  }

  // 덱이 하나라도 있을 때 리스트 + 상단 우측 + 버튼
  return (
    <View style={styles.container}>
      {/* 상단 우측 버튼 */}
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
            onPress={() => navigation.navigate("DeckDetail", { deckId: item.id })}
          >
            <Text style={styles.deckTitle}>{item.title}</Text>
            <Text style={styles.cardCount}>{item.cards.length} cards</Text>
          </TouchableOpacity>
        )}
      />
    </View>
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
});
