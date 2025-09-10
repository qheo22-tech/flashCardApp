import React from 'react';
import { View, Text, Button, FlatList, TouchableOpacity } from 'react-native';

const decks = [
  { id: '1', name: 'React Basics' },
  { id: '2', name: 'JavaScript Advanced' },
];

export default function DeckListScreen({ navigation }) {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('DeckDetail', { deckId: item.id })}>
            <Text style={{ fontSize: 20, marginVertical: 10 }}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
