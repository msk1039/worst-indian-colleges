
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";
  
export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Worst Indian Colleges",
  description: "A rank list of the worst colleges of India",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
      {children}
      </ThemeProvider>
      </body>
    </html>
  );
}
