import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, Minimize2, Paperclip, RotateCcw } from 'lucide-react';
import './App.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://chat-backend-574509643233.us-east4.run.app';

const generateId = () => Math.random().toString(36).substr(2, 9);

const ModelSelector = ({ models, selectedModel, onModelChange }) => (
  <select
    value={selectedModel}
    onChange={(e) => onModelChange(e.target.value)}
    className="w-full p-2 border border-secondary rounded bg-white text-sm"
  >
    {models.map((model) => (
      <option key={model.id} value={model.id}>
        {model.name}
      </option>
    ))}
  </select>
);

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const initialMessage = {
    id: 'initial-message',
    content: "Hi!👋 I'm DVA, Duncan's Virtual Assistant. He built me from scratch!\n\nAsk me anything!",
    type: 'text',
    isUser: false
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([initialMessage]);
    }
  }, [isOpen]);

  const models = [
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
    { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic' },
    { id: 'gemini-1.5-flash', name: 'Google Gemini 1.5 Flash', provider: 'google' },
    { id: 'gemini-1.5-pro', name: 'Google Gemini 1.5 Pro', provider: 'google' },
    { id: 'gemini-1.0-pro', name: 'Google Gemini 1.0 Pro', provider: 'google' },
    { id: 'llama-3.1-sonar-large-128k-chat', name: 'Llama 3.1 Sonar Large', provider: 'perplexity' },
    { id: 'llama-3.1-sonar-small-128k-chat', name: 'Llama 3.1 Sonar Small', provider: 'perplexity' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
  
    const newMessage = { id: generateId(), content: input, type: 'text', isUser: true };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);
  
    try {
      const response = await axios.post(`${BACKEND_URL}/api/chat`, { 
        message: input, 
        model: selectedModel,
      });
      const aiMessage = { id: generateId(), content: response.data.message, type: 'text', isUser: false };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      let errorMessage = 'An error occurred. Please try again.';
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your internet connection.';
      }
      setMessages((prev) => [...prev, { id: generateId(), content: errorMessage, type: 'text', isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;
      let messageType;

      if (file.type.startsWith('image/')) {
        messageType = 'image';
      } else if (file.type.startsWith('audio/')) {
        messageType = 'audio';
      } else {
        messageType = 'file';
      }

      const newMessage = { id: generateId(), content: fileContent, type: messageType, isUser: true };
      setMessages((prev) => [...prev, newMessage]);
    };

    if (file.type.startsWith('image/') || file.type.startsWith('audio/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const restartChat = () => {
    setMessages([initialMessage]);
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="App">
      {!isOpen && (
        <button 
          onClick={toggleChat} 
          className={`fixed bottom-5 right-5 w-14 h-14 rounded-full bg-secondary text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-opacity-90 z-50}`}
          aria-label="Open chat"        
        >
          <MessageCircle size={24} />
        </button>
      )}
      <div className={`fixed bottom-0 right-0 md:right-10 w-full md:w-96 h-full md:h-[600px] bg-white rounded-t-xl shadow-2xl transition-all duration-300 ease-in-out z-40 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex flex-col h-full">
          <div className="bg-primary text-white p-4 rounded-t-xl flex justify-between items-center">
            <h2 className="text-xl font-semibold">Duncan's Virtual Assistant</h2>
            <div className="flex space-x-2">
              <button 
                onClick={restartChat}
                className="p-2 rounded-full hover:bg-opacity-80 transition-colors duration-200"
                title="Restart Chat"
                aria-label='Restart Chat'
              >
                <RotateCcw size={18} />
              </button>
              <button 
                onClick={toggleChat}
                className="minimize-button" 
                title="Minimize Chat"
                aria-label='Minimize Chat'
              >
                <Minimize2 size={18} />
              </button>
            </div>
          </div>
          <div className="p-3 bg-background">
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-white">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl 
                  ${message.isUser ? 'bg-secondary text-white border-r-4 border-r-border shadow-md' : 'bg-message-bg text-text border-l-4 border-l-secondary shadow-md'}`}>
                  {message.type === 'text' && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
                  {message.type === 'image' && <img src={message.content} alt="User uploaded" className="rounded-lg mt-2 max-w-full" />}
                  {message.type === 'file' && <a href={message.content} download className="text-blue-700 underline text-sm">Download File</a>}
                  {message.type === 'audio' && <audio controls src={message.content} className="mt-2 w-full"></audio>}
                </div>
              </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-message-bg text-text p-3 rounded-2xl text-sm">
                DVA is typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="p-4 bg-background flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className='flex-grow p-2 border border-secondary rounded-full focus:outline-none focus:ring-2 focus:ring-secondary'
            aria-label='Type your message'
          />
          {/* <label htmlFor="file-upload" className="p-2 bg-white text-primary rounded-full cursor-pointer hover:bg-opacity-80 transition-colors duration-200">
            <Paperclip size={18} />
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            accept="image/*,audio/*,.txt,.pdf,.doc,.docx"
            className='hidden'
          /> */}
          <button 
            type="submit" 
            disabled={isLoading}
            className='p-2 bg-secondary text-white rounded-full hover:bg-opacity-80 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed'
            aria-label='Send message'
            >Send</button>
        </form>
      </div>
    </div>
    </div>
  );
}

export default App;