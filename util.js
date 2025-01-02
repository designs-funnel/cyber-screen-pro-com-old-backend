require('dotenv').config();

const countByLabel = (data) =>
  data.reduce((acc, obj) => {
    acc[obj?.label] = (acc[obj?.label] || 0) + 1;
    return acc;
  }, {});

const sleep = (sec) => new Promise((r) => setTimeout(r, sec * 1000));

const missing = (must_vars) => {
  let err = false;
  for (const v of must_vars) {
    if (process.env[v] === undefined) {
      console.log('Did you forget to add environment variable:', v);
      err = true;
    }
  }
  return err;
};

const time = (need) => {
  const date = new Date();
  const timeStr = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const dateStr = date.toLocaleDateString([], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return process.env.LOCAL || need ? `${timeStr} ${dateStr}` : '';
};
// console.log(time());

const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
// console.log(randomBetween(2, 10));

module.exports = { countByLabel, sleep, missing, time, randomBetween };
