// src/hooks/useChat.js
import { useState, useCallback, useContext } from 'react';
import { generateId } from '../utils/chatUtils';
import { ProjectContext } from '../project-view/project-context';

const API_URL = 'http://127.0.0.1:5000/api/message';

const useChat = () => {
  const { project } = useContext(ProjectContext);
  const [chatState, setChatState] = useState({ messages: [], isTyping: false });

  const addMessage = useCallback((content, sender) => {
    const msg = { id: generateId(), content, sender, timestamp: new Date() };
    setChatState(prev => ({ ...prev, messages: [...prev.messages, msg] }));
    return msg;
  }, []);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    const projectId = project?.id;
    if (!projectId) {
      console.error('No project ID available for chat request.');
      return;
    }

    addMessage(content, 'user');
    setChatState(prev => ({ ...prev, isTyping: true }));

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, message: content }),
      });

      const payload = await res.json();
      if (!res.ok) {
        console.error('API error payload:', payload);
        throw new Error(payload.error || res.statusText);
      }

      addMessage(payload.response, 'bot');
    } catch (err) {
      console.error('Chat API error:', err.message);
      addMessage('Sorry, something went wrong. Please try again.', 'bot');
    } finally {
      setChatState(prev => ({ ...prev, isTyping: false }));
    }
  }, [addMessage, project]);

  const clearChat = useCallback(() => {
    setChatState({ messages: [], isTyping: false });
  }, []);

  return { ...chatState, sendMessage, clearChat };
};

export default useChat;
