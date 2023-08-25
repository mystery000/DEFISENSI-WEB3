import AppLayout from '../layouts/AppLayout';

export const PageNotFound = () => {
  return (
    <AppLayout>
      <div className="grid h-[calc(100vh_-_78px)] place-items-center">
        <p className="text-3xl font-semibold text-red-500">
          404 Page not found
        </p>
      </div>
    </AppLayout>
  );
};
