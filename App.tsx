import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 화면 임포트
import DeckListScreen from "./src/screens/DeckListScreen";
import DeckDetailScreen from "./src/screens/DeckDetailScreen";
import AddCardScreen from "./src/screens/AddCardScreen";
import CardDetailScreen from "./src/screens/CardDetailScreen";
import QuizScreen from "./src/screens/QuizScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [decks, setDecks] = useState([]);

  // 앱 시작 시 AsyncStorage에서 덱 로드
  useEffect(() => {
    const loadDecks = async () => {
      try {
        const storedDecks = await AsyncStorage.getItem("decks");
        if (storedDecks) setDecks(JSON.parse(storedDecks));
      } catch (e) {
        console.error("Failed to load decks", e);
      }
    };
    loadDecks();
  }, []);

  // 덱 상태 변경 시 AsyncStorage 저장
  useEffect(() => {
    const saveDecks = async () => {
      try {
        await AsyncStorage.setItem("decks", JSON.stringify(decks));
      } catch (e) {
        console.error("Failed to save decks", e);
      }
    };
    saveDecks();
  }, [decks]);

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
          {(props) => <CardDetailScreen {...props} decks={decks} setDecks={setDecks} />}
        </Stack.Screen>

        <Stack.Screen name="Quiz">
          {(props) => <QuizScreen {...props} decks={decks} setDecks={setDecks} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
