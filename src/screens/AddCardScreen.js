// AddCardScreen.js
import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QuillEditor, { QuillToolbar } from "react-native-cn-quill";

export default function AddCardScreen({ navigation, decks, setDecks, route }) {
  const { deckId } = route.params;

  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

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

  return (
    <View style={{ flex: 1 }}>
      {/* 상단바 */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={saveNewCard} style={styles.iconButton}>
          <Text style={styles.iconText}>💾 저장</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={hideSelection} style={styles.iconButton}>
          <Text style={styles.iconText}>🙈 드래그해서 숨기기</Text>
        </TouchableOpacity>
      </View>

      {/* 본문 */}
      <ScrollView style={styles.container}>
        {/* Front */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Front</Text>
          <TouchableOpacity
            onPress={async () =>
              showAllHidden(frontRef, await frontRef.current?.getHtml())
            }
            style={styles.iconButton}
          >
            <Text style={styles.iconText}>👀 숨김처리한것 보이기</Text>
          </TouchableOpacity>
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
          <TouchableOpacity
            onPress={async () =>
              showAllHidden(backRef, await backRef.current?.getHtml())
            }
            style={styles.iconButton}
          >
            <Text style={styles.iconText}>👀 숨김처리한것 보이기</Text>
          </TouchableOpacity>
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
