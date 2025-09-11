// DeckDetailScreen.tsx
import React from "react";
import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet } from "react-native";

export default function DeckDetailScreen({ navigation, route, decks }) {
  const { deckId } = route.params;
  const deck = decks.find(d => d.id === deckId);

  if (!deck) return <Text>Deck not found</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{deck.title}</Text>
      <Text>{deck.cards.length} cards</Text>

      <Button
        title="+ Add Card"
        onPress={() => navigation.navigate("AddCard", { deckId })}
      />

      <FlatList
        data={deck.cards}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("CardDetail", { card: item })}
          >
            <Text style={styles.cardText}>{item.question}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  card: { padding: 15, backgroundColor: "#e0e0e0", marginBottom: 10, borderRadius: 5 },
  cardText: { fontSize: 16 },
});
