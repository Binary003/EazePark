import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import WelcomePage from "./pages/Welcomepage";
import SignupPage from "./pages/Signuppage";
import MapPage from "./pages/Mappage";
import LocDetails from "./pages/Locdetails";
import PaymentGateways from "./pages/Paymentgateways";
import Vehicledetails from "./pages/Vehicledetails";
import TicketPage from "./pages/TicketPage";

import "./App.css";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/locdetails" element={<LocDetails />} />
      <Route path="/paymentgateways" element={<PaymentGateways />} />
      <Route path="/vehicledetails" element={<Vehicledetails />} />
      <Route path="/ticket" element={<TicketPage />} />
    </Routes>
  );
};

export default App;
