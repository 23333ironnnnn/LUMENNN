import React, { useState, useEffect } from 'react';

function SleepPanel({ onClose }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goodnight, setGoodnight] = useState(false);

  useEffect(() => {
    const fetchSleep = async () => {
      try {
        const result = await window.lumenAPI.sleep();
        setSummary(result);
      } catch {
        setSummary({ summaryText: '信号不佳。你的今天只有你自己知道。', song: null });
      }
      setLoading(false);
    };
    fetchSleep();
  }, []);

  if (goodnight) {
    return React.createElement(
      'div',
      {
        style: {
          width: '340px',
          padding: '40px 20px',
          textAlign: 'center',
          color: '#B8A9FF',
          fontSize: '14px',
        },
      },
      React.createElement('div', { style: { fontSize: '36px', marginBottom: '16px' } }, '✨'),
      React.createElement('p', null, '晚安。'),
      React.createElement('p', { style: { fontSize: '12px', color: '#7C5CFC', marginTop: '8px' } },
        'LUMEN 还在。'
      )
    );
  }

  if (loading) {
    return React.createElement(
      'div',
      {
        style: {
          width: '340px',
          padding: '60px 20px',
          textAlign: 'center',
          color: '#7C5CFC',
          fontSize: '13px',
        },
      },
      'LUMEN 正在整理今日的碎片…'
    );
  }

  return React.createElement(
    'div',
    {
      style: {
        width: '340px',
        background: 'rgba(26, 26, 46, 0.95)',
        border: '1px solid rgba(124, 92, 252, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      },
    },
    // Header
    React.createElement(
      'div',
      {
        style: {
          padding: '12px 14px',
          borderBottom: '1px solid rgba(124, 92, 252, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
      },
      React.createElement('span', { style: { color: '#B8A9FF', fontSize: '13px', fontWeight: 'bold' } }, '🌙 睡前'),
      React.createElement(
        'button',
        {
          onClick: onClose,
          style: { background: 'none', border: 'none', color: '#B8A9FF', cursor: 'pointer', fontSize: '16px' },
        },
        '✕'
      )
    ),
    // LUMEN sleeping pose visual
    React.createElement(
      'div',
      { style: { textAlign: 'center', padding: '16px 0 8px' } },
      React.createElement('div', { style: { fontSize: '48px', opacity: 0.7 } }, '💜'),
    ),
    // Summary text
    React.createElement(
      'div',
      {
        style: {
          padding: '0 20px 16px',
          textAlign: 'center',
          color: '#E0E0FF',
          fontSize: '14px',
          lineHeight: 1.8,
          fontStyle: 'italic',
        },
      },
      summary && summary.summaryText
    ),
    // Song recommendation card
    summary && summary.song && React.createElement(
      'div',
      {
        style: {
          margin: '0 20px 16px',
          padding: '12px',
          borderRadius: '8px',
          background: 'rgba(124, 92, 252, 0.12)',
          border: '1px solid rgba(124, 92, 252, 0.2)',
        },
      },
      React.createElement('div', { style: { fontSize: '11px', color: '#7C5CFC', marginBottom: '4px' } }, 'LUMEN 推荐的歌'),
      React.createElement('div', { style: { color: '#E0E0FF', fontSize: '14px', fontWeight: 'bold' } }, summary.song.title),
      React.createElement('div', { style: { color: '#B8A9FF', fontSize: '12px' } }, summary.song.artist),
      summary.song.recommendReason && React.createElement(
        'div',
        { style: { color: '#7C5CFC', fontSize: '11px', marginTop: '6px', fontStyle: 'italic' } },
        summary.song.recommendReason
      ),
    ),
    // Goodnight button
    React.createElement(
      'div',
      { style: { padding: '0 20px 16px', textAlign: 'center' } },
      React.createElement(
        'button',
        {
          onClick: () => setGoodnight(true),
          style: {
            padding: '8px 24px',
            borderRadius: '20px',
            border: '1px solid rgba(184, 169, 255, 0.3)',
            background: 'rgba(124, 92, 252, 0.2)',
            color: '#E0E0FF',
            fontSize: '13px',
            cursor: 'pointer',
          },
        },
        '晚安'
      )
    )
  );
}

export default SleepPanel;
