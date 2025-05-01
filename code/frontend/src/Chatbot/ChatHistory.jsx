import React from 'react';
import { MessageSquare, RefreshCw } from 'lucide-react';

const ChatHistory = ({ chats, onSelectChat, onClearHistory }) => (
  <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-gray-900">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Chat History</h2>
    </div>

    <div className="flex-1 overflow-y-auto">
      <div className="p-4 space-y-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 transition cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <MessageSquare className="text-blue-500 dark:text-blue-400 mt-1" size={18} />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                  {chat.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{chat.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={onClearHistory}
        className="flex items-center justify-center w-full gap-2 p-2 text-sm rounded-lg text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
      >
        <RefreshCw size={16} />
        <span>Clear History</span>
      </button>
    </div>
  </div>
);

export default ChatHistory;
