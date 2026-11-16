import React from 'react';
import { AbsoluteFill, Composition, registerRoot, useCurrentFrame } from 'remotion';

const MovingSquare = () => {
  const frame = useCurrentFrame();
  const left = 8 + Math.floor(frame / 15) * 16;

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      <div
        style={{
          position: 'absolute',
          left,
          top: 18,
          width: 12,
          height: 12,
          backgroundColor: '#ff0000',
        }}
      />
    </AbsoluteFill>
  );
};

const RemotionRoot = () => (
  <Composition
    id="moving-square"
    component={MovingSquare}
    durationInFrames={31}
    fps={30}
    width={64}
    height={48}
  />
);

registerRoot(RemotionRoot);
