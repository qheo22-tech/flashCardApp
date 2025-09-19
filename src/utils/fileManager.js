import RNFS from "react-native-fs";
import Share from "react-native-share";
import DocumentPicker from "@react-native-documents/picker";
import { Platform } from "react-native";


/**
 * 공유하기 (Share Sheet 열기)
 */
export const exportData = async (data) => {
  try {
    const path = `${RNFS.CachesDirectoryPath}/flashcards_backup.json`;
    await RNFS.writeFile(path, JSON.stringify(data, null, 2), "utf8");

    await Share.open({
      urls: [`file://${path}`],
      type: "text/plain", // 더 많은 앱에 표시
      failOnCancel: false,
    });
  } catch (err) {
    console.error("❌ Export 실패:", err);
  }
};

/**
 * 파일 선택 후 불러오기
 */
export const importData = async () => {
  try {
    const result = await DocumentPicker.pickSingle({
      type: [DocumentPicker.types.allFiles],
    });

    let filePath = result.uri;
    if (filePath.startsWith("content://")) {
      const destPath = `${RNFS.TemporaryDirectoryPath}/import.json`;
      await RNFS.copyFile(filePath, destPath);
      filePath = destPath;
    }

    const fileContent = await RNFS.readFile(filePath, "utf8");
    return JSON.parse(fileContent);
  } catch (err) {
    if (!DocumentPicker.isCancel(err)) console.error("❌ Import 실패:", err);
    return null;
  }
};
