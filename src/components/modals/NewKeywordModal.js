// src/components/modals/NewKeywordModal.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NewKeywordModal({ visible, onClose, onAdd, colors }) {
  const [text, setText] = useState("");
  const [allKeywords, setAllKeywords] = useState([]);

  // 모달이 열릴 때 입력칸 초기화 + 전역 키워드 불러오기
  useEffect(() => {
    if (visible) {
      setText("");
      loadKeywords();
    }
  }, [visible]);

  const loadKeywords = async () => {
    try {
      const stored = await AsyncStorage.getItem("keywords");
      setAllKeywords(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.warn("키워드 불러오기 실패:", e);
      setAllKeywords([]);
    }
  };

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // 🔹 중복 검사
    if (allKeywords.includes(trimmed)) {
      Alert.alert("중복 키워드", `"${trimmed}" 키워드는 이미 존재합니다.`);
      return;
    }

    // 부모에 전달 (전역 + 선택 반영은 부모에서)
    onAdd(trimmed);

    // 입력창 초기화 및 닫기
    setText("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackground}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            새 키워드 추가
          </Text>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="키워드 입력"
            style={[
              styles.keywordInput,
              { color: colors.text, borderColor: colors.border },
            ]}
            placeholderTextColor={colors.placeholder}
            onSubmitEditing={handleAdd}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onClose} style={styles.modalButton}>
              <Text style={{ color: colors.text }}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAdd}
              style={[styles.modalButton, { backgroundColor: colors.accent }]}
            >
              <Text style={{ color: "#fff" }}>추가</Text>
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
  keywordInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginTop: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  modalButton: { padding: 10, marginLeft: 10, borderRadius: 6 },
});
