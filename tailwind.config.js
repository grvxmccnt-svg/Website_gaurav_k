/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F4F7F4",
        fog: "#EAEFEA",
        moss: "#D5DFD4",
        sage: "#9BBF9E",
        green: "#688F6C",
        leaf: "#CBE3CC",
        plum: "#241331",
        grape: "#432856",
        lilac: "#65437E",
        amber: "#F59E0B"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(36, 19, 49, 0.16)",
        glow: "0 0 36px rgba(245, 158, 11, 0.32)"
      }
    }
  },
  plugins: []
};
