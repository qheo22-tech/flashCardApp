// src/styles/modalCommon.js
import { StyleSheet } from "react-native";

const modalCommon = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // 반투명 배경
  },
  container: {
    width: "80%",
    padding: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    alignItems: "center",
    borderRadius: 6,
  },
});

export default modalCommon;
