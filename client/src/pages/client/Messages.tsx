// pages/client/Messages.tsx
import React, { useState } from 'react';
import { MessageCircle, Search, Send, Paperclip, Phone, Video, MoreVertical } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const ClientMessages = () => {
  const [selectedChat, setSelectedChat] = useState('1');
  const [newMessage, setNewMessage] = useState('');

  const conversations = [
    {
      id: '1',
      plannerName: 'Maria Santos',
      company: 'Creative Events PH',
      lastMessage: 'Perfect! I\'ll prepare the floral arrangements mockup for you.',
      timestamp: '2 min ago',
      unread: 0,
      online: true,
      avatar: 'MS'
    },
    {
      id: '2',
      plannerName: 'Carlos Mendoza',
      company: 'Seaside Weddings Co.',
      lastMessage: 'When would be a good time to discuss the menu options?',
      timestamp: '1 hour ago',
      unread: 2,
      online: false,
      avatar: 'CM'
    },
    {
      id: '3',
      plannerName: 'Ana Rodriguez',
      company: 'Elegant Moments',
      lastMessage: 'I\'ve attached the venue photos you requested.',
      timestamp: '1 day ago',
      unread: 0,
      online: true,
      avatar: 'AR'
    }
  ];

  const messages = [
    {
      id: '1',
      sender: 'planner',
      message: 'Hi! I hope you\'re doing well. I wanted to follow up on our discussion about the floral arrangements for your wedding.',
      timestamp: '10:30 AM',
      isRead: true
    },
    {
      id: '2',
      sender: 'client',
      message: 'Hello Maria! Yes, we\'re still interested in the garden theme with roses and peonies.',
      timestamp: '10:35 AM',
      isRead: true
    },
    {
      id: '3',
      sender: 'planner',
      message: 'Wonderful! I have some beautiful arrangements in mind. Would you prefer a more romantic or modern approach?',
      timestamp: '10:40 AM',
      isRead: true
    },
    {
      id: '4',
      sender: 'client',
      message: 'We\'re leaning towards romantic. Soft colors with lots of greenery.',
      timestamp: '10:45 AM',
      isRead: true
    },
    {
      id: '5',
      sender: 'planner',
      message: 'Perfect! I\'ll prepare the floral arrangements mockup for you.',
      timestamp: '10:47 AM',
      isRead: false
    }
  ];

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Send message logic here
      setNewMessage('');
    }
  };

  return (
    <DashboardLayout 
      title="Messages"
      subtitle="Communicate with your wedding planners"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Search Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedChat(conversation.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedChat === conversation.id ? 'bg-pink-50 border-r-2 border-r-pink-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {conversation.avatar}
                    </div>
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.plannerName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.company}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-xs text-gray-500">{conversation.timestamp}</p>
                        {conversation.unread > 0 && (
                          <span className="mt-1 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-pink-600 rounded-full">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedConversation.avatar}
                    </div>
                    {selectedConversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedConversation.plannerName}</h3>
                    <p className="text-sm text-gray-500">{selectedConversation.company}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'client'
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'client' ? 'text-pink-100' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-end space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-800">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                      rows={1}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    className="p-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation from the list to start messaging.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientMessages;