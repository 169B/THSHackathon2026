export const metadata = {
  title: "Estimately",
  description: "Estimately Authentication",
};

export default function RootLayout({ children }) {
  return (
    <html className="dark" lang="en">
      <head>
        <link rel="icon" href="/appwrite.svg" />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script id="tailwind-config" suppressHydrationWarning>
          {`
            tailwind.config = {
              darkMode: "class",
              theme: {
                extend: {
                  colors: {
                    "on-surface-variant": "#c3c8c1",
                    "on-secondary": "#512305",
                    "on-tertiary-container": "#a98f69",
                    "on-secondary-fixed-variant": "#6d3919",
                    "secondary": "#ffb68f",
                    "surface-container": "#1d201d",
                    "error-container": "#93000a",
                    "surface-tint": "#b4cdb8",
                    "inverse-primary": "#4d6453",
                    "primary-container": "#1b3022",
                    "background": "#111411",
                    "primary": "#b4cdb8",
                    "surface-dim": "#111411",
                    "surface-container-low": "#191c19",
                    "on-tertiary-fixed": "#281901",
                    "outline": "#8d928c",
                    "tertiary-fixed-dim": "#e0c299",
                    "surface-container-lowest": "#0c0f0c",
                    "on-background": "#e1e3de",
                    "surface-variant": "#333632",
                    "outline-variant": "#434843",
                    "surface": "#111411",
                    "on-secondary-container": "#eea47c",
                    "on-error-container": "#ffdad6",
                    "secondary-fixed": "#ffdbca",
                    "secondary-container": "#6d3919",
                    "on-surface": "#e1e3de",
                    "surface-container-highest": "#333632",
                    "on-tertiary-fixed-variant": "#584324",
                    "on-primary-fixed-variant": "#364c3c",
                    "on-primary": "#203527",
                    "tertiary-fixed": "#fddeb4",
                    "surface-container-high": "#282b27",
                    "inverse-on-surface": "#2e312e",
                    "on-primary-container": "#819986",
                    "on-primary-fixed": "#0b2013",
                    "tertiary-container": "#3a280b",
                    "secondary-fixed-dim": "#ffb68f",
                    "primary-fixed": "#d0e9d4",
                    "on-error": "#690005",
                    "primary-fixed-dim": "#b4cdb8",
                    "surface-bright": "#373a36",
                    "on-tertiary": "#3f2d10",
                    "on-secondary-fixed": "#331200",
                    "inverse-surface": "#e1e3de",
                    "tertiary": "#e0c299",
                    "error": "#ffb4ab"
                  },
                  fontFamily: {
                    "headline": ["Manrope"],
                    "body": ["Inter"],
                    "label": ["Inter"]
                  },
                  borderRadius: {"DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem"},
                },
              },
            }
          `}
        </script>
        <style>
          {`
            .material-symbols-outlined {
              font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            }
          `}
        </style>
      </head>
      <body className="min-h-screen flex flex-col bg-background text-on-surface font-body selection:bg-primary/30">
        {children}
      </body>
    </html>
  );
}
