import React from 'react';

function ChatBubble({ text, isUser }) {
  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '8px',
        padding: '0 12px',
      },
    },
    React.createElement(
      'div',
      {
        style: {
          maxWidth: '75%',
          padding: '8px 12px',
          borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
          background: isUser
            ? 'rgba(124, 92, 252, 0.3)'
            : 'rgba(184, 169, 255, 0.15)',
          color: '#E0E0FF',
          fontSize: '13px',
          lineHeight: 1.5,
          wordBreak: 'break-word',
          border: isUser
            ? '1px solid rgba(124, 92, 252, 0.3)'
            : '1px solid rgba(184, 169, 255, 0.2)',
        },
      },
      text
    )
  );
}

export default ChatBubble;
