export const themeConfig = {
  defaultTheme: "dark",
  themes: ["dark", "light", "system"] as const,
  sidebar: {
    expandedWidth: 320,
    collapsedWidth: 96,
  },
  breakpoints: {
    mobile: 768,
  },
};
