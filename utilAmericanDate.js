const americanDate = () => {
  const date = new Date();
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  return date.toLocaleDateString('en-US', options);
};

// console.log(americanDate());

module.exports = americanDate;
