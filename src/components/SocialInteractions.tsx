// /home/snippedia/snip-pedia/src/components/SocialInteractions.tsx

import ReactionButton from "./ReactionButton";
import ShareButton from "./ShareButton";

interface SocialInteractionsProps {
  article: {
    id?: number | string;
    pageid?: number | string;
    title: string;
    content?: string;
  };
  className?: string;
}

const SocialInteractions = ({ article, className = "" }: SocialInteractionsProps) => {
  // ✅ safeId sempre string e nunca undefined
  const safeId = String(article?.id ?? article?.pageid ?? article?.title ?? "");

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* ✅ ReactionButton precisa receber string consistente */}
      <ReactionButton articleId={safeId} />

      {/* ✅ ShareButton recebe o article normal (ele mesmo já usa safeId internamente) */}
      <ShareButton article={article as any} />
    </div>
  );
};

export default SocialInteractions;
