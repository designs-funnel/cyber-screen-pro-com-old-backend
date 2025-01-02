require('dotenv').config();
const { APIFY_API, POSTS_LIMIT } = process.env;
const axios = require('axios');
const { time } = require('./util');
const scrapeFb = async (url) => {
  console.log(`${time()} start scrapeFb(${url})`);
  const response = await axios.post(
    `https://api.apify.com/v2/acts/apify~facebook-posts-scraper/run-sync-get-dataset-items?token=${APIFY_API}&memory=1024`,
    {
      resultsLimit: Number(POSTS_LIMIT),
      startUrls: [
        {
          url,
        },
      ],
    },
  );
  console.log(`${time()} end scrapeFb(${url})`);

  const p = response.data[0];
  const user = {
    platform: 'Facebook',
    profile_url: p?.facebookUrl,
    username: p?.user.name,
    user_image: p?.user.profilePic,
  };

  return [response.data, user];
};

// scrapeFb('https://facebook.com/jayshetty')
//   .then((O) => console.log(JSON.stringify(O, 0, 2)))
//   .catch((e) => console.log(e?.message, e?.response?.data));
module.exports = { scrapeFb };
