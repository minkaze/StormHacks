import React, { useState } from 'react';

interface Message {
  text: string;
  isAI?: boolean;
}

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to UI
    setMessages(prev => [...prev, { text: input }]);
    setLoading(true);

    try {
      // Call your backend AI endpoint
      const response = await fetch('/api/chat/ai-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();

      if (data.reply) {
        setMessages(prev => [...prev, { text: data.reply, isAI: true }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { text: 'Sorry, AI reply failed.', isAI: true }]);
    }

    setInput('');
    setLoading(false);
  };

  return (
    <div className="chat-box">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.isAI ? 'ai-message' : 'user-message'}>
            {msg.text}
          </div>
        ))}
        {loading && <div>AI is thinking...</div>}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && sendMessage()}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage} disabled={loading}>Send</button>
    </div>
  );
};

export default ChatBox;