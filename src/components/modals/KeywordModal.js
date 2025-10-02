// src/components/modals/KeywordModal.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NewKeywordModal from "./NewKeywordModal";

export default function KeywordModal({
  visible,
  onClose,
  onConfirm,
  selectedKeywords = [],
  colors,
}) {
  const [tempSelected, setTempSelected] = useState([]);
  const [allKeywords, setAllKeywords] = useState([]); // 전역 키워드 풀
  const [showNewKeywordModal, setShowNewKeywordModal] = useState(false);

  // 🔹 전역 키워드 불러오기
  const loadKeywords = async () => {
    try {
      const stored = await AsyncStorage.getItem("keywords");
      const parsed = stored ? JSON.parse(stored) : [];
      setAllKeywords(parsed);
    } catch (e) {
      console.warn("전역 키워드 불러오기 실패:", e);
    }
  };

  // 🔹 전역 키워드 저장
  const saveKeywords = async (keywords) => {
    try {
      await AsyncStorage.setItem("keywords", JSON.stringify(keywords));
      setAllKeywords(keywords);
    } catch (e) {
      console.warn("전역 키워드 저장 실패:", e);
    }
  };

  // 모달 열릴 때 상태 동기화
  useEffect(() => {
    if (visible) {
      setTempSelected(selectedKeywords || []);
      loadKeywords(); // 전역 키워드 풀 로드
    }
  }, [visible, selectedKeywords]);

  // 키워드 선택/해제 (카드에만 반영됨 → onConfirm에서 처리)
  const toggleKeyword = (kw) => {
    setTempSelected((prev) =>
      prev.includes(kw) ? prev.filter((x) => x !== kw) : [...prev, kw]
    );
  };

  // 전역 키워드 삭제
  const handleDeleteKeyword = (kw) => {
    Alert.alert(
      "키워드 삭제",
      `"${kw}" 키워드를 삭제하시겠습니까?\n모든 카드에서 제거됩니다.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            const updated = allKeywords.filter((x) => x !== kw);
            await saveKeywords(updated);
            setTempSelected((prev) => prev.filter((x) => x !== kw));
            // ❗ 부모에서 카드 keywords 배열에서도 제거되도록 onConfirm 쪽에서 처리 필요
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackground}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            키워드 선택/추가
          </Text>

          {/* 🔹 키워드 리스트 */}
          <ScrollView style={{ maxHeight: 200 }}>
            {allKeywords.length === 0 && (
              <Text style={{ color: colors.placeholder }}>
                저장된 키워드가 없습니다.
              </Text>
            )}
            {allKeywords.map((kw, idx) => {
              const selected = tempSelected.includes(kw);
              return (
                <View
                  key={idx}
                  style={[
                    styles.keywordRow,
                    { borderColor: colors.border, backgroundColor: colors.card },
                  ]}
                >
                  {/* 선택/해제 */}
                  <TouchableOpacity
                    onPress={() => toggleKeyword(kw)}
                    style={[
                      styles.keywordChip,
                      {
                        backgroundColor: selected ? colors.accent : colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={{ color: selected ? "#fff" : colors.text }}>
                      {selected ? "✅ " : ""}#{kw}
                    </Text>
                  </TouchableOpacity>

                  {/* 전역 삭제 버튼 */}
                  <TouchableOpacity
                    onPress={() => handleDeleteKeyword(kw)}
                    style={styles.deleteButton}
                  >
                    <Text style={{ color: "red", fontSize: 14 }}>❌</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          {/* 새 키워드 추가 버튼 */}
          <TouchableOpacity
            onPress={() => setShowNewKeywordModal(true)}
            style={[styles.addKeywordButton, { borderColor: colors.border }]}
          >
            <Text style={{ color: colors.accent }}>➕ 새 키워드 추가</Text>
          </TouchableOpacity>

          {/* 확인/취소 버튼 */}
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onClose} style={styles.modalButton}>
              <Text style={{ color: colors.text }}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onConfirm([...new Set(tempSelected)]);
                onClose();
              }}
              style={[styles.modalButton, { backgroundColor: colors.accent }]}
            >
              <Text style={{ color: "#fff" }}>확인</Text>
            </TouchableOpacity>
          </View>

          {/* 새 키워드 추가 모달 */}
          <NewKeywordModal
            visible={showNewKeywordModal}
            onClose={() => setShowNewKeywordModal(false)}
            onAdd={async (kw) => {
              const updated = [...new Set([...allKeywords, kw])];
              await saveKeywords(updated);
              setTempSelected((prev) => [...new Set([...prev, kw])]);
              setShowNewKeywordModal(false);
            }}
            colors={colors}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },

  keywordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "space-between",
  },
  keywordChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    flex: 1,
  },
  deleteButton: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  addKeywordButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  modalButton: { padding: 10, marginLeft: 10, borderRadius: 6 },
});
