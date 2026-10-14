import { ReactNode } from "react";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Lightbulb, 
  Brain, 
  AlertTriangle, 
  Link, 
  Copy, 
  ExternalLink,
  Sparkles,
  X,
  Zap
} from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface Insight {
  id: string;
  type: 'key_insight' | 'did_you_know' | 'contradiction' | 'connection';
  title: string;
  content: string;
  sources: string[];
  confidence: number;
}

interface InsightsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode; // <-- Add this
}

const mockInsights: Insight[] = [
  {
    id: '1',
    type: 'key_insight',
    title: 'Convergence of Ethical Frameworks',
    content: 'Your documents reveal a strong consensus around principle-based approaches to AI ethics, with 89% of sources emphasizing transparency, accountability, and fairness as core tenets.',
    sources: ['AI Ethics Research Paper', 'Technical Documentation', 'Marketing Strategy 2024'],
    confidence: 0.94
  },
  {
    id: '2',
    type: 'did_you_know',
    title: 'Implementation Gap',
    content: 'While ethical frameworks are well-documented, only 34% of the technical implementations described actually include concrete bias detection mechanisms.',
    sources: ['Technical Documentation', 'AI Ethics Research Paper'],
    confidence: 0.87
  },
  {
    id: '3',
    type: 'contradiction',
    title: 'Strategy vs. Ethics Misalignment',
    content: 'The marketing strategy emphasizes rapid AI deployment for competitive advantage, which conflicts with the ethics paper\'s recommendation for careful, gradual implementation.',
    sources: ['Marketing Strategy 2024', 'AI Ethics Research Paper'],
    confidence: 0.82
  },
  {
    id: '4',
    type: 'connection',
    title: 'Cross-Document Pattern: Governance',
    content: 'All three documents independently arrive at similar governance recommendations, suggesting industry-wide consensus on AI oversight structures.',
    sources: ['AI Ethics Research Paper', 'Technical Documentation', 'Marketing Strategy 2024'],
    confidence: 0.91
  }
];

const InsightsPanel = ({ isOpen, onClose }: InsightsPanelProps) => {
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'key_insight': return <Brain className="w-5 h-5" />;
      case 'did_you_know': return <Lightbulb className="w-5 h-5" />;
      case 'contradiction': return <AlertTriangle className="w-5 h-5" />;
      case 'connection': return <Link className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'key_insight': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'did_you_know': return 'text-green-600 bg-green-50 border-green-200';
      case 'contradiction': return 'text-red-600 bg-red-50 border-red-200';
      case 'connection': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getInsightLabel = (type: Insight['type']) => {
    switch (type) {
      case 'key_insight': return 'Key Insight';
      case 'did_you_know': return 'Did You Know?';
      case 'contradiction': return 'Contradiction';
      case 'connection': return 'Connection';
      default: return 'Insight';
    }
  };

  const copyInsight = (insight: Insight) => {
    navigator.clipboard.writeText(`${insight.title}\n\n${insight.content}\n\nSources: ${insight.sources.join(', ')}`);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[80vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-ai rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <DrawerTitle className="flex items-center gap-2">
                  AI Insights & Connections
                  <Zap className="w-4 h-4 text-primary" />
                </DrawerTitle>
                <DrawerDescription>
                  Deep analysis and cross-document connections powered by GPT-4o
                </DrawerDescription>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Insights Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {mockInsights.map((insight) => (
                <Card 
                  key={insight.id}
                  variant="glass"
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${getInsightColor(insight.type)}`}
                  onClick={() => setSelectedInsight(insight)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        <div>
                          <Badge variant="secondary" className="text-xs mb-1">
                            {getInsightLabel(insight.type)}
                          </Badge>
                          <CardTitle className="text-base">
                            {insight.title}
                          </CardTitle>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(insight.confidence * 100)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {insight.content}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {insight.sources.slice(0, 2).map((source) => (
                        <Badge key={source} variant="outline" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                      {insight.sources.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{insight.sources.length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          copyInsight(insight);
                        }}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Explore
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detailed View */}
            {selectedInsight && (
              <Card variant="ai" className="mt-8 border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getInsightIcon(selectedInsight.type)}
                      <div>
                        <Badge variant="default" className="mb-2">
                          {getInsightLabel(selectedInsight.type)}
                        </Badge>
                        <CardTitle>{selectedInsight.title}</CardTitle>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setSelectedInsight(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {selectedInsight.content}
                  </p>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      Sources & References
                    </h4>
                    <div className="grid gap-2">
                      {selectedInsight.sources.map((source, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <span className="text-sm">{source}</span>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Brain className="w-4 h-4" />
                      Confidence: {Math.round(selectedInsight.confidence * 100)}%
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Insight
                      </Button>
                      <Button size="sm">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Deep Dive
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default InsightsPanel;
