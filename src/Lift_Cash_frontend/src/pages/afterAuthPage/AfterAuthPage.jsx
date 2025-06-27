import React, { useState } from "react";
import HeaderAfterAuth from "../../components/headerAfterAuth/HeaderAfterAuth";
// import Waveform from "../../components/threejs/Waveform";
import FloatingDustWave from "../../components/threejs/FloatingDustWave";
import { useAuthClient } from "../../utils/useAuthClient";
import AccessDenied from "../accessDeniedPage/AccessDenied";

const AfterAuthPage = ({ children }) => {
  const [isAnimationActive, setIsAnimationActive] = useState(false);

  // Toggle function for background animation
  const onToggleAnimation = () => {
    setIsAnimationActive((prevState) => !prevState);
  };

  const { isAuthenticated } = useAuthClient();

  console.log("isAuth in AfterAuthPage : ", isAuthenticated);

  if (isAuthenticated) {
    return (
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
        }}
        className="min-h-screen"
      >
        <HeaderAfterAuth onToggleAnimation={onToggleAnimation} />
        {/* <div className="flex-grow relative flex items-center justify-center overflow-hidden"> */}
        {/* Conditionally render FloatingDustWave animation */}
        {isAnimationActive && (
          <div className="absolute ">
            {/* <Waveform /> */}
            <FloatingDustWave />
          </div>
        )}
        <main className="relative min-h-screen justify-center flex flex-col">
          {children}
        </main>
      </div>
      // </div>
    );
  } else {
    return <AccessDenied />;
  }
};

export default AfterAuthPage;
