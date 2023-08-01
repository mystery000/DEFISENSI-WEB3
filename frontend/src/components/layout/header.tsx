import { AlignJustifyIcon } from "lucide-react";
import { DefiLogo } from "../icons/defisensi-icons";

const Header = () => {
  return (
    <>
      <div className='flex justify-between py-4 px-5 shadow-xl'>
        <div>
          <DefiLogo />
        </div>
        <div>
          <AlignJustifyIcon />
        </div>
      </div>
    </>
  );
};

export default Header;
