import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Brain, 
  FileText, 
  Users, 
  Send,
  Copy,
  RefreshCw,
  Home,
  ArrowLeft,
  Sparkles,
  MessageCircle,
  Download,
  Share,
  Moon,
  Sun
} from "lucide-react";
import { useTheme } from "next-themes";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface Insight {
  id: string;
  title: string;
  content: string;
  category: string;
  confidence: number;
}

const Insights = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const { files, persona } = location.state || {};

  useEffect(() => {
    if (!files || !persona) {
      navigate("/dashboard");
      return;
    }

    // Simulate initial analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      
      // Generate mock insights based on persona
      const mockInsights: Insight[] = [
        {
          id: "1",
          title: "Key Qualifications Found",
          content: "Identified 15 candidates with relevant experience in software development, including 8 with senior-level expertise in React and TypeScript.",
          category: "Skills Analysis",
          confidence: 0.92
        },
        {
          id: "2", 
          title: "Education Requirements",
          content: "75% of candidates hold bachelor's degrees in Computer Science or related fields. 3 candidates have advanced degrees.",
          category: "Education",
          confidence: 0.88
        },
        {
          id: "3",
          title: "Experience Distribution",
          content: "Experience ranges from 2-10 years, with average of 5.5 years. Most candidates show progression in technical roles.",
          category: "Experience",
          confidence: 0.94
        }
      ];

      setInsights(mockInsights);

      // Add initial AI message
      const initialMessage: Message = {
        id: "1",
        type: "ai",
        content: `I've analyzed ${files.length} documents from an ${persona.name} perspective. I found ${mockInsights.length} key insights about the candidates and their qualifications. What specific aspect would you like me to explore further?`,
        timestamp: new Date()
      };

      setMessages([initialMessage]);
    }, 3000);
  }, [files, persona, navigate]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user", 
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "Based on your question, I can provide more detailed analysis. The documents show strong alignment with the technical requirements, particularly in React development and team leadership experience.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  if (!files || !persona) {
    return null;
  }

  const followUpQuestions = [
    "What are the top 3 candidates?",
    "Show salary expectations",
    "Compare technical skills",
    "Analyze team fit"
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-glass-bg backdrop-blur-md border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-ai rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-ai bg-clip-text text-transparent">
                  PersonaLens
                </span>
              </div>
              <div className="h-6 w-px bg-border"></div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {persona.name}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {files.length} files
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <Home className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 bg-gradient-ai rounded-full flex items-center justify-center mb-6 animate-glow-pulse">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              Analyzing Your Documents...
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md">
              Our AI is processing {files.length} documents with the {persona.name} persona to extract relevant insights.
            </p>
            <div className="flex items-center space-x-2 animate-pulse">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Chat Interface */}
            <div className="lg:col-span-2 space-y-6">
              <Card variant="glass" className="h-[600px] flex flex-col">
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    AI Analysis Chat
                  </CardTitle>
                  <CardDescription>
                    Ask questions about your documents or request specific insights.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 p-0">
                  <div className="h-full flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-4 ${
                              message.type === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted border"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className="text-xs opacity-70 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-border p-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ask about specific insights, comparisons, or request deeper analysis..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Quick Questions */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {followUpQuestions.map((question, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => setNewMessage(question)}
                            className="text-xs"
                          >
                            {question}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights Panel */}
            <div className="space-y-6">
              <Card variant="ai">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Key Insights
                  </CardTitle>
                  <CardDescription>
                    AI-extracted insights from your documents.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.map((insight) => (
                      <div key={insight.id} className="p-4 rounded-lg border bg-card/50">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">{insight.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(insight.confidence * 100)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{insight.content}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">{insight.category}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-base">Export & Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Share className="w-4 h-4 mr-2" />
                      Share Insights
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Re-analyze
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;