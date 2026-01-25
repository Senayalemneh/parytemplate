import { ReactNode } from "react";
import Header from "../components/common/header";
import Footer from "../components/common/footer";


interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header>
        <Header />
      </header>
        <main className="flex-grow">{children}</main>
         
        <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;
