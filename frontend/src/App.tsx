import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Assets } from "./pages/Assets";
import { ManagedAppContext } from "./context/app";
import { Transactions } from "./pages/Transasctions";

function App() {
  return (
    <ManagedAppContext>
      <BrowserRouter>
        <Routes>
          <Route path='/assets' element={<Assets />} />
          <Route path='/transactions' element={<Transactions />} />
        </Routes>
      </BrowserRouter>
    </ManagedAppContext>
  );
}

export default App;
