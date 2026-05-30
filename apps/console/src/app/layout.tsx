import type { Metadata } from "next";
import "overlayscrollbars/overlayscrollbars.css";
import { OverlayScrollbarsProvider } from "@/components/overlay-scrollbars-provider";
import { SystemFeedbackProvider } from "@/components/system-feedback";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title:       "SBC ERP",
  description: "Modern ERP for daily business operations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              const storedTheme = localStorage.getItem("sbc-theme");
              const theme = storedTheme === "dark" ? "dark" : "light";
              document.documentElement.dataset.theme = theme;
              document.documentElement.style.colorScheme = theme;
            })();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <OverlayScrollbarsProvider />
          <SystemFeedbackProvider>{children}</SystemFeedbackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
