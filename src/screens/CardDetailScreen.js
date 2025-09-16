import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, Alert } from "react-native";
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

  return (
    <View style={{ flex: 1 }}>
      {/* 🔹 고정된 상단바 */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={saveCard} style={styles.iconButton}>
          <Text style={styles.iconText}>💾 저장</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={deleteCard} style={styles.iconButton}>
          <Text style={[styles.iconText, { color: "red" }]}>🗑 삭제</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={hideSelection} style={styles.iconButton}>
          <Text style={styles.iconText}>🙈 드래그해서 숨기기</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 스크롤 가능한 본문 */}
      <ScrollView style={styles.container}>
        {/* Front */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Front</Text>
          <View style={styles.row}>
            <TouchableOpacity
              onPress={async () =>
                showAllHidden(frontRef, await frontRef.current?.getHtml())
              }
              style={styles.iconButton}
            >
              <Text style={styles.iconText}>👀 숨김처리한것 보이기</Text>
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
            <TouchableOpacity
              onPress={async () =>
                showAllHidden(backRef, await backRef.current?.getHtml())
              }
              style={styles.iconButton}
            >
              <Text style={styles.iconText}>👀 숨김처리한것 보이기</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 10,
    backgroundColor: "#ddd",
    borderBottomWidth: 1,
    borderBottomColor: "#bbb",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
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
