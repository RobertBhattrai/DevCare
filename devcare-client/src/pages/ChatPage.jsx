import ChatInterface from '../components/ChatInterface'
import Navbar from '../components/Navbar'

function ChatPage() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="site-container py-10">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            Consultations
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Live Doctor Chat
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Connect securely with healthcare professionals in real-time.
          </p>
        </div>

        {/* Chat UI Component */}
        <ChatInterface />
      </main>
    </div>
  )
}

export default ChatPage