import { useState, useRef, useEffect } from 'react'
import OpenAI from 'openai'
import Popup from './components/popups/PopupAI'

function App() {
  const [apiKey, setApiKey] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const popupRef = useRef(null);
  const clientRef = useRef(null);

  const getKey = (apiKey) => {
    setApiKey(apiKey);
  };

  const scrollToMsgBottom = () => {
    const messageBox = document.querySelector('.message-wrapper-js');
    if (messageBox) {
      messageBox.scrollTo({
        top: messageBox.scrollHeight + 500,
        behavior: 'smooth'
      });
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!userMessage.trim()) return; // Prevent sending empty messages

    try {
      setDisabled(true); // Disable button to prevent multiple submissions

      const userMessages = [
        ...messages,
        { role: 'user', content: userMessage },
      ];
      setMessages([
        ...userMessages,
        { role: 'assistant', content: 'typing...' },
      ]);
      setUserMessage(''); // Clear input field after sending message

      scrollToMsgBottom();

      const chatCompletion = await clientRef.current.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: userMessages,
        stream: true
      });

      for await (const chunk of chatCompletion) {
        const botMessage = chunk.choices[0].delta.content || '';
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            return [
              ...prevMessages.slice(0, -1),
              {
                ...lastMessage,
                content: lastMessage.content === 'typing...' ? botMessage : lastMessage.content + botMessage
              },
            ];
          }
          return [...prevMessages, { role: 'assistant', content: botMessage }];
        });
      }
    } catch (error) {
      alert(`Failed to fetch data: ${error.message || error}`);
    } finally {
      setDisabled(false);
    }
  };

  const clearChat = () => {
    if (messages.length === 0) return;

    const confirmed = window.confirm('Bạn có chắc muốn xóa chat hiện tại?');
    if (!confirmed) return;

    setMessages([]);
    localStorage.removeItem('appMessages');
  };

  useEffect(() => {
    const storedMessages = localStorage.getItem('appMessages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }

    if (popupRef.current) {
      popupRef.current.togglePopup(true)
    }
  }, []);

  useEffect(() => {
    if (apiKey) {
      console.log('API Key set:', apiKey);

      clientRef.current = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true, // Only use this in development
      });

      clientRef.current.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
        stream: true
      }).catch(error => {
        alert("Failed to fetch data: " + (error.message));
        setDisabled(true);
      });
    }
  }, [apiKey]);

  useEffect(() => {
    console.log('Messages updated:', messages);
    if (messages.length) {
      localStorage.setItem('appMessages', JSON.stringify(messages));
    }
  }, [messages]);

  return (
    <>
      <div className="bg-gray-100 h-screen flex flex-col">
        <div className="relative container mx-auto p-4 flex flex-col h-full max-w-2xl">
          <section className='pr-36 mb-5'>
            <h1 className="text-2xl font-bold">ChatUI</h1>
          </section>

          <button
            className="absolute right-4 top-4 bg-red-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
            onClick={clearChat}
          >
            Clear Chat
          </button>

          <form className="flex" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Tin nhắn của bạn..."
              className="flex-grow p-2 rounded-l border border-gray-300"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={disabled}
              className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
            >
              Gửi tin nhắn
            </button>
          </form>

          <div className="message-wrapper-js flex-grow overflow-y-auto mt-4 bg-white rounded shadow p-4">
            {
              messages?.map((msg, index) => (
                <div key={index} className={`mb-2 ${msg.role === 'user' ? '' : 'text-right'}`}>
                  <p className="text-gray-600 text-sm mb-1">{msg.role === 'user' ? 'User' : 'Assistant'}</p>
                  <p className={`p-2 rounded-lg inline-block text-left whitespace-pre-wrap max-w-[90%] ${msg.role === 'user' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {msg.content}
                  </p>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      <Popup ref={popupRef} getKey={getKey} />
    </>
  );
}

export default App
