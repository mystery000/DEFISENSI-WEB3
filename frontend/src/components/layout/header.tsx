import { AlignJustifyIcon } from "lucide-react";
import { DefiLogo } from "../icons/defisensi-icons";

const Header = () => {
  return (
    <div className='sticky flex justify-between py-4 px-5 shadow-[0px_5px_4px_-3px_#8E98B066]'>
      <DefiLogo />
      <AlignJustifyIcon />
    </div>
  );
};

export default Header;
