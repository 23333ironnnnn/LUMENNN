import React, { useState, useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';

function ChatPanel({ onClose, onAnimationChange }) {
  const [messages, setMessages] = useState([
    { text: '……你来了。', isUser: false },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const endRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isThinking) return;

    setInput('');
    setMessages(prev => [...prev, { text, isUser: true }]);
    setIsThinking(true);

    // Small delay so typing indicator is visible
    await new Promise(r => setTimeout(r, 300));

    try {
      const response = await window.lumenAPI.chat(text);
      setIsThinking(false);
      if (onAnimationChange && response.animation) {
        onAnimationChange(response.animation);
      }
      setMessages(prev => {
        const next = [...prev, { text: response.text, isUser: false, animation: response.animation }];
        return next;
      });
    } catch {
      setIsThinking(false);
      setMessages(prev => [...prev, { text: '……信号中断了。', isUser: false }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return React.createElement(
    'div',
    {
      style: {
        width: '340px',
        height: '480px',
        background: 'rgba(26, 26, 46, 0.95)',
        border: '1px solid rgba(124, 92, 252, 0.3)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      },
    },
    // Header
    React.createElement(
      'div',
      {
        style: {
          padding: '10px 14px',
          borderBottom: '1px solid rgba(124, 92, 252, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
      },
      React.createElement('span', { style: { color: '#B8A9FF', fontSize: '13px', fontWeight: 'bold' } }, 'LUMEN'),
      React.createElement(
        'button',
        {
          onClick: onClose,
          style: {
            background: 'none',
            border: 'none',
            color: '#B8A9FF',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0 4px',
          },
        },
        '✕'
      )
    ),
    // Messages area
    React.createElement(
      'div',
      {
        style: {
          flex: 1,
          overflowY: 'auto',
          padding: '10px 0',
        },
      },
      messages.map((msg, i) =>
        React.createElement(ChatBubble, { key: i, text: msg.text, isUser: msg.isUser })
      ),
      // Thinking indicator
      isThinking && React.createElement(
        'div',
        { style: { padding: '8px 12px', color: '#7C5CFC', fontSize: '12px', fontStyle: 'italic' } },
        'LUMEN 正在输入…'
      ),
      React.createElement('div', { ref: endRef })
    ),
    // Input area
    React.createElement(
      'div',
      {
        style: {
          padding: '10px',
          borderTop: '1px solid rgba(124, 92, 252, 0.2)',
          display: 'flex',
          gap: '8px',
        },
      },
      React.createElement('input', {
        value: input,
        onChange: (e) => setInput(e.target.value),
        onKeyDown: handleKeyDown,
        placeholder: '和 LUMEN 说话…',
        disabled: isThinking,
        style: {
          flex: 1,
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(124, 92, 252, 0.3)',
          background: 'rgba(184, 169, 255, 0.08)',
          color: '#E0E0FF',
          fontSize: '13px',
          outline: 'none',
        },
      }),
      React.createElement(
        'button',
        {
          onClick: handleSend,
          disabled: isThinking || !input.trim(),
          style: {
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            background: input.trim() ? '#7C5CFC' : 'rgba(124, 92, 252, 0.3)',
            color: '#E0E0FF',
            fontSize: '13px',
            cursor: input.trim() ? 'pointer' : 'default',
          },
        },
        '发送'
      )
    )
  );
}

export default ChatPanel;
