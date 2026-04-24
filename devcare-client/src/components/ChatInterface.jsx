import { useState } from 'react'

const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. Sarah Jenkins', specialty: 'General Practitioner', status: 'Online' },
  { id: 2, name: 'Dr. Marcus Webb', specialty: 'Cardiologist', status: 'Offline' },
  { id: 3, name: 'Dr. Emily Chen', specialty: 'Neurologist', status: 'Online' },
]

const MOCK_MESSAGES = {
  1: [
    { id: 1, sender: 'doctor', text: 'Hello! How can I help you today?', time: '10:00 AM' },
    { id: 2, sender: 'patient', text: 'Hi Dr. Jenkins, I have been experiencing mild headaches.', time: '10:05 AM' },
    { id: 3, sender: 'doctor', text: 'I see. How long have they been occurring?', time: '10:06 AM' },
  ],
  2: [],
  3: [],
}

export default function ChatInterface() {
  const [activeDoctor, setActiveDoctor] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(MOCK_MESSAGES)

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim() || !activeDoctor) return

    const newMessage = {
      id: Date.now(),
      sender: 'patient', // Assuming patient view for now
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => ({
      ...prev,
      [activeDoctor.id]: [...(prev[activeDoctor.id] || []), newMessage]
    }))
    setMessage('')
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
      
      {/* Sidebar: Doctor List */}
      <div className="w-1/3 border-r border-[var(--color-border)] bg-[var(--color-surface-soft)]">
        <div className="border-b border-[var(--color-border)] p-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          <p className="text-sm text-[var(--color-text-muted)]">Select a doctor to start chatting</p>
        </div>
        <div className="overflow-y-auto">
          {MOCK_DOCTORS.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setActiveDoctor(doc)}
              className={`w-full flex items-center gap-4 border-b border-[var(--color-border)] p-4 text-left transition-colors hover:bg-[var(--color-surface)] ${
                activeDoctor?.id === doc.id ? 'bg-[var(--color-surface)] border-l-4 border-l-[var(--color-primary)]' : ''
              }`}
            >
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-bold">
                  {doc.name.charAt(4)}
                </div>
                <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${doc.status === 'Online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="truncate font-semibold text-[var(--color-text)]">{doc.name}</h3>
                <p className="truncate text-sm text-[var(--color-text-muted)]">{doc.specialty}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col bg-[var(--color-surface)]">
        {activeDoctor ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] p-4">
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-bold">
                  {activeDoctor.name.charAt(4)}
                </div>
              <div>
                <h2 className="font-semibold">{activeDoctor.name}</h2>
                <p className="text-xs text-[var(--color-text-muted)]">{activeDoctor.status}</p>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages[activeDoctor.id]?.length > 0 ? (
                messages[activeDoctor.id].map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.sender === 'patient'
                          ? 'bg-[var(--color-primary)] text-white rounded-br-none'
                          : 'bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-bl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className={`mt-1 text-[10px] ${msg.sender === 'patient' ? 'text-blue-100' : 'text-[var(--color-text-muted)]'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-full items-center justify-center text-center text-[var(--color-text-muted)]">
                  <p>No messages yet.<br />Send a message to start the consultation.</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-[var(--color-border)] p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-2 focus:border-[var(--color-primary)] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--color-text-muted)]">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 opacity-50 mb-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
              <p>Select a consultation to view messages.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}