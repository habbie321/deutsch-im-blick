import React from 'react';

const VideoPlayer = ({ src }) => {
  return (
    <video 
      controls 
      autoPlay 
      style={{ width: '70%', maxHeight: '80vh' }}
    >
      {/* Local (Electron) or remote paths work */}
      <source src={src} type="video/mp4" />
      Your browser doesn't support videos.
    </video>
  );
};

export default VideoPlayer;