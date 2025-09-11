import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DeckListScreen from "./src/screens/DeckListScreen";
import DeckDetailScreen from "./src/screens/DeckDetailScreen";
import AddCardScreen from "./src/screens/AddCardScreen";
import CardDetailScreen from "./src/screens/CardDetailScreen"; // <-- 이 줄이 있어야 함


const Stack = createNativeStackNavigator();

export default function App() {
  const [decks, setDecks] = useState([
  ]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="DeckList">
        <Stack.Screen name="DeckList">
          {(props) => <DeckListScreen {...props} decks={decks} setDecks={setDecks} />}
        </Stack.Screen>
        <Stack.Screen name="DeckDetail">
          {(props) => <DeckDetailScreen {...props} decks={decks} setDecks={setDecks} />}
        </Stack.Screen>
        <Stack.Screen name="AddCard">
          {(props) => <AddCardScreen {...props} decks={decks} setDecks={setDecks} />}
        </Stack.Screen>
        <Stack.Screen name="CardDetail">
          {(props) => <CardDetailScreen {...props} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
