import React, { useState, useCallback, useEffect } from 'react';
import LumenCanvas from './components/LumenCanvas';
import ChatPanel from './components/ChatPanel';
import SleepPanel from './components/SleepPanel';
import DiaryPanel from './components/DiaryPanel';

const MODE = {
  MINI: 'mini',       // Just LUMEN floating
  CHAT: 'chat',       // Chat panel open
  SLEEP: 'sleep',     // Bedtime mode
  DIARY: 'diary',     // Emotion diary
};

const PANEL_WIDTH = 360;
const CANVAS_WIDTH = 160;

function App() {
  const [mode, setMode] = useState(MODE.MINI);
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [panelVisible, setPanelVisible] = useState(false);

  // Listen for mode changes from main process (WindowManager)
  useEffect(() => {
    if (window.lumenAPI && window.lumenAPI.onModeChange) {
      window.lumenAPI.onModeChange((newMode) => {
        if (newMode === 'chat') {
          setMode(MODE.CHAT);
          setPanelVisible(true);
        } else {
          setMode(MODE.MINI);
          setPanelVisible(false);
          setCurrentAnimation('idle');
        }
      });
    }
  }, []);

  const handleCanvasClick = useCallback(() => {
    if (mode === MODE.MINI) {
      setMode(MODE.CHAT);
      setPanelVisible(true);
    }
  }, [mode]);

  const handleClosePanel = useCallback(() => {
    setMode(MODE.MINI);
    setPanelVisible(false);
    setCurrentAnimation('idle');
  }, []);

  const handleSleepMode = useCallback(() => {
    setMode(MODE.SLEEP);
    setPanelVisible(true);
  }, []);

  const handleDiaryMode = useCallback(() => {
    setMode(MODE.DIARY);
    setPanelVisible(true);
  }, []);

  // Animation state from chat responses
  const handleChatAnimation = useCallback((anim) => {
    if (anim) setCurrentAnimation(anim);
  }, []);

  const isMini = mode === MODE.MINI;
  const showPanel = panelVisible && mode !== MODE.MINI;

  return React.createElement(
    'div',
    {
      style: {
        width: isMini ? `${CANVAS_WIDTH}px` : `${CANVAS_WIDTH + PANEL_WIDTH}px`,
        height: isMini ? '180px' : 'auto',
        display: 'flex',
        alignItems: 'flex-start',
      },
    },
    // LUMEN canvas area
    React.createElement(
      'div',
      {
        style: {
          width: `${CANVAS_WIDTH}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '8px',
        },
      },
      React.createElement(
        'div',
        { onClick: handleCanvasClick, style: { cursor: 'pointer' } },
        React.createElement(LumenCanvas, { animation: currentAnimation })
      ),
      // Mini controls (visible always)
      mode === MODE.MINI && React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            gap: '4px',
            marginTop: '4px',
          },
        },
        React.createElement(
          'button',
          {
            onClick: handleSleepMode,
            title: '睡前模式',
            style: {
              background: 'rgba(124, 92, 252, 0.15)',
              border: '1px solid rgba(124, 92, 252, 0.2)',
              borderRadius: '4px',
              color: '#B8A9FF',
              fontSize: '10px',
              padding: '2px 6px',
              cursor: 'pointer',
            },
          },
          '🌙'
        ),
        React.createElement(
          'button',
          {
            onClick: handleDiaryMode,
            title: '情绪日记',
            style: {
              background: 'rgba(124, 92, 252, 0.15)',
              border: '1px solid rgba(124, 92, 252, 0.2)',
              borderRadius: '4px',
              color: '#B8A9FF',
              fontSize: '10px',
              padding: '2px 6px',
              cursor: 'pointer',
            },
          },
          '📖'
        ),
      )
    ),
    // Panel area
    showPanel && React.createElement(
      'div',
      {
        className: 'panel-enter',
        style: { marginLeft: '4px' },
      },
      mode === MODE.CHAT && React.createElement(ChatPanel, {
        onClose: handleClosePanel,
        onAnimationChange: handleChatAnimation,
      }),
      mode === MODE.SLEEP && React.createElement(SleepPanel, {
        onClose: handleClosePanel,
      }),
      mode === MODE.DIARY && React.createElement(DiaryPanel, {
        onClose: handleClosePanel,
      })
    )
  );
}

export default App;
