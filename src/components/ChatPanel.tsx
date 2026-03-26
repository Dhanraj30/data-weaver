import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  onHighlightNodes?: (nodeIds: string[]) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/graph-chat`;

export default function ChatPanel({ onHighlightNodes }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I can help you analyze the **Order to Cash** process. Ask me about sales orders, deliveries, billing documents, payments, or trace document flows." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    setInput('');
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = '';
    const allMessages = [...messages, userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        throw new Error(resp.status === 429 ? 'Rate limited. Please try again in a moment.' : 
                       resp.status === 402 ? 'AI credits exhausted.' : `Error: ${errBody}`);
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && prev.length > 1 && prev[prev.length - 2]?.role === 'user') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-semibold text-sm text-foreground">Chat with Graph</h2>
        <p className="text-xs text-muted-foreground">Order to Cash</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="flex items-start gap-2 max-w-[90%]">
                <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-background text-xs font-bold">D</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground mb-0.5">Dodge AI</div>
                  <div className="text-xs text-muted-foreground mb-1">Graph Agent</div>
                  <div className="text-sm text-foreground chat-prose">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
            {msg.role === 'user' && (
              <div className="max-w-[85%]">
                <div className="flex items-center gap-1.5 justify-end mb-1">
                  <span className="text-xs font-medium text-foreground">You</span>
                </div>
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3 py-2 text-sm">
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
              <span className="text-background text-xs font-bold">D</span>
            </div>
            <div className="flex gap-1 mt-3">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-1 mb-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">Dodge AI is awaiting instructions</span>
        </div>
        <div className="relative">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Analyze anything"
            className="w-full resize-none border border-border rounded-lg px-3 py-2 pr-12 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-[60px]"
            rows={2}
          />
          <Button
            size="sm"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="absolute bottom-2 right-2 h-7 w-7 p-0"
          >
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
