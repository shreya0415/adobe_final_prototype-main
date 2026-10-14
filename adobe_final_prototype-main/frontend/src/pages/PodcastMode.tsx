import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
// ✅ 1. Import useLocation to get the data passed from the previous page
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  FileText, 
  Clock, 
  ArrowLeft,
  Home,
  Sun,
  Moon,
  Headphones,
  Download,
  Share
} from 'lucide-react';
import { useTheme } from 'next-themes';
// import client from '../api/client'; // No longer needed here

const PodcastMode = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  // ✅ 2. Get the state (audioUrl and transcriptText) passed during navigation
  const location = useLocation();
  const { audioUrl: initialAudioUrl, transcriptText: initialTranscript } = location.state || {};

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([80]);
  const [showTranscript, setShowTranscript] = useState(false);
  
  // ✅ 3. Initialize the audioUrl state with the URL from the previous page
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // ✅ 4. REMOVED the useEffect that was incorrectly fetching a new audio file.

  // Sync volume (no changes here)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  // Sync progress time and auto-play the audio when it's ready
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const setMeta = () => {
        setDuration(audio.duration)
        // Auto-play the audio once metadata is loaded
        audio.play();
        setIsPlaying(true);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setMeta);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setMeta);
    };
  }, [audioUrl]); // Rerun this effect if the audioUrl changes

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ✅ 5. Use the transcript passed from the previous page
  const transcript = [
    {
      time: "0:00",
      speaker: "AI Narrator",
      text: initialTranscript || "Welcome to your personalized document insights."
    }
    // You can add more complex transcript parsing here if needed
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation (no changes) */}
      <nav className="sticky top-0 z-50 bg-glass-bg backdrop-blur-md border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-ai rounded-lg flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-ai bg-clip-text text-transparent">
                  Podcast Mode
                </span>
              </div>
              <div className="h-6 w-px bg-border"></div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                AI Ethics Analysis
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/pdf-reader')}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Reader
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <Home className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-4 w-4 transition-all dark:scale-0" />
                <Moon className="absolute h-4 w-4 transition-all dark:scale-100" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        {/* Main Player (no changes) */}
        <Card variant="ai" className="mb-8">
          <CardHeader className="text-center">
            <div className="w-24 h-24 bg-gradient-ai rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Headphones className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-2xl">AI-Generated Podcast Summary</CardTitle>
            <CardDescription>
              A narrated exploration of your documents' key insights and connections
            </CardDescription>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{formatTime(duration)} duration</span>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Progress Bar (no changes) */}
            <div className="mb-6">
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                className="w-full"
                onValueChange={handleSeek}
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons (no changes) */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button variant="outline" size="icon" onClick={() => audioRef.current && (audioRef.current.currentTime -= 10)}>
                <SkipBack className="w-5 h-5" />
              </Button>
              
              <Button 
                size="lg" 
                className="w-16 h-16 rounded-full"
                onClick={togglePlayPause}
                disabled={!audioUrl}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>
              
              <Button variant="outline" size="icon" onClick={() => audioRef.current && (audioRef.current.currentTime += 10)}>
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>

            {/* Volume Control (no changes) */}
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={volume}
                max={100}
                step={1}
                className="flex-1"
                onValueChange={setVolume}
              />
              <span className="text-sm text-muted-foreground w-8">{volume[0]}%</span>
            </div>

            <Separator className="my-6" />

            {/* Action Buttons (no changes) */}
            <div className="flex items-center justify-center gap-3">
              <Button 
                variant="outline"
                onClick={() => setShowTranscript(!showTranscript)}
              >
                <FileText className="w-4 h-4 mr-2" />
                {showTranscript ? 'Hide' : 'Show'} Transcript
              </Button>
              {audioUrl && (
                <a href={audioUrl} download="podcast.mp3">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Audio
                  </Button>
                </a>
              )}
              <Button variant="outline">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transcript (no changes) */}
        {showTranscript && (
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Transcript
              </CardTitle>
              <CardDescription>
                Full transcript of the AI-generated podcast
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {transcript.map((entry, index) => (
                  <div key={index} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {entry.time}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-primary mb-1">
                        {entry.speaker}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {entry.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Hidden audio element */}
      {/* The src is now correctly set from the state */}
      <audio ref={audioRef} src={audioUrl || undefined} className="hidden" />
    </div>
  );
};

export default PodcastMode;
