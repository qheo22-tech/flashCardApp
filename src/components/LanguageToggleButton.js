import React, { useContext } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LanguageContext } from "../contexts/LanguageContext";

export default function LanguageToggleButton() {
  const { language, setLanguage } = useContext(LanguageContext);

  const toggleLanguage = () => {
    setLanguage(language === "kr" ? "en" : "kr");
  };

  return (
    <TouchableOpacity style={styles.button} onPress={toggleLanguage}>
      <Text style={styles.text}>{language === "kr" ? "English" : "한국어"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    // 배경 필요하면 아래 주석 해제
    // backgroundColor: "white",
    borderRadius: 5,
  },
  text: {
    color: "black", // 검정색 텍스트
    fontSize: 16,
    fontWeight: "bold",
  },
});
