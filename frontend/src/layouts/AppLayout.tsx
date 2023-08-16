import Header from '../components/layout/header';

interface AppLayoutProps {
  children?: React.ReactNode;
}
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <div className="relative min-w-[430px]">
        <Header />
        <div className="bg-catskill-50">{children}</div>
      </div>
    </>
  );
}
