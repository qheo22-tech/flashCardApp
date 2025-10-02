import React, { useRef, useState, useContext, useMemo, useCallback } from "react";
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
import KeywordModal from "../components/modals/KeywordModal";

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
  const [keywords, setKeywords] = useState(card.keywords || []); // 카드별 키워드

  const [keywordModalVisible, setKeywordModalVisible] = useState(false);

  // ✅ 모든 카드의 키워드 풀 (전역 키워드 목록)
  const initialAllKeywords = useMemo(
    () => [...new Set(decks.flatMap((d) => d.cards.flatMap((c) => c.keywords || [])))],
    [decks]
  );
  const [allKeywords, setAllKeywords] = useState(initialAllKeywords);

  const colors = useContext(ThemeContext);

  // 키워드 추가 (전역 풀 업데이트)
  const handleAddKeyword = useCallback((kw) => {
    setAllKeywords((prev) => [...new Set([...prev, kw])]);
  }, []);

  // 키워드 삭제 (전역 + 모든 카드에서 제거)
  const handleDeleteKeyword = useCallback(
    (kw) => {
      // 전역 풀에서 제거
      setAllKeywords((prev) => prev.filter((k) => k !== kw));

      // 모든 카드에서 제거
      const updatedDecks = decks.map((d) => ({
        ...d,
        cards: d.cards.map((c) => ({
          ...c,
          keywords: (c.keywords || []).filter((k) => k !== kw),
        })),
      }));
      setDecks(updatedDecks);

      // 현재 카드 state에도 즉시 반영
      setKeywords((prev) => prev.filter((k) => k !== kw));

      // 스토리지 반영
      AsyncStorage.setItem("decks", JSON.stringify(updatedDecks)).catch((e) =>
        console.warn("키워드 삭제 반영 실패:", e)
      );
    },
    [decks, setDecks]
  );

  // 숨김처리 해제
  const showAllHidden = async (editorRef, html) => {
    try {
      if (!html) return;
      const plainText = html.replace(/<[^>]+>/g, "");
      await editorRef.current?.setContents([{ insert: plainText }]);
    } catch (e) {
      console.warn("숨김처리 실패:", e);
    }
  };

  // 카드 저장
  const saveCard = async () => {
    try {
      const frontHtml = await frontRef.current?.getHtml();
      const backHtml = await backRef.current?.getHtml();

      const updatedDecks = decks.map((d) =>
        d.id === deckId
          ? {
              ...d,
              cards: d.cards.map((c) =>
                c.id === cardId
                  ? { ...c, front: frontHtml, back: backHtml, keywords }
                  : c
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

  // 선택 텍스트 숨기기
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
        <TouchableOpacity onPress={saveCard} style={styles.iconButton}>
          <Text style={[styles.iconText, { color: colors.text }]}>💾 저장</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={deleteCard} style={styles.iconButton}>
          <Text style={[styles.iconText, { color: "red" }]}>🗑 삭제</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={hideSelection} style={styles.iconButton}>
          <Text style={[styles.iconText, { color: colors.text }]}>🙈 숨기기</Text>
        </TouchableOpacity>
      </View>

      {/* 본문 */}
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {/* Front */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Front</Text>
          <TouchableOpacity
            onPress={async () =>
              showAllHidden(frontRef, await frontRef.current?.getHtml())
            }
            style={styles.iconButton}
          >
            <Text style={[styles.iconText, { color: colors.accent }]}>👀 보이기</Text>
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
            <Text style={[styles.iconText, { color: colors.accent }]}>👀 보이기</Text>
          </TouchableOpacity>
        </View>
        <QuillEditor
          style={[styles.editor, { backgroundColor: colors.card }]}
          ref={backRef}
          initialHtml={back}
          customStyles={[editorCustomStyle]}
        />
        <QuillToolbar editor={backRef} options="full" theme="light" />

        {/* Keywords */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Keywords</Text>
          <TouchableOpacity
            onPress={() => setKeywordModalVisible(true)}
            style={styles.iconButton}
          >
            <Text style={[styles.iconText, { color: colors.accent }]}>➕</Text>
          </TouchableOpacity>
        </View>

        {/* 등록된 키워드 */}
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
                onPress={() => {
                  setKeywords((prev) => prev.filter((k) => k !== kw));
                }}
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
          // 카드에는 선택된 키워드만 저장
          setKeywords(selected);

          // 전역 풀은 그대로 유지 (allKeywords 건드리지 않음)
          // 🔑 중요: 체크 해제는 전역 키워드 삭제가 아님
          setKeywordModalVisible(false);
        }}
        onAddKeyword={handleAddKeyword}   // 새 키워드 추가 시 전역 풀 갱신
        onDeleteKeyword={handleDeleteKeyword} // 삭제 버튼 눌렀을 때만 전역 풀에서 제거
        allKeywords={allKeywords}
        selectedKeywords={keywords}
        colors={colors}
      />

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
  iconButton: { marginLeft: 10, padding: 5 },
  iconText: { fontSize: 14 },
  editor: {
    height: 160,
    borderRadius: 8,
    margin: 10,
    padding: 10,
  },
  keywordList: { flexDirection: "row", flexWrap: "wrap", margin: 10 },
  keywordChip: {
    flexDirection: "row",
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
