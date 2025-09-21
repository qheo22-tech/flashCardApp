// utils/fileManager.js
import RNFS from "react-native-fs";
import Share from "react-native-share";
import DocumentPicker, { types } from "react-native-document-picker";

/**
 * 📤 덱 내보내기 (.json 확장자)
 */
export const exportData = async (data, filename = "flashcards_backup") => {
  try {
    const path = `${RNFS.CachesDirectoryPath}/${filename}.json`;
    await RNFS.writeFile(path, JSON.stringify(data, null, 2), "utf8");

    await Share.open({
      urls: [`file://${path}`],
      type: "application/json", // ✅ JSON MIME 타입
      failOnCancel: false,
    });
  } catch (err) {
    console.error("❌ Export 실패:", err);
  }
};

/**
 * 📂 덱 불러오기 (json 파일만 허용)
 */
export const importData = async () => {
  try {
    const result = await DocumentPicker.pickSingle({
      type: ["application/json"], // ✅ json만 선택 (일부 안드로이드 기기는 무시할 수도 있음)
    });

    // ✅ 확장자 검사 (안드로이드 대비)
    if (!result.name.toLowerCase().endsWith(".json")) {
      alert("⚠️ JSON 파일만 선택할 수 있습니다.");
      return null;
    }

    let filePath = result.uri;
    if (filePath.startsWith("content://")) {
      const destPath = `${RNFS.TemporaryDirectoryPath}/import.json`;
      await RNFS.copyFile(filePath, destPath);
      filePath = destPath;
    }

    const fileContent = await RNFS.readFile(filePath, "utf8");
    return JSON.parse(fileContent);
  } catch (err) {
    if (!DocumentPicker.isCancel(err)) {
      console.error("❌ Import 실패:", err);
      alert("❌ JSON 파일 불러오기 실패");
    }
    return null;
  }
};
