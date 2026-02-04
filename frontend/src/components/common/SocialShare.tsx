// src/components/common/SocialShare.tsx

import { Button } from '@/components/ui/button';
import { Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
}

export default function SocialShare({ url, title, description }: SocialShareProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied!',
        description: 'Product link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
    whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
  };

  const handleShare = async (platform?: string) => {
    // Try native Web Share API first (mobile friendly)
    if (!platform && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        return;
      } catch (error) {
        // User cancelled or share failed, fall back to buttons
      }
    }

    // If platform specified, open in new window
    if (platform && shareLinks[platform as keyof typeof shareLinks]) {
      window.open(shareLinks[platform as keyof typeof shareLinks], '_blank', 'width=600,height=400');
    } else {
      // Show share buttons
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      {/* Main Share Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare()}
        className="gap-2"
        aria-label="Share product"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </Button>

      {/* Share Options Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-background border rounded-lg shadow-lg p-2 z-50 min-w-[200px]">
          <div className="space-y-1">
            <button
              onClick={() => {
                handleShare('facebook');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md transition-colors text-sm"
              aria-label="Share on Facebook"
            >
              <Facebook className="h-4 w-4 text-blue-600" />
              <span>Facebook</span>
            </button>
            
            <button
              onClick={() => {
                handleShare('twitter');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md transition-colors text-sm"
              aria-label="Share on Twitter"
            >
              <Twitter className="h-4 w-4 text-sky-500" />
              <span>Twitter</span>
            </button>
            
            <button
              onClick={() => {
                handleShare('linkedin');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md transition-colors text-sm"
              aria-label="Share on LinkedIn"
            >
              <Linkedin className="h-4 w-4 text-blue-700" />
              <span>LinkedIn</span>
            </button>
            
            <button
              onClick={() => {
                handleShare('whatsapp');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md transition-colors text-sm"
              aria-label="Share on WhatsApp"
            >
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span>WhatsApp</span>
            </button>
            
            <div className="border-t my-1"></div>
            
            <button
              onClick={() => {
                handleCopyLink();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md transition-colors text-sm"
              aria-label="Copy link"
            >
              <LinkIcon className="h-4 w-4" />
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
