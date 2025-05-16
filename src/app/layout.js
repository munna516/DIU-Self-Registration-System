import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import NextAuthProvider from "@/provider/NextAuthProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "DIU Self Registration System",
  description: "A self registration system for DIU students",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <NextAuthProvider>
          {children}
          <Toaster />
        </NextAuthProvider>
      </body>
    </html>
  );
}
