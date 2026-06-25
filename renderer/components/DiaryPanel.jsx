import React, { useState, useEffect } from 'react';

const EMOTION_LABELS = {
  tired: '😔 疲倦',
  happy: '😊 开心',
  sad: '😢 难过',
  angry: '😤 烦躁',
  confused: '🤔 困惑',
  anxious: '😰 不安',
  neutral: '— 平静',
};

function DiaryPanel({ onClose }) {
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiary = async () => {
      try {
        const data = await window.lumenAPI.getDiary();
        setDiary(data);
      } catch {
        setDiary({ days: [], userTags: {} });
      }
      setLoading(false);
    };
    fetchDiary();
  }, []);

  if (loading) {
    return React.createElement(
      'div',
      { style: { width: '340px', padding: '60px 20px', textAlign: 'center', color: '#7C5CFC', fontSize: '13px' } },
      '读取记忆中…'
    );
  }

  const recentDays = diary ? [...diary.days].reverse().slice(0, 7) : [];
  const tags = diary ? diary.userTags : {};

  return React.createElement(
    'div',
    {
      style: {
        width: '340px',
        maxHeight: '500px',
        background: 'rgba(26, 26, 46, 0.95)',
        border: '1px solid rgba(124, 92, 252, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
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
      React.createElement('span', { style: { color: '#B8A9FF', fontSize: '13px', fontWeight: 'bold' } }, '📖 情绪日记'),
      React.createElement(
        'button',
        {
          onClick: onClose,
          style: { background: 'none', border: 'none', color: '#B8A9FF', cursor: 'pointer', fontSize: '16px' },
        },
        '✕'
      )
    ),
    // Tag cloud
    React.createElement(
      'div',
      {
        style: {
          padding: '10px 14px',
          borderBottom: '1px solid rgba(124, 92, 252, 0.1)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
        },
      },
      Object.entries(tags).map(([tag, count]) =>
        React.createElement(
          'span',
          {
            key: tag,
            style: {
              padding: '2px 8px',
              borderRadius: '10px',
              background: 'rgba(124, 92, 252, 0.15)',
              color: '#B8A9FF',
              fontSize: '11px',
            },
          },
          `${tag} (${count})`
        )
      ),
      Object.keys(tags).length === 0 && React.createElement(
        'span', { style: { color: '#7C5CFC', fontSize: '11px' } }, 'LUMEN 还在了解你'
      )
    ),
    // Day list
    React.createElement(
      'div',
      { style: { flex: 1, overflowY: 'auto', padding: '10px 0' } },
      recentDays.length === 0
        ? React.createElement(
            'div',
            { style: { padding: '20px', textAlign: 'center', color: '#7C5CFC', fontSize: '12px' } },
            '还没有记录。来聊天吧。'
          )
        : recentDays.map((day, i) =>
            React.createElement(
              'div',
              {
                key: i,
                style: {
                  padding: '8px 14px',
                  borderBottom: '1px solid rgba(124, 92, 252, 0.05)',
                },
              },
              React.createElement(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' } },
                React.createElement('span', { style: { color: '#B8A9FF', fontSize: '12px' } }, day.date),
                React.createElement(
                  'span',
                  { style: { color: '#E0E0FF', fontSize: '12px' } },
                  EMOTION_LABELS[day.mainEmotion] || day.mainEmotion
                )
              ),
              React.createElement(
                'div',
                { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' } },
                day.conversations.slice(0, 3).map((c, j) =>
                  React.createElement(
                    'span',
                    {
                      key: j,
                      style: {
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'rgba(184, 169, 255, 0.08)',
                        color: '#7C5CFC',
                        fontSize: '10px',
                      },
                    },
                    c.summary
                  )
                )
              )
            )
          )
    ),
  );
}

export default DiaryPanel;
