import Footer from "../components/layout/footer";
import Header from "../components/layout/header";

interface AppLayoutProps {
  children?: React.ReactNode;
}
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <div className='flex flex-col min-w-[640px]'>
        <div>
          <Header />
        </div>
        <div className='bg-slate-100'>{children}</div>
        <div>{/* <Footer /> */}</div>
      </div>
    </>
  );
}
