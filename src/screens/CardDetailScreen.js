import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";

export default function CardDetailScreen({ navigation, decks, setDecks, route }) {
  const { deckId, cardId } = route.params;

  // 1️⃣ 선택된 덱/카드 찾기
  const deck = decks.find((d) => d.id === deckId);
  const card = deck?.cards.find((c) => c.id === cardId);

  // 2️⃣ 카드 수정 상태
  const [front, setFront] = useState(card?.front || "");
  const [back, setBack] = useState(card?.back || "");

  // 3️⃣ 카드 저장
  const saveCard = () => {
    const updatedDecks = decks.map((d) =>
      d.id === deckId
        ? {
            ...d,
            cards: d.cards.map((c) => (c.id === cardId ? { ...c, front, back } : c)),
          }
        : d
    );
    setDecks(updatedDecks);
    navigation.goBack();
  };

  if (!card) return <Text>Card not found</Text>;

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} value={front} onChangeText={setFront} />
      <TextInput style={styles.input} value={back} onChangeText={setBack} />
      <Button title="Save" onPress={saveCard} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 6 },
});
