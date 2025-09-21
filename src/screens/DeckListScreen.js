// src/screens/DeckListScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { ThemeContext } from "../contexts/ThemeContext";
import { LanguageContext } from "../contexts/LanguageContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { exportData, importData, testPick } from "../utils/fileManager"; // ✅ 파일매니저에서 불러오기

export default function DeckListScreen({ navigation, decks, setDecks }) {
  const colors = useContext(ThemeContext);
  const { strings } = useContext(LanguageContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // 모드: "none" | "delete" | "share"
  const [mode, setMode] = useState("none");
  const [selectedDecks, setSelectedDecks] = useState([]);
  const [deleteDeckModalVisible, setDeleteDeckModalVisible] = useState(false);

  /**
   * ✅ 권한 요청 함수 (안드로이드 전용)
   */
  const requestStoragePermission = async () => {
    if (Platform.OS !== "android") return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES, // Android 13+
      {
        title: "저장소 권한",
        message: "덱 파일을 가져오기 위해 저장소 접근 권한이 필요합니다.",
        buttonPositive: "확인",
        buttonNegative: "취소",
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

/**
 * 내보내기 (전체 / 선택 덱)
 */
const handleExport = async () => {
  if (mode === "share") {
    if (selectedDecks.length === 0) {
      alert("선택된 덱이 없습니다.");
      return;
    }

    const filtered = decks.filter((d) => selectedDecks.includes(d.id));

    if (filtered.length === 1) {
      // ✅ 덱이 1개 → 덱 이름으로 저장
      await exportData(filtered, filtered[0].title);
    } else {
      // ✅ 덱이 여러 개 → 첫 번째 덱 + 외 N개
      const firstName = filtered[0].title;
      const fileName = `${firstName}_외${filtered.length - 1}개`;
      await exportData(filtered, fileName);
    }

    closeMode();
  } else {
    // ✅ 전체 덱 내보내기 (기본 이름)
    await exportData(decks, "flashcards_backup");
  }
};


/**
 * 불러오기 (덱 추가)
 */
const handleImport = async () => {
  const hasPermission = await requestStoragePermission();
  if (!hasPermission) {
    alert("저장소 접근 권한이 필요합니다.");
    return;
  }

  const imported = await importData();
  console.log("📂 불러온 데이터:", imported);

  if (imported) {
    // ✅ 배열이 아니면 배열로 감싸주기
    const importedDecks = Array.isArray(imported) ? imported : [imported];

    setDecks((prev) => {
      const merged = [...prev, ...importedDecks];
      // id 중복 제거
      const unique = merged.filter(
        (deck, index, self) =>
          index === self.findIndex((d) => d.id === deck.id)
      );
      console.log("📂 최종 저장:", unique);
      return unique;
    });
  } else {
    alert("불러온 덱이 없습니다.");
  }
};


  /**
   * 🧪 테스트용 파일 선택 (JSON 내용 콘솔 출력만 함)
   */
  const handleTestPick = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      alert("저장소 접근 권한이 필요합니다.");
      return;
    }

    const picked = await testPick();
    console.log("🧪 testPick 결과:", picked);
  };

  /**
   * 🗑 덱 삭제 실행
   */
  const handleConfirmDeleteDecks = () => {
    if (selectedDecks.length === 0) {
      alert("삭제할 덱을 선택하세요.");
      return;
    }
    const updated = decks.filter((d) => !selectedDecks.includes(d.id));
    setDecks(updated);
    closeMode();
    setDeleteDeckModalVisible(false);
  };

  // ➕ 덱 추가
  const addDeck = () => setModalVisible(true);
  const confirmAdd = () => {
    if (!newTitle.trim()) return;
    const newDeck = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      cards: [],
    };
    setDecks([...decks, newDeck]);
    setNewTitle("");
    setModalVisible(false);
  };
  const cancelAdd = () => {
    setNewTitle("");
    setModalVisible(false);
  };

  // 선택 모드 종료
  const closeMode = () => {
    setMode("none");
    setSelectedDecks([]);
  };

  // 덱 선택/해제
  const toggleSelectDeck = (deckId) => {
    setSelectedDecks((prev) =>
      prev.includes(deckId)
        ? prev.filter((id) => id !== deckId)
        : [...prev, deckId]
    );
  };

  // ✅ 다크모드 여부
  const isDarkMode = colors.background === "#000";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 상단 버튼 */}
      <View
  style={{
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
    alignItems: "center",
  }}
>
  {mode === "delete" ? (
    <>
      {/* 선택된 덱 삭제 */}
      <TouchableOpacity style={styles.iconButton} onPress={() => {
        if (selectedDecks.length === 0) {
          alert("삭제할 덱을 선택하세요.");
          return;
        }
        setDeleteDeckModalVisible(true);
      }}>
        <MaterialIcons name="delete" size={28} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconButton} onPress={closeMode}>
        <MaterialIcons name="close" size={28} color={colors.text} />
      </TouchableOpacity>
    </>
  ) : mode === "share" ? (
    <>
      {/* 선택된 덱 공유 */}
      <TouchableOpacity style={styles.iconButton} onPress={handleExport}>
        <MaterialIcons name="share" size={28} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconButton} onPress={closeMode}>
        <MaterialIcons name="close" size={28} color={colors.text} />
      </TouchableOpacity>
    </>
  ) : (
    <>
      {/* 덱 추가 */}
      <TouchableOpacity style={styles.iconButton} onPress={addDeck}>
        <MaterialIcons name="add" size={28} color={colors.text} />
      </TouchableOpacity>

      {/* 삭제 모드 진입 */}
      <TouchableOpacity style={styles.iconButton} onPress={() => setMode("delete")}>
        <MaterialIcons name="delete" size={28} color={colors.text} />
      </TouchableOpacity>

      {/* 공유 모드 진입 */}
      <TouchableOpacity style={styles.iconButton} onPress={() => setMode("share")}>
        <MaterialIcons name="share" size={28} color={colors.text} />
      </TouchableOpacity>

      {/* 불러오기 */}
      <TouchableOpacity style={styles.iconButton} onPress={handleImport}>
        <MaterialIcons name="folder-open" size={28} color={colors.text} />
      </TouchableOpacity>
    </>
  )}
</View>
      {/* 덱 리스트 */}
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedDecks.includes(item.id);
          return (
            <TouchableOpacity
              style={[
                styles.deckItem,
                { backgroundColor: colors.card, borderColor: colors.border },
                mode !== "none" && isSelected && { borderColor: "red", borderWidth: 2 },
              ]}
              onPress={() =>
                mode !== "none"
                  ? toggleSelectDeck(item.id)
                  : navigation.navigate("DeckDetail", { deckId: item.id })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.deckTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.cardCount, { color: colors.placeholder }]}>
                  {item.cards.length} {strings.cards}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* 덱 추가 모달 */}
      <DeckInputModal
        visible={modalVisible}
        title={newTitle}
        setTitle={setNewTitle}
        onConfirm={confirmAdd}
        onCancel={cancelAdd}
        strings={strings}
        isDarkMode={isDarkMode}
        colors={colors}
      />

      {/* 덱 삭제 모달 */}
      <Modal visible={deleteDeckModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: "#fff" }]}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? "#000" : colors.text }]}>
              {strings.deleteDeck}
            </Text>
            <Text style={{ marginBottom: 20, color: isDarkMode ? "#000" : colors.text }}>
              {strings.deleteConfirm || "선택한 덱을 삭제하시겠습니까?"}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDarkMode ? "#444" : "#ddd" }]}
                onPress={() => setDeleteDeckModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>{strings.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.accent }]}
                onPress={handleConfirmDeleteDecks}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>{strings.confirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* 🔹 덱 추가 모달 */
function DeckInputModal({ visible, title, setTitle, onConfirm, onCancel, strings, isDarkMode, colors }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalBox, { backgroundColor: "#fff" }]}>
          <Text style={[styles.modalTitle, { color: isDarkMode ? "#000" : colors.text }]}>{strings.newDeck}</Text>
          <TextInput
            style={[
              styles.modalInput,
              { color: isDarkMode ? "#000" : colors.text, borderColor: colors.border },
            ]}
            placeholder={strings.enterDeckTitle}
            placeholderTextColor={colors.placeholder}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: isDarkMode ? "#444" : "#ddd" }]}
              onPress={onCancel}
            >
              <Text style={[styles.modalButtonText, { color: "#fff" }]}>{strings.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.accent }]}
              onPress={onConfirm}
            >
              <Text style={[styles.modalButtonText, { color: "#fff" }]}>{strings.confirm}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* 스타일 */
const styles = StyleSheet.create({
   container: { flex: 1, padding: 20 },
  iconButton: {
    marginHorizontal: 5,   // 버튼 간격 일정하게
    padding: 6,            // 터치 영역 확대
    borderRadius: 6,
  },
  container: { flex: 1, padding: 20 },
  deckItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  deckTitle: { fontSize: 20, fontWeight: "bold" },
  cardCount: { fontSize: 14, marginTop: 5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    maxWidth: 400,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
