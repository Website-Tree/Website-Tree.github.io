import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmbedOptions, Movie, VideoQuality } from '@shared/schema';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie?: Movie | null;
}

const EmbedModal: React.FC<EmbedModalProps> = ({ isOpen, onClose, movie }) => {
  const { toast } = useToast();
  const embedCodeRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  
  const [embedOptions, setEmbedOptions] = useState<EmbedOptions>({
    autoplay: false,
    loop: false,
    hideControls: false,
    width: 640,
    height: 360,
    quality: '720p'
  });
  
  const generateEmbedCode = (): string => {
    if (!movie) return '';
    
    const domain = window.location.origin;
    const params = new URLSearchParams();
    
    if (embedOptions.autoplay) params.append('autoplay', 'true');
    if (embedOptions.loop) params.append('loop', 'true');
    if (embedOptions.hideControls) params.append('controls', 'false');
    params.append('quality', embedOptions.quality);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const embedUrl = `${domain}/embed/${movie.id}${queryString}`;
    
    return `<iframe src="${embedUrl}" width="${embedOptions.width}" height="${embedOptions.height}" frameborder="0" allowfullscreen></iframe>`;
  };
  
  const handleCopyEmbedCode = () => {
    if (embedCodeRef.current) {
      embedCodeRef.current.select();
      document.execCommand('copy');
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Embed code copied to clipboard",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const updateEmbedOption = <K extends keyof EmbedOptions>(key: K, value: EmbedOptions[K]) => {
    setEmbedOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Generate embed code when modal opens or options change
  const embedCode = generateEmbedCode();
  
  if (!movie) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1E1E1E] text-[#E5E5E5] border-[#2D2D2D] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Embed Your Video</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="embedCode" className="text-[#AAAAAA]">Embed Code</Label>
            <div className="relative">
              <Textarea
                id="embedCode"
                ref={embedCodeRef}
                rows={4}
                className="bg-[#2D2D2D] text-white border-none focus:ring-[#0071EB] pr-10"
                value={embedCode}
                readOnly
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="absolute right-2 top-2 text-[#0071EB] hover:text-blue-400 hover:bg-transparent"
                onClick={handleCopyEmbedCode}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
            <Button
              type="button"
              variant="link"
              className="text-[#0071EB] hover:text-blue-400 p-0 h-auto text-sm mt-1"
              onClick={handleCopyEmbedCode}
            >
              {copied ? 'Copied to clipboard!' : 'Copy to clipboard'}
            </Button>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#AAAAAA]">Options</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="autoplay" 
                  checked={embedOptions.autoplay} 
                  onCheckedChange={(checked) => updateEmbedOption('autoplay', !!checked)}
                />
                <Label htmlFor="autoplay" className="text-white">Autoplay</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="loop" 
                  checked={embedOptions.loop} 
                  onCheckedChange={(checked) => updateEmbedOption('loop', !!checked)}
                />
                <Label htmlFor="loop" className="text-white">Loop</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hideControls" 
                  checked={embedOptions.hideControls} 
                  onCheckedChange={(checked) => updateEmbedOption('hideControls', !!checked)}
                />
                <Label htmlFor="hideControls" className="text-white">Hide controls</Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#AAAAAA]">Player Size</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width" className="text-xs text-[#AAAAAA]">Width</Label>
                <Input
                  id="width"
                  type="number"
                  min="320"
                  max="1920"
                  className="bg-[#2D2D2D] text-white border-none focus:ring-[#0071EB]"
                  value={embedOptions.width}
                  onChange={(e) => updateEmbedOption('width', parseInt(e.target.value) || 640)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="height" className="text-xs text-[#AAAAAA]">Height</Label>
                <Input
                  id="height"
                  type="number"
                  min="180"
                  max="1080"
                  className="bg-[#2D2D2D] text-white border-none focus:ring-[#0071EB]"
                  value={embedOptions.height}
                  onChange={(e) => updateEmbedOption('height', parseInt(e.target.value) || 360)}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#AAAAAA]">Quality</h3>
            <div className="flex space-x-3">
              {(['480p', '720p', '1080p'] as VideoQuality[]).map((q) => (
                <Button
                  key={q}
                  type="button"
                  variant={embedOptions.quality === q ? "default" : "outline"}
                  size="sm"
                  className={embedOptions.quality === q 
                    ? "bg-[#0071EB] hover:bg-blue-700 text-white" 
                    : "bg-[#2D2D2D] text-white border-[#3D3D3D] hover:bg-[#3D3D3D] hover:text-white"
                  }
                  onClick={() => updateEmbedOption('quality', q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            className="bg-[#0071EB] hover:bg-blue-700 text-white"
            onClick={onClose}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmbedModal;
