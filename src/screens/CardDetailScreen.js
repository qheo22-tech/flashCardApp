// CardDetailScreen.js
import React, { useRef, useState, useContext } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QuillEditor, { QuillToolbar } from "react-native-cn-quill";
import { ThemeContext } from "../contexts/ThemeContext"; // ✅ 테마 컨텍스트 가져오기

export default function CardDetailScreen({ navigation, decks, setDecks, route }) {
  const { deckId, cardId } = route.params || {};
  if (!deckId || !cardId) return <Text>Invalid route parameters</Text>;

  const deck = decks.find((d) => d.id === deckId);
  const card = deck?.cards.find((c) => c.id === cardId);
  if (!card) return <Text>Card not found</Text>;

  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [front, setFront] = useState(card.front || "");
  const [back, setBack] = useState(card.back || "");

  // ✅ 전역 색상 가져오기
  const colors = useContext(ThemeContext);

  // 전체 숨김처리한것 보이기
  const showAllHidden = async (editorRef, html) => {
    try {
      if (!html) return;
      const plainText = html.replace(/<[^>]+>/g, "");
      await editorRef.current?.setContents([{ insert: plainText }]);
    } catch (e) {
      console.warn("숨김처리한것 보이기 실패:", e);
    }
  };

  // 저장
  const saveCard = async () => {
    try {
      const frontHtml = await frontRef.current?.getHtml();
      const backHtml = await backRef.current?.getHtml();

      const updatedDecks = decks.map((d) =>
        d.id === deckId
          ? {
              ...d,
              cards: d.cards.map((c) =>
                c.id === cardId ? { ...c, front: frontHtml, back: backHtml } : c
              ),
            }
          : d
      );

      setDecks(updatedDecks);
      await AsyncStorage.setItem("decks", JSON.stringify(updatedDecks));
      navigation.goBack();
    } catch (e) {
      console.warn("저장 실패:", e);
    }
  };

  // 카드 삭제
  const deleteCard = async () => {
    Alert.alert("삭제", "이 카드를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "확인",
        style: "destructive",
        onPress: async () => {
          try {
            const updatedDecks = decks.map((d) =>
              d.id === deckId
                ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) }
                : d
            );
            setDecks(updatedDecks);
            await AsyncStorage.setItem("decks", JSON.stringify(updatedDecks));
            navigation.goBack();
          } catch (e) {
            console.warn("삭제 실패:", e);
          }
        },
      },
    ]);
  };

  // 숨기기 버튼 (front → back 순서로 검사)
  const hideSelection = async () => {
    try {
      let range = await frontRef.current?.getSelection();
      let targetRef = frontRef;

      if (!range || range.length === 0) {
        range = await backRef.current?.getSelection();
        targetRef = backRef;
      }

      if (range && range.length > 0) {
        targetRef.current?.formatText(range.index, range.length, {
          color: "transparent",
          background: "black",
          class: "hidden-text",
        });
      }
    } catch (e) {
      console.warn("숨기기 실패:", e);
    }
  };

  // ✅ 전역 테마 기반 Quill 스타일
  const editorCustomStyle = `
    .ql-editor {
      color: ${colors.text} !important;
      background-color: ${colors.card} !important;
      font-weight: bold !important;
    }
    .ql-editor .hidden-text {
      color: transparent !important;
      background-color: black !important;
    }
    .ql-editor .hidden-text::selection {
      color: black !important;
      background-color: yellow !important;
    }
  `;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* 🔹 고정된 상단바 */}
      <View style={[styles.topRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={saveCard} style={styles.iconButton}>
          <Text style={[styles.iconText, { color: colors.text }]}>💾 저장</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={deleteCard} style={styles.iconButton}>
          <Text style={[styles.iconText, { color: "red" }]}>🗑 삭제</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={hideSelection} style={styles.iconButton}>
          <Text style={[styles.iconText, { color: colors.text }]}>🙈 드래그해서 숨기기</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 스크롤 가능한 본문 */}
      <ScrollView style={{ flex: 1 }}>
        {/* Front */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Front</Text>
          <View style={styles.row}>
            <TouchableOpacity
              onPress={async () =>
                showAllHidden(frontRef, await frontRef.current?.getHtml())
              }
              style={styles.iconButton}
            >
              <Text style={[styles.iconText, { color: colors.accent }]}>
                👀 숨김처리한것 보이기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <QuillEditor
          style={[styles.editor, { backgroundColor: colors.card }]}
          ref={frontRef}
          initialHtml={front}
          customStyles={[editorCustomStyle]}
        />
        <QuillToolbar editor={frontRef} options="full" theme="light" />

        {/* Back */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Back</Text>
          <View style={styles.row}>
            <TouchableOpacity
              onPress={async () =>
                showAllHidden(backRef, await backRef.current?.getHtml())
              }
              style={styles.iconButton}
            >
              <Text style={[styles.iconText, { color: colors.accent }]}>
                👀 숨김처리한것 보이기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <QuillEditor
          style={[styles.editor, { backgroundColor: colors.card }]}
          ref={backRef}
          initialHtml={back}
          customStyles={[editorCustomStyle]}
        />
        <QuillToolbar editor={backRef} options="full" theme="light" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 10,
    borderBottomWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    marginTop: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  row: { flexDirection: "row" },
  iconButton: { marginLeft: 10, padding: 5 },
  iconText: { fontSize: 14 },
  editor: {
    height: 160, // ✅ AddCard처럼 크기 줄여서 편하게 입력 가능
    borderRadius: 8,
    margin: 10,
    padding: 10,
  },
});
