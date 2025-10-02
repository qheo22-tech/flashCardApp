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
import { ThemeContext } from "../contexts/ThemeContext";
import KeywordModal from "../components/modals/KeywordModal"; // ✅ 키워드 모달 불러오기

export default function AddCardScreen({ navigation, decks, setDecks, route }) {
  const { deckId } = route.params;

  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [keywords, setKeywords] = useState([]);

  // ✅ 모달 상태
  const [keywordModalVisible, setKeywordModalVisible] = useState(false);

  // ✅ 모든 카드의 키워드 모음 (전역 키워드 풀)
  const allKeywords = [
    ...new Set(decks.flatMap((d) => d.cards.flatMap((c) => c.keywords || []))),
  ];

  const colors = useContext(ThemeContext);
// HTML 태그 제거 후 텍스트만 추출하는 함수
const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim(); 
};

// 새 카드 저장
const saveNewCard = async () => {
  try {
    const frontHtml = await frontRef.current?.getHtml();
    const backHtml = await backRef.current?.getHtml();

    const frontText = stripHtml(frontHtml);
    const backText = stripHtml(backHtml);

    if (!frontText && !backText) {
      Alert.alert("알림", "앞면과 뒷면에 내용을 입력하세요.");
      return;
    }
    if (!frontText) {
      Alert.alert("알림", "앞면에 내용을 입력하세요.");
      return;
    }
    if (!backText) {
      Alert.alert("알림", "뒷면에 내용을 입력하세요.");
      return;
    }

    const newCard = {
      id: Date.now().toString(),
      front: frontHtml,
      back: backHtml,
      keywords,
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

  // 에디터 스타일
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
      {/* 상단바 */}
      <View
        style={[
          styles.topRow,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={saveNewCard} style={styles.iconButton}>
          <Text style={[styles.iconText, { color: colors.text }]}>💾 저장</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={hideSelection} style={styles.iconButton}>
          <Text style={[styles.iconText, { color: colors.text }]}>
            🙈 드래그해서 숨기기
          </Text>
        </TouchableOpacity>
      </View>

      {/* 본문 */}
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Front */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Front</Text>
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
            <Text style={[styles.iconText, { color: colors.accent }]}>
              👀 숨김처리한것 보이기
            </Text>
          </TouchableOpacity>
        </View>
        <QuillEditor
          style={[styles.editor, { backgroundColor: colors.card }]}
          ref={backRef}
          initialHtml={back}
          customStyles={[editorCustomStyle]}
        />
        <QuillToolbar editor={backRef} options="full" theme="light" />

        {/* ✅ Keywords */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Keywords
          </Text>
          <TouchableOpacity
            onPress={() => setKeywordModalVisible(true)}
            style={styles.iconButton}
          >
            <Text style={[styles.iconText, { color: colors.accent }]}>➕</Text>
          </TouchableOpacity>
        </View>

        {/* 등록된 키워드 리스트 */}
        <View style={styles.keywordList}>
          {keywords.map((kw, idx) => (
            <View
              key={idx}
              style={[
                styles.keywordChip,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={{ color: colors.text, fontSize: 12 }}>#{kw}</Text>
              <TouchableOpacity
                onPress={() =>
                  setKeywords((prev) => prev.filter((k) => k !== kw))
                }
                style={styles.removeButton}
              >
                <Text style={{ color: "red", fontSize: 12 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ✅ 키워드 모달 */}
      <KeywordModal
        visible={keywordModalVisible}
        onClose={() => setKeywordModalVisible(false)}
        onConfirm={(selected) => {
          setKeywords(selected);
          setKeywordModalVisible(false);
        }}
        allKeywords={allKeywords}
        selectedKeywords={keywords}
        colors={colors}
      />
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
    minHeight: 100,
    maxHeight: 180,
    borderRadius: 8,
    margin: 10,
    padding: 10,
  },
  keywordList: { flexDirection: "row", flexWrap: "wrap", margin: 10 },
  keywordChip: {
    flexDirection: "row", // 👉 텍스트와 X를 가로 정렬
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    marginRight: 5,
    marginBottom: 5,
  },
  removeButton: {
    marginLeft: 6,
  },
});
