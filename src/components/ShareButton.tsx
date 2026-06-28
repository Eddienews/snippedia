import { useState } from "react";
import { Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocialInteractions } from "../hooks/useSocialInteractions";
import { useToast } from "./ui/use-toast";

interface ShareButtonProps {
  article: {
    id?: number | string;
    pageid?: number | string;
    title?: string;
    content?: string;
  };
  className?: string;
}

const ShareButton = ({ article, className = "" }: ShareButtonProps) => {
  const [showShareOptions, setShowShareOptions] = useState(false);

  const safeId = String(article?.id ?? article?.pageid ?? article?.title ?? "");
  const hook = useSocialInteractions(safeId);

  // ✅ fallbacks (evita crash quando hook ainda não carregou ou retornou undefined)
  const socialData = hook?.socialData ?? { totalShares: 0 };
  const incrementShares = hook?.incrementShares ?? (() => {});

  const { toast } = useToast();

  const handleShare = async (platform?: string) => {
    const baseUrl = window.location.origin;

    // ✅ rota /s/ID para metatags
    const shareUrl = `${baseUrl}/s/${article?.id ?? article?.pageid ?? ""}`;
    const shareText = `Check out this interesting article about ${article?.title ?? "this topic"} on Snippedia!`;

    if (platform) {
      let shareLink = "";
      switch (platform) {
        case "twitter":
          shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText
          )}&url=${encodeURIComponent(shareUrl)}`;
          break;
        case "facebook":
          shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl
          )}`;
          break;
        case "whatsapp":
          shareLink = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
          break;
        case "telegram":
          shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
            shareText
          )}`;
          break;
      }

      if (shareLink) {
        window.open(shareLink, "_blank", "width=600,height=400");
        incrementShares(); // ✅ seguro
        setShowShareOptions(false);
        toast({
          title: "Shared!",
          description: `Article shared on ${platform}`,
          duration: 2000,
        });
      }
      return;
    }

    // Compartilhamento Nativo (Mobile) / fallback
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title ?? "Snippedia",
          text: shareText,
          url: shareUrl,
        });
        incrementShares();
        toast({
          title: "Shared successfully",
          description: "Article shared!",
          duration: 2000,
        });
      } catch (error) {
        console.error("Share failed:", error);
      } finally {
        setShowShareOptions(false);
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      incrementShares();
      toast({
        title: "Link copied",
        description: "Article link copied to clipboard!",
        duration: 2000,
      });
    } catch (error) {
      console.error("Copy failed:", error);
    } finally {
      setShowShareOptions(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        className="flex items-center space-x-2 px-3 py-2 rounded-full bg-black/20 text-white/80 hover:bg-black/40 border border-white/10 transition-all duration-300"
        onClick={() => setShowShareOptions(!showShareOptions)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Share2 className="w-5 h-5" />
        <span className="text-sm font-medium">
  {socialData?.totalShares ?? 0}
</span>
      </motion.button>

      <AnimatePresence>
        {showShareOptions && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full mb-2 right-0 bg-black/90 backdrop-blur-sm rounded-lg p-3 border border-white/20 min-w-48 z-50"
          >
            <div className="space-y-2">
              <button
                onClick={() => handleShare("twitter")}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white text-sm"
              >
                <span className="text-blue-400">𝕏</span>
                <span>Twitter</span>
              </button>
              <button
                onClick={() => handleShare("facebook")}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white text-sm"
              >
                <span className="text-blue-600">📘</span>
                <span>Facebook</span>
              </button>
              <button
                onClick={() => handleShare("whatsapp")}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white text-sm"
              >
                <span className="text-green-500">📱</span>
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => handleShare("telegram")}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white text-sm"
              >
                <span className="text-blue-500">✈️</span>
                <span>Telegram</span>
              </button>

              <div className="border-t border-white/20 pt-2">
                <button
                  onClick={() => handleShare()}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white text-sm"
                >
                  <span>📋</span>
                  <span>Copy Link</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareButton;
