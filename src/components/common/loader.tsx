// RotateAnimation.tsx
import React from "react";
import { Center } from "@mantine/core";
import Lottie from "lottie-react";
import rotateAnimation from "./Animation.json";

const RotateAnimation = () => {
  return (
    <Center className="w-screen h-screen">
      <div className="w-48 h-48">
        <Lottie animationData={rotateAnimation} loop={true} />
      </div>
    </Center>
  );
};

export default RotateAnimation;
