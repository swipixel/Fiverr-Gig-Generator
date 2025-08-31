function parseRating(ratingStr) {
  if (typeof ratingStr !== 'string') return 0;
  
  if (ratingStr.toLowerCase().endsWith('k+')) {
    return parseFloat(ratingStr) * 1000;
  }
  
  // Remove any commas or plus signs, then parse
  return parseFloat(ratingStr.replace(/[,+]/g, '')) || 0;
}

module.exports = {parseRating}