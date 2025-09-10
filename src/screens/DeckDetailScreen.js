import React, { useState } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';

export default function DeckDetailScreen({ route, navigation }) {
  const { deckId } = route.params;
  const [cards, setCards] = useState([]);

  const handleAddCard = () => {
    navigation.navigate('Card', {
      deckId,
      onSave: (front, back) => {
        setCards([...cards, { front, back }]);
        Alert.alert('카드 추가 완료!', `Front: ${front}, Back: ${back}`);
      },
    });
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Deck Detail: {deckId}</Text>
      <Button title="Add Card" onPress={handleAddCard} />
      <FlatList
        data={cards}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10, borderWidth: 1, padding: 10 }}>
            <Text>Front: {item.front}</Text>
            <Text>Back: {item.back}</Text>
          </View>
        )}
      />
    </View>
  );
}
