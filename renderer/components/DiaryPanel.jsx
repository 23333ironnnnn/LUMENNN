import React, { useState, useEffect } from 'react';

const EMOTION_LABELS = {
  tired: '疲倦',
  happy: '开心',
  sad: '难过',
  angry: '烦躁',
  confused: '困惑',
  anxious: '不安',
  neutral: '平静',
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
    return (
      <div style={styles.container}>
        <span style={{ color: '#B8A9FF', fontSize: '12px' }}>LOADING...</span>
      </div>
    );
  }

  const recentDays = diary ? [...diary.days].reverse().slice(0, 10) : [];
  const tags = diary ? diary.userTags : {};

  return (
    <div style={styles.container}>
      {/* Title bar */}
      <div style={styles.titleBar}>
        <div style={styles.titleLeft}>
          <span style={styles.titleIcon}>◆</span>
          <span style={styles.titleText}>diary.exe</span>
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
          <span style={styles.statLabel}>MEMORY SCAN :</span>
          <span style={styles.statValue}>COMPLETE</span>
          <span style={styles.statLabel}> ENTRIES :</span>
          <span style={styles.statValue}>{recentDays.length}</span>
          <span style={styles.statLabel}> TAGS :</span>
          <span style={styles.statValue}>{Object.keys(tags).length}</span>
        </div>
        <div style={styles.divider}>{'─'.repeat(50)}</div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Tags section */}
        <div style={styles.tagsSection}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>◆</span>
            LUMEN 还在了解你
            <span style={styles.sectionDivider}>{'─'.repeat(30)}</span>
          </div>
          <div style={styles.tagsContainer}>
            {Object.entries(tags).map(([tag, count]) => (
              <span key={tag} style={styles.tag}>
                [{tag}] ×{count}
              </span>
            ))}
            {Object.keys(tags).length === 0 && (
              <span style={styles.emptyText}>[ 暂无标签 ]</span>
            )}
          </div>
        </div>

        {/* Days list */}
        <div style={styles.daysSection}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>◆</span>
            情绪日记
            <span style={styles.sectionDivider}>{'─'.repeat(35)}</span>
          </div>
          <div style={styles.daysList}>
            {recentDays.length === 0 ? (
              <div style={styles.emptyText}>[ 暂无记录 ]</div>
            ) : (
              recentDays.map((day, i) => (
                <div key={i} style={styles.dayItem}>
                  <div style={styles.dayHeader}>
                    <span style={styles.dayDate}>{day.date}</span>
                    <span style={styles.dayEmotion}>
                      — {EMOTION_LABELS[day.mainEmotion] || day.mainEmotion}
                    </span>
                  </div>
                  {day.conversations && day.conversations.length > 0 && (
                    <div style={styles.conversations}>
                      {day.conversations.slice(0, 3).map((c, j) => (
                        <span key={j} style={styles.conversation}>
                          {c.summary || '日常聊天'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
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
  systemInfo: {
    padding: '10px 16px',
    borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
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
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px',
  },
  tagsSection: {
    marginBottom: '16px',
  },
  sectionHeader: {
    marginBottom: '8px',
    color: '#B8A9FF',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  sectionIcon: {
    color: '#B8A9FF',
    fontSize: '12px',
  },
  sectionDivider: {
    color: '#D4AF37',
    fontSize: '8px',
    marginLeft: '6px',
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  tag: {
    padding: '3px 8px',
    border: '1px solid #D4AF37',
    background: 'rgba(212, 175, 55, 0.1)',
    color: '#B8A9FF',
    fontSize: '9px',
  },
  emptyText: {
    color: '#7C5CFC',
    fontSize: '9px',
    fontStyle: 'italic',
  },
  daysSection: {
    flex: 1,
  },
  daysList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  dayItem: {
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
    paddingBottom: '8px',
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  dayDate: {
    color: '#B8A9FF',
    fontSize: '10px',
  },
  dayEmotion: {
    color: '#E0E0FF',
    fontSize: '10px',
  },
  conversations: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  conversation: {
    padding: '2px 6px',
    background: 'rgba(184, 169, 255, 0.1)',
    color: '#7C5CFC',
    fontSize: '8px',
    border: '1px solid rgba(184, 169, 255, 0.2)',
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

export default DiaryPanel;
