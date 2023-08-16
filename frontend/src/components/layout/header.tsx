import { AlignJustifyIcon } from 'lucide-react';
import { DefiLogo } from '../icons/defisensi-icons';

const Header = () => {
  return (
    <div className="sticky flex w-full justify-between px-5 py-4 shadow-[0px_5px_4px_-3px_#8E98B066]">
      <DefiLogo />
      <AlignJustifyIcon />
    </div>
  );
};

export default Header;
