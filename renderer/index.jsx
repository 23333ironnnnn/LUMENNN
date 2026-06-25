import React from 'react';
import { createRoot } from 'react-dom/client';
import LumenCanvas from './components/LumenCanvas';

const App = () => {
  return React.createElement('div', { style: { textAlign: 'center' } },
    React.createElement(LumenCanvas, { animation: 'idle' })
  );
};

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));
