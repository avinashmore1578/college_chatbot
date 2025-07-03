
import { useState, useEffect, useRef } from 'react';
import './index.css';

function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event) => {
        setInput(event.results[0][0].transcript);
      };
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const res = await fetch('http://127.0.0.1:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    });

    const data = await res.json();
    setResponse(data.reply);
    synthRef.current.speak(new SpeechSynthesisUtterance(data.reply));

    setHistory(prev => [...prev, {
      user: input,
      bot: data.reply,
      time: new Date().toLocaleTimeString()
    }]);

    setInput('');
    setLoading(false);
  };

  const startListening = () => {
    if (recognitionRef.current) recognitionRef.current.start();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-1/3 w-full bg-gray-900 text-white p-6 flex flex-col">
        <h1 className="text-3xl font-bold mb-4">TuljaAii 🎓</h1>
        <div className="flex gap-2 mb-4">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="p-2 text-black rounded flex-1"
          />
          <button onClick={handleSend} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
            {loading ? '...' : 'Send'}
          </button>
          <button onClick={startListening} className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded">
            🎤
          </button>
        </div>

        <div className="bg-gray-800 p-4 rounded shadow overflow-y-auto flex-1 max-h-[70vh]">
          <h2 className="text-lg font-bold mb-3">Conversation</h2>
          <div className="space-y-4">
            {history.map((h, i) => (
              <div key={i} className="space-y-1">
                <div className="flex gap-2">
                  <span className="text-blue-400">👤</span>
                  <div>
                    <p><strong>You:</strong> {h.user}</p>
                    <p className="text-sm text-gray-400">{h.time}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-6">
                  <span className="text-green-400">🤖</span>
                  <div>
                    <p><strong>Bot:</strong> {h.bot}</p>
                    <p className="text-sm text-gray-400">{h.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden md:block md:w-2/3 bg-gray-950"></div>
    </div>
  );
}

export default App;
