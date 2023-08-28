import Header from '../components/layout/header';

interface AppLayoutProps {
  noLayout?: boolean;
  children?: React.ReactNode;
}
export default function AppLayout({ children, noLayout }: AppLayoutProps) {
  return (
    <>
      {noLayout ? (
        <div className={`relative min-w-[430px]`}>{children}</div>
      ) : (
        <div className={`relative min-w-[430px]`}>
          <Header />
          <div className="min-h-[calc(100vh_-_78px)] overflow-auto bg-catskill-white-50">
            {children}
          </div>
        </div>
      )}
    </>
  );
}
