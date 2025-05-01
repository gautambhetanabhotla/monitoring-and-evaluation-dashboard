import React from 'react';
import ReactMarkdown from 'react-markdown';
import Avatar from './Avatar';
import { formatTimestamp } from '../utils/chatUtils';

const MessageItem = ({ message }) => {
  const isBot = message.sender === 'bot';
  return (
    <div className={`flex items-start gap-3 animate-fadeIn ${isBot ? '' : 'flex-row-reverse'}`}>      
      <Avatar type={message.sender} />
      <div className={`group relative max-w-[75%] px-4 py-2 rounded-xl \
        ${isBot      ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 prose dark:prose-invert prose-sm rounded-tl-none'      : 'bg-blue-500 dark:bg-blue-600 text-white rounded-tr-none'      }
      `}>
        {isBot 
          ? <ReactMarkdown>{message.content}</ReactMarkdown>         
          : <p className="text-sm sm:text-base break-words">{message.content}</p>
        }
        <span className={`absolute bottom-0 ${isBot ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap`}>
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default MessageItem;

