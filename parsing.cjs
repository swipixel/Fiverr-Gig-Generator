function parseRating(ratingStr) {
  if (typeof ratingStr !== 'string') return 0;
  
  if (ratingStr.toLowerCase().endsWith('k+')) {
    return parseFloat(ratingStr) * 1000;
  }
  
  return parseFloat(ratingStr.replace(/[,+]/g, '')) || 0;
}

module.exports = {parseRating}