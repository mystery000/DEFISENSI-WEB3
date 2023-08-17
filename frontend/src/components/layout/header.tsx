import { AlignJustifyIcon } from 'lucide-react';

const Header = () => {
  return (
    <div className="sticky flex w-full items-center justify-between px-5 py-[15px] shadow-[0px_5px_4px_-3px_#8E98B066]">
      <span className="font-sora text-[40px] font-light leading-[48px]">
        <span className="font-extrabold">Defi</span>Sensi
      </span>
      <AlignJustifyIcon />
    </div>
  );
};

export default Header;
