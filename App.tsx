import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LanguageProvider } from "./src/contexts/LanguageContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { LogBox, Alert, Linking, Platform } from "react-native";
import VersionCheck from "react-native-version-check"; // ✅ 버전 체크 라이브러리 추가
import { QuillToolbar } from "react-native-cn-quill"; // 툴바는 그대로 사용
import PlainQuillEditor from "./src/utils/PlainQuillEditor";

// 화면 임포트
import DeckListScreen from "./src/screens/DeckListScreen";
import DeckDetailScreen from "./src/screens/DeckDetailScreen";
import AddCardScreen from "./src/screens/AddCardScreen";
import CardDetailScreen from "./src/screens/CardDetailScreen";
import QuizScreen from "./src/screens/QuizScreen";
import LanguageToggleButton from "./src/components/LanguageToggleButton";


const Stack = createNativeStackNavigator();

export default function App() {
  const [decks, setDecks] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false); // ✅ 업데이트 필요 여부

  // 모든 경고 숨기기
  LogBox.ignoreAllLogs();

  // ✅ 앱 실행 시 버전 체크
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const latestVersion = await VersionCheck.getLatestVersion(); // 스토어 최신 버전
        const currentVersion = VersionCheck.getCurrentVersion(); // 현재 앱 버전

        console.log("📱 현재 버전:", currentVersion, "🛒 스토어 최신 버전:", latestVersion);

        if (VersionCheck.needUpdate({ currentVersion, latestVersion }).isNeeded) {
          setIsBlocked(true); // 기능 차단
          Alert.alert(
            "업데이트 필요",
            "앱을 최신 버전으로 업데이트해야 사용 가능합니다.",
            [
              {
                text: "업데이트 하기",
                onPress: async () => {
                  const storeUrl =
                    Platform.OS === "ios"
                      ? await VersionCheck.getAppStoreUrl()
                      : await VersionCheck.getPlayStoreUrl();
                  Linking.openURL(storeUrl);
                },
              },
            ],
            { cancelable: false } // 닫기 불가
          );
        }
      } catch (error) {
        console.error("버전 체크 실패:", error);
      }
    };

    checkVersion();
  }, []);

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

  // ✅ 업데이트 필요 시 화면 차단
  if (isBlocked) {
    return null; // 아무 화면도 안 보여줌 → Alert로 업데이트 강제
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="DeckList"
            screenOptions={{
              headerRight: () => <LanguageToggleButton />, // 모든 화면 헤더에 버튼
            }}
          >
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
      </ThemeProvider>
    </LanguageProvider>
  );
}
