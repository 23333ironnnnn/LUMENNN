import React, { useState, useCallback, useEffect, useRef } from 'react';
import LumenCanvas from './components/LumenCanvas';
import ChatPanel from './components/ChatPanel';
import SleepPanel from './components/SleepPanel';
import DiaryPanel from './components/DiaryPanel';

const MODE = {
  MINI: 'mini',
  CHAT: 'chat',
  SLEEP: 'sleep',
  DIARY: 'diary',
};

const PANEL_WIDTH = 360;
const CANVAS_WIDTH = 160;

function App() {
  const [mode, setMode] = useState(MODE.MINI);
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [panelVisible, setPanelVisible] = useState(false);
  const dragRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Listen for mode changes from main process
  useEffect(() => {
    if (window.lumenAPI && window.lumenAPI.onModeChange) {
      window.lumenAPI.onModeChange((newMode) => {
        if (newMode === 'mini') {
          setMode(MODE.MINI);
          setPanelVisible(false);
          setCurrentAnimation('idle');
        }
        // Chat mode changes (from toggle) just sync visibility
      });
    }
  }, []);

  // Tell main process to resize window for a panel
  const openPanel = useCallback((newMode) => {
    setMode(newMode);
    setPanelVisible(true);
    if (window.lumenAPI && window.lumenAPI.openPanel) {
      window.lumenAPI.openPanel(newMode);
    }
  }, []);

  // Tell main process to shrink window back to mini
  const closePanel = useCallback(() => {
    setMode(MODE.MINI);
    setPanelVisible(false);
    setCurrentAnimation('idle');
    if (window.lumenAPI && window.lumenAPI.closePanel) {
      window.lumenAPI.closePanel();
    }
  }, []);

  // Window dragging handlers
  const handleMouseDown = useCallback((e) => {
    // Only drag from the background in mini mode, not on buttons
    if (mode !== MODE.MINI) return;
    dragRef.current = false;
    dragStartRef.current = { x: e.screenX, y: e.screenY };

    const onMouseMove = (ev) => {
      const dx = ev.screenX - dragStartRef.current.x;
      const dy = ev.screenY - dragStartRef.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current = true;
      }
      if (window.lumenAPI && window.lumenAPI.dragMove) {
        window.lumenAPI.dragMove(ev.screenX, ev.screenY);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (window.lumenAPI && window.lumenAPI.dragEnd) {
        window.lumenAPI.dragEnd();
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    if (window.lumenAPI && window.lumenAPI.dragStart) {
      window.lumenAPI.dragStart(e.screenX, e.screenY);
    }
  }, [mode]);

  const handleCanvasClick = useCallback(() => {
    if (dragRef.current) return;
    if (mode === MODE.MINI) {
      openPanel(MODE.CHAT);
    }
  }, [mode, openPanel]);

  const handleSleepMode = useCallback((e) => {
    e.stopPropagation();
    openPanel(MODE.SLEEP);
  }, [openPanel]);

  const handleDiaryMode = useCallback((e) => {
    e.stopPropagation();
    openPanel(MODE.DIARY);
  }, [openPanel]);

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
      onMouseDown: handleMouseDown,
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
        { onClick: handleCanvasClick, style: { cursor: 'grab' } },
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
        onClose: closePanel,
        onAnimationChange: handleChatAnimation,
      }),
      mode === MODE.SLEEP && React.createElement(SleepPanel, {
        onClose: closePanel,
      }),
      mode === MODE.DIARY && React.createElement(DiaryPanel, {
        onClose: closePanel,
      })
    )
  );
}

export default App;
