import React, { useState, useEffect } from 'react';

function SleepPanel({ onClose }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stars, setStars] = useState([]);

  // Generate random stars for background
  useEffect(() => {
    const starCount = 30;
    const shapes = ['dot', 'cross', 'square', 'diamond', 'plus'];
    const newStars = Array.from({ length: starCount }, () => ({
      x: Math.random() * 500,
      y: Math.random() * 500,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      opacity: Math.random() * 0.4 + 0.3,
      twinkleSpeed: Math.random() * 2500 + 1500,
    }));
    setStars(newStars);
  }, []);

  useEffect(() => {
    const fetchSleep = async () => {
      try {
        const result = await window.lumenAPI.sleep();
        setSummary(result);
      } catch {
        setSummary({
          summaryText: '一日终了。平静也是一种收获。',
          song: null,
          mainEmotion: 'neutral'
        });
      }
      setLoading(false);
    };
    fetchSleep();
  }, []);

  const renderShape = (star) => {
    const baseStyle = {
      position: 'absolute',
      background: '#B8A9FF',
    };

    switch (star.shape) {
      case 'dot':
        return <div style={{ ...baseStyle, width: '2px', height: '2px' }} />;
      case 'cross':
        return (
          <div style={{ position: 'relative', width: '5px', height: '5px' }}>
            <div style={{ ...baseStyle, width: '5px', height: '1px', top: '2px' }} />
            <div style={{ ...baseStyle, width: '1px', height: '5px', left: '2px', position: 'absolute', top: 0 }} />
          </div>
        );
      case 'square':
        return (
          <div style={{
            ...baseStyle,
            width: '3px',
            height: '3px',
            border: '1px solid #B8A9FF',
            background: 'transparent',
          }} />
        );
      case 'diamond':
        return (
          <div style={{ position: 'relative', width: '5px', height: '5px' }}>
            <div style={{ ...baseStyle, width: '1px', height: '1px', left: '2px', top: '0px' }} />
            <div style={{ ...baseStyle, width: '1px', height: '1px', left: '1px', top: '1px', position: 'absolute' }} />
            <div style={{ ...baseStyle, width: '3px', height: '1px', left: '1px', top: '2px', position: 'absolute' }} />
            <div style={{ ...baseStyle, width: '1px', height: '1px', left: '3px', top: '1px', position: 'absolute' }} />
            <div style={{ ...baseStyle, width: '1px', height: '1px', left: '2px', top: '4px', position: 'absolute' }} />
          </div>
        );
      case 'plus':
        return (
          <div style={{ position: 'relative', width: '7px', height: '7px' }}>
            <div style={{ ...baseStyle, width: '7px', height: '1px', top: '3px' }} />
            <div style={{ ...baseStyle, width: '1px', height: '7px', left: '3px', position: 'absolute', top: 0 }} />
          </div>
        );
      default:
        return <div style={{ ...baseStyle, width: '2px', height: '2px' }} />;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <span style={{ color: '#B8A9FF', fontSize: '12px' }}>LOADING...</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Stars background */}
      <div style={styles.starsContainer}>
        {stars.map((star, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${star.x}px`,
              top: `${star.y}px`,
              opacity: star.opacity,
              animation: `twinkle ${star.twinkleSpeed}ms infinite alternate`,
            }}
          >
            {renderShape(star)}
          </div>
        ))}
      </div>

      {/* Title bar */}
      <div style={styles.titleBar}>
        <div style={styles.titleLeft}>
          <span style={styles.titleIcon}>◆</span>
          <span style={styles.titleText}>sleep.exe</span>
        </div>
        <div style={styles.titleButtons}>
          <button style={styles.titleButton}>−</button>
          <button style={styles.titleButton}>□</button>
          <button style={styles.titleButton} onClick={onClose}>×</button>
        </div>
      </div>

      {/* System info */}
      <div style={styles.systemInfo}>
        <div style={styles.systemTitle}>LCARS_95 v2.1</div>
        <div style={styles.systemStats}>
          <span style={styles.statLabel}>SIGNAL :</span>
          <span style={styles.statValue}>78%</span>
          <span style={styles.statLabel}> LINK :</span>
          <span style={styles.statValue}>WEAK</span>
          <span style={styles.statLabel}> MEMORY :</span>
          <span style={styles.statValue}>STABLE</span>
        </div>
        <div style={styles.divider}>{'─'.repeat(50)}</div>
      </div>

      {/* Main content */}
      <div style={styles.mainContent}>
        {/* Cat + Moon scene */}
        <div style={styles.catScene}>
          {/* Moon */}
          <div style={styles.moon}></div>
          {/* Cat */}
          <div style={styles.catWrapper}>
            <div style={styles.catPixel}>
              {/* Cat ears */}
              <div style={{ ...styles.pixel, top: '0px', left: '20px', width: '8px', background: '#7C5CFC' }}></div>
              <div style={{ ...styles.pixel, top: '0px', left: '44px', width: '8px', background: '#7C5CFC' }}></div>
              {/* Cat head */}
              <div style={{ ...styles.pixel, top: '8px', left: '12px', width: '48px', background: '#7C5CFC' }}></div>
              <div style={{ ...styles.pixel, top: '16px', left: '8px', width: '56px', background: '#7C5CFC' }}></div>
              {/* Eyes */}
              <div style={{ ...styles.pixel, top: '20px', left: '20px', width: '8px', height: '8px', background: '#000' }}></div>
              <div style={{ ...styles.pixel, top: '20px', left: '44px', width: '8px', height: '8px', background: '#000' }}></div>
              {/* Whiskers */}
              <div style={{ ...styles.pixel, top: '28px', left: '4px', width: '8px', height: '4px', background: '#7C5CFC' }}></div>
              <div style={{ ...styles.pixel, top: '28px', left: '60px', width: '8px', height: '4px', background: '#7C5CFC' }}></div>
              {/* Body */}
              <div style={{ ...styles.pixel, top: '32px', left: '12px', width: '48px', background: '#7C5CFC' }}></div>
              <div style={{ ...styles.pixel, top: '40px', left: '16px', width: '40px', background: '#7C5CFC' }}></div>
              {/* Tail */}
              <div style={{ ...styles.pixel, top: '48px', left: '52px', width: '16px', height: '4px', background: '#7C5CFC' }}></div>
            </div>
          </div>
        </div>

        {/* Summary text */}
        <div style={styles.summaryText}>
          {summary && summary.summaryText}
        </div>

        {/* Song recommendation */}
        {summary && summary.song && (
          <div style={styles.songCard}>
            {/* Corner decorations */}
            <div style={{ ...styles.corner, top: '-2px', left: '-2px', borderTop: '2px solid #D4AF37', borderLeft: '2px solid #D4AF37' }} />
            <div style={{ ...styles.corner, top: '-2px', right: '-2px', borderTop: '2px solid #D4AF37', borderRight: '2px solid #D4AF37' }} />
            <div style={{ ...styles.corner, bottom: '-2px', left: '-2px', borderBottom: '2px solid #D4AF37', borderLeft: '2px solid #D4AF37' }} />
            <div style={{ ...styles.corner, bottom: '-2px', right: '-2px', borderBottom: '2px solid #D4AF37', borderRight: '2px solid #D4AF37' }} />

            <div style={styles.songLabel}>LUMEN 推荐的歌</div>
            <div style={styles.songTitle}>{summary.song.title}</div>
            <div style={styles.songArtist}>{summary.song.artist}</div>
            {summary.song.recommendReason && (
              <div style={styles.songReason}>{summary.song.recommendReason}</div>
            )}
          </div>
        )}

        {/* Goodnight button */}
        <button onClick={onClose} style={styles.goodnightButton}>
          晚安
        </button>
      </div>

      {/* Status bar */}
      <div style={styles.statusBar}>
        <div style={styles.statusLeft}>
          <span>FREQUENCY :</span>
          <span style={styles.statusValue}>11.2 kHz</span>
          <span style={{ marginLeft: '20px', letterSpacing: '2px' }}>█████░</span>
        </div>
        <div style={styles.statusRight}>
          <span>CHANNEL :</span>
          <span style={styles.statusValue}>LUMEN</span>
        </div>
      </div>

      {/* CSS animation */}
      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.3; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    width: '500px',
    height: '500px',
    background: '#000000',
    border: '2px solid #D4AF37',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)',
    fontFamily: '"Courier New", Courier, monospace',
    position: 'relative',
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 0,
  },
  titleBar: {
    padding: '8px 12px',
    background: '#000000',
    borderBottom: '2px solid #D4AF37',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
    WebkitAppRegion: 'drag',
  },
  titleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  titleIcon: {
    color: '#B8A9FF',
    fontSize: '18px',
  },
  titleText: {
    color: '#D4AF37',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  titleButtons: {
    display: 'flex',
    gap: '8px',
    WebkitAppRegion: 'no-drag',
  },
  titleButton: {
    width: '24px',
    height: '24px',
    background: 'none',
    border: '2px solid #D4AF37',
    color: '#D4AF37',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemInfo: {
    padding: '10px 16px',
    borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
    position: 'relative',
    zIndex: 1,
  },
  systemTitle: {
    color: '#D4AF37',
    fontSize: '10px',
    marginBottom: '3px',
  },
  systemStats: {
    fontSize: '9px',
    color: '#B8A9FF',
  },
  statLabel: {
    color: '#B8A9FF',
  },
  statValue: {
    color: '#B8A9FF',
    marginLeft: '4px',
  },
  divider: {
    color: '#D4AF37',
    fontSize: '8px',
    marginTop: '3px',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '20px',
    position: 'relative',
    zIndex: 1,
  },
  catScene: {
    position: 'relative',
    width: '200px',
    height: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moon: {
    position: 'absolute',
    top: '10px',
    left: '60px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: '#E8E0FF',
    boxShadow: '0 0 20px rgba(232, 224, 255, 0.5)',
  },
  catWrapper: {
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  catPixel: {
    position: 'relative',
    width: '72px',
    height: '56px',
  },
  pixel: {
    position: 'absolute',
    height: '4px',
  },
  heart: {
    fontSize: '40px',
  },
  summaryText: {
    color: '#E0E0FF',
    fontSize: '11px',
    lineHeight: '1.6',
    textAlign: 'center',
    whiteSpace: 'pre-line',
    maxWidth: '90%',
  },
  songCard: {
    width: '85%',
    padding: '12px',
    border: '2px solid #D4AF37',
    background: 'rgba(0, 0, 0, 0.7)',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: '12px',
    height: '12px',
  },
  songLabel: {
    color: '#B8A9FF',
    fontSize: '9px',
    marginBottom: '6px',
  },
  songTitle: {
    color: '#E0E0FF',
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '3px',
  },
  songArtist: {
    color: '#B8A9FF',
    fontSize: '10px',
    marginBottom: '6px',
  },
  songReason: {
    color: '#7C5CFC',
    fontSize: '9px',
    fontStyle: 'italic',
    marginTop: '6px',
  },
  goodnightButton: {
    padding: '8px 30px',
    border: '2px solid #D4AF37',
    background: 'rgba(212, 175, 55, 0.2)',
    color: '#D4AF37',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: '"Courier New", Courier, monospace',
    fontWeight: 'bold',
  },
  statusBar: {
    padding: '6px 16px',
    borderTop: '1px solid rgba(212, 175, 55, 0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#000000',
    fontSize: '9px',
    color: '#B8A9FF',
    position: 'relative',
    zIndex: 1,
  },
  statusLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusValue: {
    color: '#B8A9FF',
  },
};

export default SleepPanel;
