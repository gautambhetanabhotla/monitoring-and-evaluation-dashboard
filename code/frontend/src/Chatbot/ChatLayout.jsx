import React from 'react';
import ChatHeader from './ChatHeader';
import ChatWindow from './ChatWindow';
import useChat from '../hooks/useChat';

const ChatLayout = () => {
  const { messages, isTyping, sendMessage, clearChat } = useChat();

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <ChatHeader clearChat={clearChat} />
        <ChatWindow 
          messages={messages} 
          isTyping={isTyping} 
          onSendMessage={sendMessage} 
        />
      </div>
    </div>
  );
};

export default ChatLayout;