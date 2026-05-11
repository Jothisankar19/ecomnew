import React from 'react';
import { FiStar } from 'react-icons/fi';

const StarRating = ({ rating = 0, size = 16, showCount = false, count = 0, interactive = false, onChange }) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.floor(rating);
    const half = !filled && i < rating;
    return { filled, half };
  });

  return (
    <div className="flex items-center gap-1">
      {stars.map((star, i) => (
        <button
          key={i}
          onClick={() => interactive && onChange && onChange(i + 1)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          disabled={!interactive}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {star.filled ? (
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#D4AF37" stroke="#D4AF37" strokeWidth="1" />
            ) : star.half ? (
              <>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77V2z" fill="#D4AF37" />
                <path d="M12 2l-3.09 6.26L2 9.27l5 4.87-1.18 6.88L12 17.77V2z" fill="none" stroke="#D4AF37" strokeWidth="1" />
              </>
            ) : (
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
            )}
          </svg>
        </button>
      ))}
      {showCount && count > 0 && (
        <span className="text-white/40 text-xs ml-1">({count})</span>
      )}
    </div>
  );
};

export default StarRating;
