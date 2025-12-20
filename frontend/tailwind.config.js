/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0f172a",
        surfaceSoft: "#111a2d",
        borderSoft: "#1f2937",
        muted: "#94a3b8",
        accent: "#6366f1",
        success: "#10b981",
        warning: "#f59e0b",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(0, 0, 0, 0.35)",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
    },
  },
  plugins: [],
}
