import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Portfolio } from "./pages/Portfolio";
import { ManagedAppContext } from "./context/app";
import { Transactions } from "./pages/Transasctions";

function App() {
  return (
    <ManagedAppContext>
      <BrowserRouter>
        <Routes>
          <Route path='/portfolio' element={<Portfolio />} />
          <Route path='/transactions' element={<Transactions />} />
        </Routes>
      </BrowserRouter>
    </ManagedAppContext>
  );
}

export default App;
