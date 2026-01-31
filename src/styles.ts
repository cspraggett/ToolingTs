// styles.ts
import { CSSProperties } from "react";

export const styles: Record<string, CSSProperties> = {
  container: {
    maxWidth: "360px",
    margin: "0 auto",
    padding: "1rem",
    textAlign: "center",
    fontFamily: "system-ui, sans-serif"
  },
  title: {
    marginBottom: "0.75rem"
  },
  input: {
    width: "100%",
    fontSize: "1.1rem",
    padding: "0.6rem",
    textAlign: "center",
    marginBottom: "0.75rem",
    boxSizing: "border-box"
  },
  helper: {
    opacity: 0.6
  },
  resultHeader: {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginTop: "1rem"
  },
  list: {
    listStyle: "none",
    padding: 0,
    marginTop: "0.75rem"
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.5rem 0.25rem",
    borderBottom: "1px solid #ddd",
    fontSize: "1.05rem"
  }
};