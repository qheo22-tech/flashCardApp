// src/components/modals/KeywordQuizModal.js
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function KeywordQuizModal({
  visible,
  onClose,
  onConfirm,
  allKeywords,
  selectedKeywords,
  setSelectedKeywords,
  colors,
  isDarkMode,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackground}>
        <View style={[styles.modalContainer, { backgroundColor: "#fff" }]}>
          <Text style={[styles.modalTitle, { color: isDarkMode ? "#000" : colors.text }]}>
            문제풀기 키워드를 선택하세요
          </Text>

          <ScrollView
            contentContainerStyle={styles.keywordContainer}
            keyboardShouldPersistTaps="handled"
          >
            {allKeywords.length === 0 ? (
              <Text style={{ color: colors.placeholder }}>
                등록된 키워드가 없습니다.
              </Text>
            ) : (
              allKeywords.map((kw) => {
                const selected = selectedKeywords.includes(kw);
                return (
                  <TouchableOpacity
                    key={kw}
                    onPress={() =>
                      setSelectedKeywords((prev) =>
                        prev.includes(kw)
                          ? prev.filter((k) => k !== kw)
                          : [...prev, kw]
                      )
                    }
                    style={[
                      styles.keywordRow,
                      {
                        backgroundColor: selected ? colors.accent : colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={{ color: selected ? "#fff" : colors.text, fontWeight: "bold" }}>
                      #{kw}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* 버튼 영역 */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: isDarkMode ? "#444" : "#ddd" }]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.accent }]}
              onPress={onConfirm}
            >
              <Text style={styles.modalButtonText}>문제풀기 시작</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  keywordContainer: {
    marginVertical: 10,
  },
  keywordRow: {
    width: "100%",            // ✅ 한 줄에 하나씩
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,          // ✅ 줄 간격
    alignItems: "center",     // 텍스트 중앙정렬
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
    gap: 10,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
