import React, { useRef, useEffect, useMemo } from 'react';
import MessageItem from './MessageItem';

/**
 * MessageList component renders chat messages and a typing indicator.
 * It prepends a persistent welcome message at the start of every session.
 */
const MessageList = ({ messages, isTyping }) => {
  const endRef = useRef(null);

  // Define the default welcome prompt
  const defaultMessage = useMemo(() => ({
    id: 'default',
    sender: 'bot',
    content: 'How can I help you?'
  }), []);

  // Always include default message at the beginning
  const displayMessages = useMemo(() => [defaultMessage, ...messages], [messages, defaultMessage]);

  // Auto-scroll to bottom whenever the visible list or typing indicator changes
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {displayMessages.map(m => (
        <MessageItem key={m.id} message={m} />
      ))}

      {isTyping && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="bot-typing-animation">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </span>
          </div>
        </div>
      )}

      <div ref={endRef} className="h-4" />
    </div>
  );
};

export default MessageList;
