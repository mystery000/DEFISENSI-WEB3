import Header from '../components/layout/header';

interface AppLayoutProps {
  children?: React.ReactNode;
}
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <div className="relative min-w-[430px]">
        <Header />
        <div className="bg-catskill-white-50 min-h-[calc(100vh_-_78px)] overflow-auto">
          {children}
        </div>
      </div>
    </>
  );
}
