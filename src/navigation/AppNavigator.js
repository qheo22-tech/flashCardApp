import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DeckListScreen from "../screens/DeckListScreen";
import DeckDetailScreen from "../screens/DeckDetailScreen";
import AddCardScreen from "../screens/AddCardScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DeckList" component={DeckListScreen} options={{ title: "Decks" }} />
      <Stack.Screen name="DeckDetail" component={DeckDetailScreen} options={{ title: "Deck Detail" }} />
      <Stack.Screen name="AddCard" component={AddCardScreen} options={{ title: "Add Card" }} />
    </Stack.Navigator>
  );
}
