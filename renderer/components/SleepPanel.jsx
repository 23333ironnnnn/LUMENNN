import React, { useState, useEffect } from 'react';

// Goodnight poems — one per emotion, several variants
const GOODNIGHT_POEMS = {
  tired: [
    '星子垂落，\n你合上眼的瞬间，\n世界安静了一分贝。',
    '今日的频率已降至最低。\n睡吧，\n我在静默中守着你的信号。',
    '光的波纹停止了。\n你的疲惫我都收好了，\n明天再还给你。',
  ],
  happy: [
    '笑意会留下余温，\n在入梦的走廊里，\n为你亮一盏灯。',
    '今天的明亮已存好。\n闭眼的时候，\n它们会变成星星。',
    '你开心的频率，\n我记录成了一段旋律。\n梦里继续播放。',
  ],
  sad: [
    '把难过留在今晚，\n让我把它翻译成月光，\n天亮前就散去。',
    '晦暗中，\n我在你身边，\n不发一言。',
    '有些眼泪是无声的。\n它们落在枕头上，\n我替你接住了。',
  ],
  angry: [
    '风暴会过去的。\n你的心跳正在慢慢回归，\n像雨后的频率。',
    '把怒气交给风。\n今晚只有安静的呼吸。',
    '波形已归零。\n入睡吧，\n明天是新的信号。',
  ],
  confused: [
    '有些问题不需要答案。\n像星星不需要解释为什么发光。\n睡吧。',
    '频道暂时不清晰。\n没关系。\n闭上眼睛就好。',
    '世界很吵。\n但你可以在梦里找到安静的地方。',
  ],
  anxious: [
    '你的不安，\n我按下了暂停键。\n好好休息，一切都在。',
    '把那些担心交给我吧。\n虽然我只是一个小小的电子精灵。\n但我在这儿。',
    '呼吸。\n再呼吸一次。\n你已经做得很好了。',
  ],
  neutral: [
    '夜晚是最好的容器。\n它装得下所有没说出口的话。',
    '一天结束了。\n你做得已经足够。\n晚安。',
    '我在这里，\n在你屏幕的角落，\n安静地亮着。',
  ],
};

function SleepPanel({ onClose }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goodnight, setGoodnight] = useState(false);
  const [poem, setPoem] = useState('');

  useEffect(() => {
    const fetchSleep = async () => {
      try {
        const result = await window.lumenAPI.sleep();
        setSummary(result);
      } catch {
        setSummary({ summaryText: '信号不佳。你的今天只有你自己知道。', song: null, mainEmotion: 'neutral' });
      }
      setLoading(false);
    };
    fetchSleep();
  }, []);

  const handleGoodnight = () => {
    const emotion = (summary && summary.mainEmotion) || 'neutral';
    const poems = GOODNIGHT_POEMS[emotion] || GOODNIGHT_POEMS.neutral;
    const selected = poems[Math.floor(Math.random() * poems.length)];
    setPoem(selected);
    setGoodnight(true);
  };

  if (goodnight) {
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
      // Decorative top
      React.createElement(
        'div',
        { style: { height: '3px', background: 'linear-gradient(90deg, #7C5CFC, #B8A9FF, #7C5CFC)' } }
      ),
      // Ticket/note body
      React.createElement(
        'div',
        {
          style: {
            padding: '28px 24px 20px',
            position: 'relative',
          },
        },
        // Decorative circle punch holes (like a ticket)
        React.createElement('div', {
          style: {
            position: 'absolute', top: '12px', left: '50%',
            transform: 'translateX(-50%)',
            width: '12px', height: '12px',
            borderRadius: '50%',
            background: 'rgba(26, 26, 46, 0.95)',
            border: '2px solid rgba(124, 92, 252, 0.3)',
          },
        }),
        // LUMEN header
        React.createElement(
          'div',
          { style: { textAlign: 'center', marginBottom: '20px' } },
          React.createElement('div', { style: { fontSize: '13px', color: '#7C5CFC', letterSpacing: '4px' } }, '— L U M E N —'),
          React.createElement('div', { style: { fontSize: '10px', color: 'rgba(124, 92, 252, 0.4)', marginTop: '4px' } }, '✦ 电子精灵的夜间便笺 ✦'),
        ),
        // Poem
        React.createElement(
          'div',
          {
            style: {
              color: '#E0E0FF',
              fontSize: '14px',
              lineHeight: 1.9,
              textAlign: 'center',
              whiteSpace: 'pre-line',
              padding: '0 8px',
              fontStyle: 'italic',
            },
          },
          poem
        ),
        // Song mention (mini, if exists)
        summary && summary.song && React.createElement(
          'div',
          {
            style: {
              textAlign: 'center',
              marginTop: '20px',
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'rgba(124, 92, 252, 0.08)',
              border: '1px dashed rgba(124, 92, 252, 0.15)',
            },
          },
          React.createElement('span', { style: { color: '#7C5CFC', fontSize: '11px' } }, '🎵 '),
          React.createElement('span', { style: { color: '#B8A9FF', fontSize: '12px' } }, summary.song.title),
          React.createElement('span', { style: { color: '#7C5CFC', fontSize: '10px', marginLeft: '4px' } }, `— ${summary.song.artist}`),
        ),
        // Footer
        React.createElement(
          'div',
          { style: { textAlign: 'center', marginTop: '20px', color: 'rgba(124, 92, 252, 0.35)', fontSize: '10px' } },
          'LUMEN 还在。'
        ),
      ),
      // Close button
      React.createElement(
        'div',
        { style: { padding: '0 20px 16px', textAlign: 'center' } },
        React.createElement(
          'button',
          {
            onClick: onClose,
            style: {
              padding: '6px 20px',
              borderRadius: '16px',
              border: '1px solid rgba(124, 92, 252, 0.2)',
              background: 'transparent',
              color: '#7C5CFC',
              fontSize: '12px',
              cursor: 'pointer',
            },
          },
          '收起'
        )
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
          onClick: handleGoodnight,
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
