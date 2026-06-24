import React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  return React.createElement('div', { style: { color: '#E0E0FF', padding: '20px' } }, '✨ LUMEN');
};

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));
