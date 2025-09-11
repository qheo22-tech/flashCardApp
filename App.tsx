import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 📁 화면(Screen) 임포트
import DeckListScreen from "./src/screens/DeckListScreen";
import DeckDetailScreen from "./src/screens/DeckDetailScreen";
import AddCardScreen from "./src/screens/AddCardScreen";
import CardDetailScreen from "./src/screens/CardDetailScreen";
import QuizScreen from "./src/screens/QuizScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  // 1️⃣ 앱 전체에서 사용하는 덱 상태
  const [decks, setDecks] = useState([]);

  // 2️⃣ 앱 시작 시 AsyncStorage에서 저장된 덱 불러오기
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

  // 3️⃣ 덱 상태가 바뀔 때마다 AsyncStorage에 저장
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

  // 4️⃣ 네비게이션 설정
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="DeckList">
        {/* 덱 목록 화면 */}
        <Stack.Screen name="DeckList">
          {(props) => <DeckListScreen {...props} decks={decks} setDecks={setDecks} />}
        </Stack.Screen>

        {/* 덱 상세 화면 (카드 목록, 퀴즈 시작 등) */}
        <Stack.Screen name="DeckDetail">
          {(props) => <DeckDetailScreen {...props} decks={decks} setDecks={setDecks} />}
        </Stack.Screen>

        {/* 카드 추가 화면 */}
        <Stack.Screen name="AddCard">
          {(props) => <AddCardScreen {...props} decks={decks} setDecks={setDecks} />}
        </Stack.Screen>

        {/* 카드 상세 화면 (앞면/뒷면 보기, 수정) */}
        <Stack.Screen name="CardDetail">
          {(props) => <CardDetailScreen {...props} decks={decks} setDecks={setDecks} />}
        </Stack.Screen>

        {/* 퀴즈 화면 */}
        <Stack.Screen name="Quiz">
          {(props) => <QuizScreen {...props} decks={decks} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
