
import { useState } from "react";
import ExpandableButton from "@/components/ExpandableButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  FileText, 
  Users, 
  Upload,
  Home,
  Settings,
  Sun,
  Mic,
  Moon,
  Plus,
  Library,
  BarChart3
} from "lucide-react";
import { useTheme } from "next-themes";
import PDFUpload from "@/components/PDFUpload";
import PDFLibrary from "@/components/PDFLibrary";

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("upload");
 const [pdfs, setPdfs] = useState([]);

  // NEW: Called when PDFUpload uploads files
  const handleUpload = (files: FileList | null) => {
    if (!files) return;

    const uploaded = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      date: new Date().toISOString(),
      tags: [], // or auto-generate tags if needed
      url: URL.createObjectURL(file) // for preview/open
    }));

    setPdfs(prev => [...prev, ...uploaded]);
    setActiveTab("library"); // auto-switch to library after upload
  };

  const personas = [
    {
      id: "hiring-manager",
      name: "Hiring Manager",
      description: "Focus on candidate qualifications and team fit",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      id: "technical-lead", 
      name: "Technical Lead",
      description: "Analyze technical skills and project experience",
      icon: Brain,
      color: "bg-green-500",
    },
    {
      id: "hr-specialist",
      name: "HR Specialist", 
      description: "Evaluate cultural fit and communication skills",
      icon: FileText,
      color: "bg-purple-500",
    },
  ];

  const stats = [
    { label: "Documents Analyzed", value: "1,247", icon: FileText },
    { label: "Insights Generated", value: "3,891", icon: Brain },
    { label: "Personas Active", value: "3", icon: Users },
    { label: "Success Rate", value: "94%", icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-glass-bg backdrop-blur-md border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-ai rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-ai bg-clip-text text-transparent">
                PersonaLens
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <Home className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome to PersonaLens Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-powered document analysis with intelligent reading assistance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="w-8 h-8 text-primary opacity-80" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* PDF Management Section */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList className="grid w-fit grid-cols-2">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Analyse PDF Headings
                  </TabsTrigger>
                  <TabsTrigger value="library" className="flex items-center gap-2">
                    <Library className="w-4 h-4" />
                    Persona Analysis
                  </TabsTrigger>
                </TabsList>

                <Button onClick={() => navigate('/pdf-reader')} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Click here to extract headings from a PDF
                </Button>
              </div>

              <TabsContent value="upload">
                <PDFUpload  />
              </TabsContent>

              <TabsContent value="library">
                <PDFLibrary />
              </TabsContent>
            </Tabs>
          </div>

          {/* Persona Analysis Panel */}
          <div className="space-y-6">
            <Card variant="ai">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Personas
                </CardTitle>
                <CardDescription>
                  Best Performance by our model in these fields
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {personas.map((persona) => (
                    <div
                      key={persona.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors cursor-pointer"
                    >
                      <div className={`w-10 h-10 ${persona.color} rounded-lg flex items-center justify-center`}>
                        <persona.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{persona.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {persona.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-4">
      <ExpandableButton
        icon={<Brain className="w-4 h-4 mr-2" />}
        title="View Insights"
        description="Quickly access AI-powered analysis and key takeaways from your uploaded documents. This section presents a concise, visual summary of trends, highlights, and recommendations, helping you understand the data at a glance. Dive deeper into metrics, persona-driven perspectives, and actionable suggestions to make informed decisions faster."
      />

      <ExpandableButton
        icon={<Mic className="w-4 h-4 mr-2" />}
        title="Start Podcast Mode"
        description="Engage with your documents in an interactive, conversational format. Podcast Mode simulates a dynamic discussion between AI personas, offering deeper insights, debates, and diverse perspectives on your content."
      />

      <ExpandableButton
        icon={<BarChart3 className="w-4 h-4 mr-2" />}
        title="Analytics Dashboard"
        description="Explore detailed charts, statistics, and trends extracted from your data. The Analytics Dashboard helps you visualize key metrics, monitor progress, and identify patterns for smarter decision-making."
      />
    </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
