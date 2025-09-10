import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DeckListScreen from '../screens/DeckListScreen';
import DeckDetailScreen from '../screens/DeckDetailScreen';
import CardScreen from '../screens/CardScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DeckList" component={DeckListScreen} />
      <Stack.Screen name="DeckDetail" component={DeckDetailScreen} />
      <Stack.Screen name="Card" component={CardScreen} />
    </Stack.Navigator>
  );
}
