// AddCardScreen.js
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
import { ThemeContext } from "../contexts/ThemeContext"; // ✅ 테마 컨텍스트 임포트

export default function AddCardScreen({ navigation, decks, setDecks, route }) {
  const { deckId } = route.params;

  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  // ✅ 전역 테마 색상 가져오기
  const colors = useContext(ThemeContext);

  // 새 카드 저장
  const saveNewCard = async () => {
    try {
      const frontHtml = await frontRef.current?.getHtml();
      const backHtml = await backRef.current?.getHtml();

      if (!frontHtml?.trim() || !backHtml?.trim()) {
        Alert.alert("Error", "Front and Back cannot be empty!");
        return;
      }

      const newCard = {
        id: Date.now().toString(),
        front: frontHtml,
        back: backHtml,
        attempts: 0,
        correct: 0,
        wrong: 0,
      };

      const updatedDecks = decks.map((deck) =>
        deck.id === deckId ? { ...deck, cards: [...deck.cards, newCard] } : deck
      );

      setDecks(updatedDecks);
      await AsyncStorage.setItem("decks", JSON.stringify(updatedDecks));
      navigation.goBack();
    } catch (e) {
      console.warn("카드 추가 실패:", e);
    }
  };

  // 드래그 영역 숨기기
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

  // 전체 숨김 해제
  const showAllHidden = async (editorRef, html) => {
    try {
      if (!html) return;
      const plainText = html.replace(/<[^>]+>/g, "");
      await editorRef.current?.setContents([{ insert: plainText }]);
    } catch (e) {
      console.warn("숨김 해제 실패:", e);
    }
  };

  // ✅ ThemeContext 기반 에디터 스타일
  const editorCustomStyle = `
    .ql-editor {
      color: ${colors.text} !important; /* ✅ 전역 text 색상 */
      background-color: ${colors.card} !important; /* ✅ 카드 배경색 */
      font-weight: bold !important; /* ✅ 다크모드에서 가독성 확보 */
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
      {/* 상단바 */}
      <View style={[styles.topRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={saveNewCard} style={styles.iconButton}>
          <Text style={[styles.iconText, { color: colors.text }]}>💾 저장</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={hideSelection} style={styles.iconButton}>
          <Text style={[styles.iconText, { color: colors.text }]}>🙈 드래그해서 숨기기</Text>
        </TouchableOpacity>
      </View>

      {/* 본문 */}
      <ScrollView style={styles.container}>
        {/* Front */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Front</Text>
          <TouchableOpacity
            onPress={async () =>
              showAllHidden(frontRef, await frontRef.current?.getHtml())
            }
            style={styles.iconButton}
          >
            <Text style={[styles.iconText, { color: colors.accent }]}>👀 숨김처리한것 보이기</Text>
          </TouchableOpacity>
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
          <TouchableOpacity
            onPress={async () =>
              showAllHidden(backRef, await backRef.current?.getHtml())
            }
            style={styles.iconButton}
          >
            <Text style={[styles.iconText, { color: colors.accent }]}>👀 숨김처리한것 보이기</Text>
          </TouchableOpacity>
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
  container: { flex: 1 },
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
  iconButton: { marginLeft: 10, padding: 5 },
  iconText: { fontSize: 14 },
    editor: {
      minHeight: 100,       // ✅ 최소 높이
      maxHeight: 180,       // ✅ 너무 길어지지 않게 제한
      borderRadius: 8,
      margin: 10,
      padding: 10,
    },
});
