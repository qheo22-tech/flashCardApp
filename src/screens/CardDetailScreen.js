import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function CardDetailScreen({ route }) {
  const { card } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Question:</Text>
      <Text style={styles.content}>{card.question}</Text>

      <Text style={styles.label}>Answer:</Text>
      <Text style={styles.content}>{card.answer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  content: { fontSize: 16, marginTop: 5 },
});