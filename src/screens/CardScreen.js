import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';

export default function CardScreen({ route, navigation }) {
  const { deckId, onSave } = route.params;
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleSave = () => {
    if (onSave) {
      onSave(front, back); // DeckDetailScreen의 setCards 호출
    }
    setFront('');
    setBack('');
    navigation.goBack(); // 저장 후 이전 화면으로 돌아가기
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        placeholder="Front"
        value={front}
        onChangeText={setFront}
        style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
      />
      <TextInput
        placeholder="Back"
        value={back}
        onChangeText={setBack}
        style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
      />
      <Button title="Save Card" onPress={handleSave} />
    </View>
  );
}
