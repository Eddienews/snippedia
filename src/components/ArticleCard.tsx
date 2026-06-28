import React from "react";

type Article = {
  id?: number | string;
  wikipedia_id?: number | string;
  title: string;
  image?: string;
  extract?: string;
};

type Props = { article: Article };

const ArticleCard: React.FC<Props> = ({ article }) => {
  const handleOpen = () => {
    const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(article.title)}`;
    window.open(url, "_blank");
  };

  return (
    <article className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6 mb-4">
      <div className="flex gap-4">
        {article.image && (
          <img
            src={article.image}
            alt={article.title}
            className="w-28 h-28 md:w-36 md:h-36 rounded-xl object-cover flex-shrink-0"
            loading="lazy"
          />
        )}
        <div className="flex-1">
          <h2 className="text-white text-lg md:text-xl font-semibold mb-2 line-clamp-2">
            {article.title}
          </h2>
          {article.extract && (
            <p className="text-white/80 text-sm md:text-base line-clamp-3">
              {article.extract}
            </p>
          )}
          <div className="mt-3">
            <button
              onClick={handleOpen}
              className="text-sm md:text-base px-3 py-2 rounded-lg border border-white/10 hover:border-wikitok-red/50 hover:bg-black/70 transition"
            >
              Open on Wikipedia
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
