import { CSSProperties } from "react";

export const styles: Record<string, CSSProperties> = {
  // === LAYOUT ===
  container: {
    maxWidth: "360px",
    margin: "0 auto",
    padding: "1rem",
    textAlign: "center",
    fontFamily: "system-ui, sans-serif"
  },
  flexRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px"
  },

  // === TYPOGRAPHY ===
  title: {
    marginBottom: "0.75rem"
  },
  helper: {
    opacity: 0.6
  },
  sectionTitle: {
    borderBottom: "2px solid #eee",
    paddingBottom: "0.5rem",
    marginTop: "2rem", // Spacing between male/female results
    textAlign: "left"
  },

  // === INPUTS ===
  input: {
    width: "100%",
    fontSize: "1.1rem",
    padding: "0.6rem",
    textAlign: "center",
    marginBottom: "0.75rem",
    boxSizing: "border-box"
  },
  // Small label for the +/- inputs
  label: {
    display: "block",
    fontSize: "0.8rem",
    color: "#666",
    textAlign: "left",
    marginBottom: "0.2rem"
  },

  // === TABS ===
  tabContainer: {
    display: "flex",
    marginBottom: "1.5rem",
    borderBottom: "1px solid #ddd"
  },
  tabButton: {
    flex: 1,
    padding: "0.75rem",
    border: "none",
    background: "none",
    fontSize: "1rem",
    cursor: "pointer",
    color: "#666"
  },
  tabButtonActive: {
    fontWeight: "bold",
    color: "#007bff", // Blue active color
    borderBottom: "3px solid #007bff"
  },

  // === OPTIMIZER BANNER ===
  recommendationBox: {
    backgroundColor: "#e6fffa", // Light Teal background
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #b2f5ea",
    marginBottom: "1.5rem",
    textAlign: "center"
  },
  recTitle: {
    margin: 0,
    fontWeight: "bold",
    color: "#2c7a7b"
  },
  recValue: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#234e52"
  },
  recCount: {
    margin: "0.5rem 0 0",
    fontSize: "0.9rem"
  },

  // === RESULT LISTS ===
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