import { AlignJustifyIcon } from "lucide-react";

const Header = () => {
  return (
    <>
      <div className='flex justify-between p-2 font-sans shadow-2xl'>
        <div className='text-2xl'>
          <b>Defi</b>Sensi
        </div>
        <div>
          <AlignJustifyIcon />
        </div>
      </div>
    </>
  );
};

export default Header;
