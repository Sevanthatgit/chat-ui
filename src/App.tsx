import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, FileUp, X, Image as ImageIcon, FileText, Paperclip, Mic, MicOff, Globe, ChevronDown } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  file?: {
    name: string;
    type: string;
    url: string;
  };
}

interface Language {
  name: string;
  code: string;
}

const languages: Language[] = [
  { name: 'English', code: 'en-IN' },
  { name: 'Kannada', code: 'kn-IN' },
  { name: 'Hindi', code: 'hi-IN' },
  { name: 'Malayalam', code: 'ml-IN' },
  { name: 'Telugu', code: 'te-IN' },
  { name: 'Tamil', code: 'ta-IN' },
];

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [showInputLanguageSelect, setShowInputLanguageSelect] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputLanguageRef = useRef<HTMLDivElement>(null);

  // Close language dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputLanguageRef.current && !inputLanguageRef.current.contains(event.target as Node)) {
        setShowInputLanguageSelect(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = selectedLanguage.code;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    let fileData;
    if (selectedFile) {
      fileData = {
        name: selectedFile.name,
        type: selectedFile.type,
        url: URL.createObjectURL(selectedFile)
      };
    }

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: input || `Sent file: ${selectedFile?.name}`,
      sender: 'user',
      file: fileData
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: fileData 
          ? `I've received your file: ${fileData.name}. How would you like me to help you with it?`
          : "I'm a demo AI assistant. This is a simulated response to demonstrate the UI.",
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm p-3 sm:p-4 shadow-lg border-b border-gray-700 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto px-2">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-white">AI Assistant</h1>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowLanguageSelect(!showLanguageSelect)}
              className="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{selectedLanguage.name}</span>
            </button>
            {showLanguageSelect && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setShowLanguageSelect(false);
                    }}
                    className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors ${
                      selectedLanguage.code === lang.code ? 'text-blue-400' : 'text-gray-300'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div 
        className={`flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 max-w-4xl mx-auto w-full transition-colors
          ${isDragging ? 'bg-blue-500/10' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4 min-h-full pb-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-2 animate-slideIn ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
                ${message.sender === 'user' ? 'bg-blue-500' : 'bg-gray-700'}`}>
                {message.sender === 'user' ? 
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : 
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                }
              </div>
              <div className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg max-w-[85%] sm:max-w-[80%] break-words ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-100'
              }`}>
                <p className="text-sm sm:text-base mb-2">{message.text}</p>
                {message.file && (
                  <div className="mt-2 p-2 bg-black/20 rounded-lg">
                    {message.file.type.startsWith('image/') ? (
                      <img 
                        src={message.file.url} 
                        alt={message.file.name}
                        className="max-w-full rounded-lg max-h-48 sm:max-h-60 object-contain"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-xs sm:text-sm truncate">{message.file.name}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <div className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-gray-800">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="border-t border-gray-800 bg-gray-800/50 p-2">
          <div className="max-w-4xl mx-auto px-2">
            <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-lg">
              {getFileIcon(selectedFile.type)}
              <span className="text-xs sm:text-sm text-gray-300 flex-1 truncate">{selectedFile.name}</span>
              <button
                onClick={removeSelectedFile}
                className="text-gray-400 hover:text-gray-200 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form 
        onSubmit={handleSubmit}
        className="border-t border-gray-800 bg-gray-900 p-2 sm:p-4 sticky bottom-0"
      >
        <div className="max-w-4xl mx-auto flex space-x-2 sm:space-x-4 px-2">
          <div className="flex-1 flex">
            <div className="relative" ref={inputLanguageRef}>
              <button
                type="button"
                onClick={() => setShowInputLanguageSelect(!showInputLanguageSelect)}
                className="h-full px-3 bg-gray-800 rounded-l-lg border-r border-gray-700 hover:bg-gray-700 transition-colors flex items-center space-x-1"
              >
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300 hidden sm:inline">{selectedLanguage.name}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showInputLanguageSelect && (
                <div className="absolute bottom-full mb-1 left-0 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setShowInputLanguageSelect(false);
                      }}
                      className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors ${
                        selectedLanguage.code === lang.code ? 'text-blue-400' : 'text-gray-300'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Type your message in ${selectedLanguage.name}...`}
              className="flex-1 bg-gray-800 text-white text-sm sm:text-base px-3 py-2 sm:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow border-r border-gray-700"
            />
            <button
              type="button"
              onClick={toggleVoiceInput}
              className="px-2 sm:px-3 bg-gray-800 hover:bg-gray-700 transition-colors border-r border-gray-700"
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
              ) : (
                <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              )}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 sm:px-3 bg-gray-800 hover:bg-gray-700 transition-colors rounded-r-lg"
              aria-label="Attach file"
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              aria-label="File input"
            />
          </div>
          <button
            type="submit"
            disabled={(!input.trim() && !selectedFile) || isLoading}
            className="bg-blue-600 text-white p-2 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </form>

      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center pointer-events-none z-50">
          <div className="bg-blue-500/10 p-6 sm:p-8 rounded-lg border-2 border-dashed border-blue-500 mx-4">
            <FileUp className="w-8 h-8 sm:w-12 sm:h-12 text-blue-400 mx-auto mb-2" />
            <p className="text-blue-400 text-base sm:text-lg font-medium text-center">Drop your file here</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;