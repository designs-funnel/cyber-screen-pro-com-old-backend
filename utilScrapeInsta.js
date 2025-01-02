require('dotenv').config();
const { APIFY_API, POSTS_LIMIT } = process.env;
const axios = require('axios');
const { time } = require('./util');

const scrapeInsta = async (link) => {
  console.log(`${time()} start profile scrapeInsta(${link})`);
  const username = link.replace('https://instagram.com/', '').replace('/', '');
  const responsePosts = await axios.post(
    `https://api.apify.com/v2/acts/apify~instagram-post-scraper/run-sync-get-dataset-items?token=${APIFY_API}&memory=256`,
    {
      resultsLimit: Number(POSTS_LIMIT),
      username: [username],
    },
  );

  console.log(`${time()} start posts scrapeInsta(${link})`);
  const responseProfile = await axios.post(
    `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${APIFY_API}&memory=256`,
    {
      usernames: [username],
    },
  );

  const profile = responseProfile.data[0];
  const user = {
    platform: 'Instagram',
    profile_url: profile.url,
    username: profile.username,
    user_image: profile.profilePicUrl,

    user_info: `${profile.postsCount} Posts | ${profile.followersCount} Followers | ${profile.followsCount} Following`,
  };
  console.log(`${time()} end scrapeInsta(${link})`);
  return [responsePosts.data, user];
};
// rosypirani, sbeih.jpg
// scrapeInsta('https://instagram.com/sobisharif')
//   .then((O) => console.log(JSON.stringify(O, 0, 2)))
//   .catch((e) => console.log(e?.message, e?.response?.data));
module.exports = { scrapeInsta };
