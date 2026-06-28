import React, { useState, useRef, useEffect } from 'react';
import LumenCanvas from './LumenCanvas';

function ChatPanel({ onClose, onAnimationChange, onModeSwitch }) {
  const [messages, setMessages] = useState([
    { text: '……你来了。', isUser: false },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [signal, setSignal] = useState(78);
  const [cursorVisible, setCursorVisible] = useState(true);
  const endRef = useRef(null);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Signal fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setSignal(prev => Math.max(60, Math.min(95, prev + (Math.random() - 0.5) * 8)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setInput('');
    setIsThinking(true);

    if (onAnimationChange) onAnimationChange('tilt_head');

    try {
      console.log('[ChatPanel] 发送消息:', userMessage);
      const response = await window.lumenAPI.chat(userMessage);
      console.log('[ChatPanel] 收到回复:', response);

      // response is an object: { text, animation, emotion }
      if (response && response.text) {
        setMessages(prev => [...prev, { text: response.text, isUser: false }]);

        // Map emotion to animation
        let animation = 'idle';
        if (response.emotion) {
          const emotionAnimationMap = {
            happy: 'happy',
            excited: 'jump',
            sad: 'eyes_half_closed',
            tired: 'sleepy',
            confused: 'confused',
            anxious: 'flicker',
            angry: 'shake',
            curious: 'tilt_head',
            surprised: 'flicker',
            neutral: 'gentle_blink',
          };
          animation = emotionAnimationMap[response.emotion] || 'idle';
        }

        if (onAnimationChange) {
          onAnimationChange(animation);
          // Return to idle after animation
          setTimeout(() => {
            if (onAnimationChange) onAnimationChange('idle');
          }, 2000);
        }
      } else {
        setMessages(prev => [...prev, { text: '……', isUser: false }]);
      }
    } catch (error) {
      console.error('[ChatPanel] 错误:', error);
      setMessages(prev => [...prev, { text: '……信号中断了。', isUser: false }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      {/* Title bar */}
      <div style={styles.titleBar}>
        <div style={styles.titleLeft}>
          <span style={styles.titleIcon}>◆</span>
          <span style={styles.titleText}>chat.exe</span>
        </div>
        <div style={styles.titleButtons}>
          {onModeSwitch && (
            <>
              <button
                style={styles.modeButton}
                onClick={() => onModeSwitch('sleep')}
                title="睡前模式"
              >
                SLEEP
              </button>
              <button
                style={styles.modeButton}
                onClick={() => onModeSwitch('diary')}
                title="情绪日记"
              >
                DIARY
              </button>
            </>
          )}
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
          <span style={styles.statValue}>{Math.round(signal)}%</span>
          <span style={styles.statLabel}> LINK :</span>
          <span style={{ ...styles.statValue, color: signal > 75 ? '#00FF9F' : '#B8A9FF' }}>
            {signal > 75 ? 'STRONG' : 'WEAK'}
          </span>
          <span style={styles.statLabel}> MEMORY :</span>
          <span style={styles.statValue}>STABLE</span>
        </div>
        <div style={styles.divider}>{'─'.repeat(50)}</div>
      </div>

      {/* Center: Cat + Messages */}
      <div style={styles.centerArea}>
        {/* LUMEN Cat */}
        <div style={styles.catContainer}>
          <LumenCanvas animation={isThinking ? 'tilt_head' : 'idle'} />
        </div>

        {/* Message box */}
        <div style={styles.messageBox}>
          {/* Corner decorations */}
          <div style={{ ...styles.corner, top: '-2px', left: '-2px', borderTop: '3px solid #D4AF37', borderLeft: '3px solid #D4AF37' }} />
          <div style={{ ...styles.corner, top: '-2px', right: '-2px', borderTop: '3px solid #D4AF37', borderRight: '3px solid #D4AF37' }} />
          <div style={{ ...styles.corner, bottom: '-2px', left: '-2px', borderBottom: '3px solid #D4AF37', borderLeft: '3px solid #D4AF37' }} />
          <div style={{ ...styles.corner, bottom: '-2px', right: '-2px', borderBottom: '3px solid #D4AF37', borderRight: '3px solid #D4AF37' }} />

          {/* Messages */}
          <div style={styles.messagesContainer}>
            {messages.map((msg, i) => (
              <div key={i} style={styles.messageItem}>
                {!msg.isUser && (
                  <div style={styles.messageHeader}>
                    <span style={styles.messageIcon}>◆</span>
                    LUMEN <span style={styles.messageDivider}>{'─'.repeat(40)}</span>
                  </div>
                )}
                <div style={{ ...styles.messageText, color: msg.isUser ? '#00FF9F' : '#B8A9FF' }}>
                  {msg.isUser ? `> ${msg.text}` : msg.text}
                </div>
              </div>
            ))}
            {isThinking && <div style={styles.thinking}>......</div>}
            <div ref={endRef} />
          </div>
        </div>
      </div>

      {/* Input area */}
      <div style={styles.inputArea}>
        <div style={styles.inputBox}>
          <span style={styles.inputPrompt}>&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
            style={styles.input}
            placeholder=""
          />
          <span style={{ ...styles.cursor, opacity: cursorVisible ? 1 : 0 }}>█</span>
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim() || isThinking}
          style={{
            ...styles.sendButton,
            background: input.trim() ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
            opacity: input.trim() && !isThinking ? 1 : 0.5,
            cursor: input.trim() && !isThinking ? 'pointer' : 'not-allowed',
          }}
        >
          SEND
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
  },
  titleBar: {
    padding: '8px 12px',
    background: '#000000',
    borderBottom: '2px solid #D4AF37',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  modeButton: {
    padding: '4px 8px',
    background: 'rgba(212, 175, 55, 0.1)',
    border: '2px solid #D4AF37',
    color: '#D4AF37',
    cursor: 'pointer',
    fontSize: '9px',
    fontFamily: '"Courier New", Courier, monospace',
    fontWeight: 'bold',
    transition: 'background 0.2s',
  },
  systemInfo: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
  },
  systemTitle: {
    color: '#D4AF37',
    fontSize: '11px',
    marginBottom: '4px',
  },
  systemStats: {
    fontSize: '10px',
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
    fontSize: '9px',
    marginTop: '4px',
  },
  centerArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '16px',
  },
  catContainer: {
    transform: 'scale(1.2)',
  },
  messageBox: {
    width: '90%',
    maxHeight: '140px',
    overflowY: 'auto',
    border: '2px solid #D4AF37',
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.7)',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: '16px',
    height: '16px',
  },
  messagesContainer: {},
  messageItem: {
    marginBottom: '10px',
  },
  messageHeader: {
    marginBottom: '4px',
    color: '#B8A9FF',
    fontSize: '9px',
  },
  messageIcon: {
    marginRight: '4px',
  },
  messageDivider: {
    color: '#D4AF37',
  },
  messageText: {
    fontSize: '10px',
    lineHeight: '1.6',
    whiteSpace: 'pre-line',
  },
  thinking: {
    marginTop: '10px',
    color: '#B8A9FF',
    fontSize: '9px',
    fontStyle: 'italic',
  },
  inputArea: {
    padding: '10px 16px',
    borderTop: '2px solid #D4AF37',
    display: 'flex',
    gap: '10px',
    background: '#000000',
  },
  inputBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '2px solid #D4AF37',
    padding: '8px 12px',
    background: 'rgba(0, 0, 0, 0.8)',
  },
  inputPrompt: {
    color: '#D4AF37',
    fontSize: '12px',
  },
  input: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#B8A9FF',
    fontSize: '10px',
    fontFamily: '"Courier New", Courier, monospace',
  },
  cursor: {
    color: '#B8A9FF',
    fontSize: '12px',
  },
  sendButton: {
    padding: '8px 24px',
    border: '2px solid #D4AF37',
    color: '#D4AF37',
    fontSize: '11px',
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

export default ChatPanel;
