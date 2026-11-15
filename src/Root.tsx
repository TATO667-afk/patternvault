import React from "react";
import { Composition } from "remotion";
import { Pompeii } from "./Pompeii";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Pompeii"
        component={Pompeii}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
