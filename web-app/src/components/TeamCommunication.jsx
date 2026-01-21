import { useState, useEffect } from 'react';
import { Phone, Mail, Send, Search } from 'lucide-react';

export function TeamCommunication() {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Michael Peter', role: 'Admin', avatar: 'MP', status: 'online' },
    { id: 2, name: 'AWOLUSI TUNMISE', role: 'Visa', avatar: 'AT', status: 'online' },
    { id: 3, name: 'ALUKO BLESSING ENE', role: 'HR', avatar: 'AB', status: 'offline' },
    { id: 4, name: 'OKEKE PRECIOUS', role: 'Admission', avatar: 'OP', status: 'online' },
  ]);

  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Michael Peter', text: 'Hello, how are you?', timestamp: '10:30 AM', isOwn: false },
    { id: 2, sender: 'You', text: 'I am doing well, thanks!', timestamp: '10:31 AM', isOwn: true },
  ]);
  const [messageText, setMessageText] = useState('');
  const [searchText, setSearchText] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'You',
        text: messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
      };
      setMessages([...messages, newMessage]);
      setMessageText('');
    }
  };

  const handleCall = () => {
    alert(`Calling ${selectedContact.name}...`);
  };

  const handleEmail = () => {
    alert(`Opening email to ${selectedContact.name}...`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Contacts Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Team Communication</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs font-semibold text-gray-600 px-2 py-2">Available Contacts ({filteredContacts.length})</p>
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  selectedContact.id === contact.id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {contact.avatar}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        contact.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900 text-sm">{contact.name}</p>
                    <p className="text-xs text-gray-600">{contact.role}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {selectedContact.avatar}
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">{selectedContact.name}</p>
              <p className="text-xs text-gray-600">{selectedContact.role}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCall}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Call"
            >
              <Phone size={20} className="text-green-600" />
            </button>
            <button
              onClick={handleEmail}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Email"
            >
              <Mail size={20} className="text-blue-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.isOwn
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-900 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-gray-600'}`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Send size={18} />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
