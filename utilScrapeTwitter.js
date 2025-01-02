require('dotenv').config();
const { APIFY_API, POSTS_LIMIT } = process.env;

const axios = require('axios');
const { time } = require('./util');

// addUserInfo for 1 time only then without addUserInfo
// memory = 256 important ? // and one call at a time ...
// https://api.apify.com/v2/acts/actorId/run-sync?token=soSkq9ekdmfOslopH&outputRecordKey=OUTPUT&timeout=60&memory=256&build=0.1.234&webhooks=dGhpcyBpcyBqdXN0IGV4YW1wbGUK
const scrapeTwitter = async (url) => {
  console.log(`${time()} start scrapeTwitter(${url})`);
  const responsePosts = await axios.post(
    `https://api.apify.com/v2/acts/quacker~twitter-url-scraper/run-sync-get-dataset-items?token=${APIFY_API}&memory=2048`,
    {
      startUrls: [
        {
          url,
        },
      ],
      tweetsDesired: Number(POSTS_LIMIT),
      addUserInfo: true,
    },
  );
  console.log(`${time()} end scrapeTwitter(${url})`);

  const p = responsePosts.data[0];

  const user = {
    platform: 'X',
    profile_url: `https://twitter.com/${p?.user?.screen_name}`,
    username: p?.user?.name,
    user_image: p?.user?.profile_image_url_https,

    user_info: `${p?.user?.friends_count} Friends | ${p?.user?.followers_count} Followers`,
  };

  return [responsePosts.data, user];
};

const scrapeTwitterAsync = async () => {
  // Steps For Async Scraping:
  // 1. to run a scan, get a scan receipt id from https://api.apify.com/v2/acts/quacker~twitter-url-scraper/runs
  // 2. provide scan receipt id for checking status of completion of scan from https://api.apify.com/v2/actor-runs/${id}
  // 3. if status is SUCCEEDED then use defaultDatasetId for getting data from https://api.apify.com/v2/datasets/${defaultDatasetId}/items

  try {
    const response = await axios.post(
      `https://api.apify.com/v2/acts/quacker~twitter-url-scraper/runs?token=${APIFY_API}`,
      {
        startUrls: [
          {
            url: 'https://twitter.com/elonmusk',
          },
        ],
        tweetsDesired: 1,
        addUserInfo: true,
      },
    );

    const items = response.data;

    console.log(JSON.stringify(items, 0, 2));
  } catch (error) {
    console.error(error.message);
  }
};

// scrapeTwitter('https://twitter.com/patrickbetdavid')
//   .then((O) => console.log(JSON.stringify(O, 0, 2)))
//   .catch((e) => console.log(e?.message, e?.response?.data));

module.exports = { scrapeTwitter };
