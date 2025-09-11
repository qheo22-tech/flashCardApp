import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";

export default function AddCardScreen({ navigation, route, decks, setDecks }) {
  const { deckId } = route.params;
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const addCard = () => {
    setDecks(prev =>
      prev.map(d =>
        d.id === deckId ? { ...d, cards: [...d.cards, { question, answer }] } : d
      )
    );
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Question"
        value={question}
        onChangeText={setQuestion}
        style={styles.input}
      />
      <TextInput
        placeholder="Answer"
        value={answer}
        onChangeText={setAnswer}
        style={styles.input}
      />
      <Button title="Add Card" onPress={addCard} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", marginBottom: 10, padding: 10, borderRadius: 5 },
});
