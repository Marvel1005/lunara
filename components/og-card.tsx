import React from 'react';

/** Shared 1200×630 brand card rendered by opengraph-image.tsx / twitter-image.tsx. */
export function OgCardContent() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4A1942',
        backgroundImage:
          'radial-gradient(circle at 20% 20%, rgba(232,197,200,0.16) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(156,114,125,0.18) 0%, transparent 45%)',
        color: '#FDFBF7',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Crescent moon: plum circle with an offset cutout */}
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: 9999,
          backgroundColor: '#E8C5C8',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: 36,
        }}
      >
        <div
          style={{
            width: 128,
            height: 128,
            borderRadius: 9999,
            backgroundColor: '#4A1942',
            position: 'absolute',
            top: -8,
            left: 52,
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: 92,
          fontWeight: 700,
          letterSpacing: -2,
          fontFamily: 'serif',
        }}
      >
        Lunara
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: 34,
          marginTop: 16,
          color: '#E8C5C8',
          letterSpacing: 1,
        }}
      >
        Your cycle. Your comfort.
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: 24,
          marginTop: 40,
          color: 'rgba(253,251,247,0.72)',
          maxWidth: 900,
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        Private cycle, pain, and mood tracking — with optional comfort sharing for someone you trust.
      </div>
    </div>
  );
}
