import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Brain, FileText, Users, Zap, ArrowRight, Upload, Target, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const features = [
    {
      icon: Upload,
      title: "Smart Document Upload",
      description: "Drag and drop multiple PDFs with intelligent processing and instant analysis.",
    },
    {
      icon: Target,
      title: "Persona-Based Extraction",
      description: "Get insights tailored to your role - HR manager, researcher, student, or custom personas.",
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced AI understands context and extracts the most relevant information for your needs.",
    },
    {
      icon: Sparkles,
      title: "Interactive Insights",
      description: "Chat-style interface with follow-up questions and refinement capabilities.",
    },
  ];

  const personas = [
    { name: "HR Manager", color: "bg-primary", count: "12+" },
    { name: "Researcher", color: "bg-secondary", count: "8+" },
    { name: "Student", color: "bg-accent", count: "15+" },
    { name: "Executive", color: "bg-primary-glow", count: "6+" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-glass-bg backdrop-blur-md border-b border-glass-border">
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
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Sign In
              </Button>
              <Button variant="hero" onClick={() => navigate("/dashboard")}>
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-xs px-3 py-1">
                  <Zap className="w-3 h-3 mr-1" />
                  AI-Powered Document Intelligence
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Extract{" "}
                  <span className="bg-gradient-ai bg-clip-text text-transparent">
                    Intelligent Insights
                  </span>{" "}
                  from Your Documents
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  PersonaLens transforms how you interact with PDFs. Upload documents, 
                  choose your persona, and get AI-powered insights tailored to your specific role and needs.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="hero" 
                  size="xl" 
                  onClick={() => navigate("/dashboard")}
                  className="group"
                >
                  Start Analyzing Documents
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="xl">
                  <FileText className="w-5 h-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Documents Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">500+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">95%</div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-up">
              <div className="absolute inset-0 bg-gradient-ai opacity-20 rounded-3xl blur-3xl animate-glow-pulse"></div>
              <img 
                src={heroImage} 
                alt="PersonaLens AI Interface" 
                className="relative rounded-3xl shadow-ai hover:shadow-glow-primary transition-all duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Powerful Features for{" "}
              <span className="bg-gradient-ai bg-clip-text text-transparent">
                Smarter Document Analysis
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for professionals who need fast, accurate, and contextual document understanding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                variant="floating" 
                className="group hover:scale-105 transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:shadow-glow-primary transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Personas Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-muted/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Choose Your{" "}
              <span className="bg-gradient-secondary bg-clip-text text-transparent">
                Perfect Persona
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get insights tailored to your role with our pre-built personas or create your own custom analysis perspective.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {personas.map((persona, index) => (
              <Card 
                key={index} 
                variant="glass"
                className="text-center group hover:scale-105 transition-all duration-300"
              >
                <CardContent className="pt-6">
                  <div className={`w-16 h-16 ${persona.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-glow-primary transition-all duration-300`}>
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{persona.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {persona.count} templates available
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Explore
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="ai" size="lg" onClick={() => navigate("/dashboard")}>
              <Brain className="w-5 h-5" />
              Try PersonaLens Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-ai rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-ai bg-clip-text text-transparent">
                PersonaLens
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 PersonaLens. Transforming document analysis with AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;