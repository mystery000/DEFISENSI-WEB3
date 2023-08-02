import Footer from "../components/layout/footer";
import Header from "../components/layout/header";

interface AppLayoutProps {
  children?: React.ReactNode;
}
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <div className='relative'>
        <Header />
        <div className='bg-[#F1F3F8]'>{children}</div>
        <div>{/* <Footer /> */}</div>
      </div>
    </>
  );
}
