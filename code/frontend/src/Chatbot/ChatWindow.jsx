import React from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const ChatWindow = ({ messages, isTyping, onSendMessage }) => (
  <div className="flex flex-col h-full bg-white dark:bg-gray-900">
    <MessageList messages={messages} isTyping={isTyping} />
    <ChatInput onSend={onSendMessage} />
  </div>
);

export default ChatWindow;