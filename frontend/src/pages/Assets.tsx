import { FC, useEffect } from "react";

import AppLayout from "../layouts/AppLayout";

interface AssetProps {
  className?: string;
}

export const Assets: FC<AssetProps> = ({ className }) => {
  return (
    <>
      <AppLayout></AppLayout>
    </>
  );
};
