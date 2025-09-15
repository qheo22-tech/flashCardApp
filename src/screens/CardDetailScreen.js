import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QuillEditor, { QuillToolbar } from "react-native-cn-quill";

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

  // 특정 영역 숨기기
  const hideSelection = async (editorRef) => {
    try {
      const range = await editorRef.current?.getSelection();
      if (!range || range.length === 0) return;
      editorRef.current?.formatText(range.index, range.length, {
        color: "transparent",
        background: "black",
        class: "hidden-text",
      });
    } catch (e) {
      console.warn("숨기기 실패:", e);
    }
  };

  // 전체 보이기 (plain text 변환 → 저장 X)
  const showAllHidden = async (editorRef, html) => {
    try {
      if (!html) return;
      const plainText = html.replace(/<[^>]+>/g, "");
      await editorRef.current?.setContents([{ insert: plainText }]);
    } catch (e) {
      console.warn("보이기 실패:", e);
    }
  };

  // 저장 실행 (숨김 태그 포함)
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

  return (
    <ScrollView style={styles.container}>
      {/* 상단 저장 버튼 */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={saveCard} style={styles.iconButton}>
          <Text style={styles.iconText}>💾 저장</Text>
        </TouchableOpacity>
      </View>

      {/* Front */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Front</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => hideSelection(frontRef)} style={styles.iconButton}>
            <Text style={styles.iconText}>🙈 숨기기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => showAllHidden(frontRef, await frontRef.current?.getHtml())}
            style={styles.iconButton}
          >
            <Text style={styles.iconText}>👀 보이기</Text>
          </TouchableOpacity>
        </View>
      </View>
      <QuillEditor
        style={styles.editor}
        ref={frontRef}
        initialHtml={front}
        customStyles={[
          `
          .ql-editor .hidden-text {
            color: transparent !important;
            background-color: black !important;
          }
          .ql-editor .hidden-text::selection {
            color: black !important;
            background-color: yellow !important;
          }
        `,
        ]}
      />
      <QuillToolbar editor={frontRef} options="full" theme="light" />

      {/* Back */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Back</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => hideSelection(backRef)} style={styles.iconButton}>
            <Text style={styles.iconText}>🙈 숨기기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => showAllHidden(backRef, await backRef.current?.getHtml())}
            style={styles.iconButton}
          >
            <Text style={styles.iconText}>👀 보이기</Text>
          </TouchableOpacity>
        </View>
      </View>
      <QuillEditor
        style={styles.editor}
        ref={backRef}
        initialHtml={back}
        customStyles={[
          `
          .ql-editor .hidden-text {
            color: transparent !important;
            background-color: black !important;
          }
          .ql-editor .hidden-text::selection {
            color: black !important;
            background-color: yellow !important;
          }
        `,
        ]}
      />
      <QuillToolbar editor={backRef} options="full" theme="light" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 10,
    backgroundColor: "#ddd",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between", // 제목 왼쪽 / 버튼 오른쪽
    alignItems: "center",
    marginHorizontal: 10,
    marginTop: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "black" },
  row: { flexDirection: "row" },
  iconButton: { marginLeft: 10, padding: 5 },
  iconText: { fontSize: 14 },
  editor: {
    height: 200,
    backgroundColor: "white",
    borderRadius: 8,
    margin: 10,
    padding: 10,
  },
});
