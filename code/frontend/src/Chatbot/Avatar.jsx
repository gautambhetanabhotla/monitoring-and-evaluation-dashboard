import React from 'react';
import { Bot, User } from 'lucide-react';

const Avatar = ({ type, size = 28 }) => (
  <div
    className={`flex items-center justify-center rounded-full \
      ${type === 'bot'
        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
        : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'}
    `}
    style={{ width: size, height: size }}
  >
    {type === 'bot' ? <Bot size={size * 0.65} /> : <User size={size * 0.65} />}
  </div>
);

export default Avatar;
