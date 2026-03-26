import { useEffect } from 'react';
import gsap from 'gsap';
import { Scene } from './MarbleScene';

export default function MarbleHero() {
  useEffect(() => {
    const tl = gsap.timeline();

    // 1. Reveal horizontal lines
    tl.to('.grid-line', {
      scaleX: 1,
      duration: 1.5,
      ease: 'expo.inOut',
      stagger: 0.2,
    });

    // 2. Reveal typography
    tl.fromTo(
      '.hero-char',
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, stagger: 0.05, ease: 'power3.out' },
      '-=1'
    );

    // 3. Reveal sub-elements
    tl.fromTo(
      '.marble-fade-up',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      '-=0.5'
    );
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      {/* Font loader */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Manrope:wght@200;400;600&display=swap');
        .marble-font-stone { font-family: 'Cinzel', serif; }
      `}</style>

      {/* 3D Canvas layer */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.88 }}>
        <Scene />
      </div>

      {/* Grain texture */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          opacity: 0.06,
          backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")',
        }}
      />

      {/* Grid line — top */}
      <div style={{ position: 'absolute', top: '6rem', left: 0, width: '100%', padding: '0 3rem', zIndex: 20 }}>
        <div
          className="grid-line"
          style={{
            height: '1px',
            width: '100%',
            transformOrigin: 'left center',
            transform: 'scaleX(0)',
            background: 'rgba(255,255,255,0.08)',
          }}
        />
      </div>

      {/* Grid line — bottom */}
      <div style={{ position: 'absolute', bottom: '6rem', left: 0, width: '100%', padding: '0 3rem', zIndex: 20 }}>
        <div
          className="grid-line"
          style={{
            height: '1px',
            width: '100%',
            transformOrigin: 'right center',
            transform: 'scaleX(0)',
            background: 'rgba(255,255,255,0.08)',
          }}
        />
      </div>

      {/* Centered title — mix-blend-exclusion so it stays visible over the sphere */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          textAlign: 'center',
          mixBlendMode: 'exclusion',
          pointerEvents: 'none',
          zIndex: 30,
        }}
      >
        <h1
          className="marble-font-stone"
          style={{
            fontSize: 'clamp(4rem, 10vw, 9rem)',
            color: 'white',
            lineHeight: 1,
            margin: 0,
          }}
        >
          <div style={{ overflow: 'hidden', display: 'inline-flex' }}>
            {'LUMINA'.split('').map((char, i) => (
              <span key={i} className="hero-char" style={{ display: 'block' }}>
                {char}
              </span>
            ))}
          </div>
          <br />
          <div style={{ overflow: 'hidden', display: 'inline-flex' }}>
            {'STREAM'.split('').map((char, i) => (
              <span
                key={`s-${i}`}
                className="hero-char"
                style={{
                  display: 'block',
                  color: 'transparent',
                  WebkitTextStroke: '1px white',
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </h1>
      </div>

      {/* Scroll hint */}
      <div
        className="marble-fade-up"
        style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          fontSize: '0.65rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.25)',
          fontFamily: "'Manrope', sans-serif",
        }}
      >
        scroll to explore
      </div>
    </div>
  );
}
