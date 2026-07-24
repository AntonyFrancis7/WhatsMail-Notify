export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

export const truncateString = (str, num) => {
  if (!str) return '';
  if (str.length <= num) return str;
  return str.slice(0, num) + '...';
};
