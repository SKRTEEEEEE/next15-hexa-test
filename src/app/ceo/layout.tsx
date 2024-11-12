import Header from "@/components/ceo/header";
import Navbar from "@/components/ceo/navbar";
import { CThemeProvider } from "@/components/oth/theme-provider";
import { cn } from "@/lib/utils";
import type { Metadata} from "next";
import { Urbanist } from "next/font/google";

// import 'swiper/css';
// import 'swiper/css/pagination';
// import 'swiper/css/scrollbar';

// import Navbar from "@/components/main/navbar";
// import Header from "@/components/main/header";
import { ThirdwebProvider } from "thirdweb/react";


const urbanist = Urbanist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SKRTEEEEEEDev Landing Page",
  description: "Landing page made by SKRTEEEEEEDev",
};


// El thirdweb provider lo he de usar en el Layout de mas al fondo NO EN ESTE
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className={cn(urbanist.className," bg-no-repeat bg-gradient-cover")}>
        <CThemeProvider  disableTransitionOnChange defaultTheme="dark-soft">
      <ThirdwebProvider>
        <Navbar />
        <Header />
        {children}
      </ThirdwebProvider>
      </CThemeProvider>

      </div>
  );
}