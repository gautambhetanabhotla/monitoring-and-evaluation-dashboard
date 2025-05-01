// ChatInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';

const ChatInput = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed) {
      onSend(trimmed);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const autoResize = () => {
    const el = inputRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
    >
      <div className="flex items-end gap-2 relative rounded-lg border border-gray-300 dark:border-gray-600 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            autoResize();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 max-h-[150px] py-3 pl-4 pr-10 bg-transparent border-none focus:ring-0 resize-none text-sm sm:text-base text-gray-800 dark:text-gray-200"
          rows={1}
        />
        {message && (
          <button
            type="button"
            onClick={() => setMessage('')}
            className="absolute right-12 bottom-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20 } />
          </button>
        )}
        <button
          type="submit"
          disabled={!message.trim()}
          className={`p-3 rounded-md text-white transition-colors ${
            message.trim()
              ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
              : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
          }`}
        >
          <Send size={23} />
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Press Enter to send, Shift+Enter for a new line
      </p>
    </form>
  );
};

export default ChatInput;
