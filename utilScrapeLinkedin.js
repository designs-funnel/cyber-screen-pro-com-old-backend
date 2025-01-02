require('dotenv').config();
const { RAPID_API_KEY, POSTS_LIMIT } = process.env;
const axios = require('axios');
const { time } = require('./util');

const headers = {
  'X-RapidAPI-Key': RAPID_API_KEY,
  'X-RapidAPI-Host': 'linkedin-data-scraper.p.rapidapi.com',
};

// TODO: Add link normalize lib
const scrapeLinkedin = async (url) => {
  console.log(`${time()} start posts scrapeLinkedin(${url})`);

  const optionsGetPosts = {
    method: 'POST',
    url: 'https://linkedin-data-scraper.p.rapidapi.com/profile_updates',
    headers,
    data: {
      profile_url: url,
      posts: Number(POSTS_LIMIT),
      comments: 0,
      reposts: 0,
    },
  };
  const responseGetPosts = await axios.request(optionsGetPosts);

  console.log(`${time()} start profile scrapeLinkedin(${url})`);
  const optionsGetProfile = {
    method: 'POST',
    url: 'https://linkedin-data-scraper.p.rapidapi.com/person',
    headers,
    data: { link: url },
  };
  const responseGetProfile = await axios.request(optionsGetProfile);
  const userData = responseGetProfile?.data?.data;
  const user = {
    platform: 'Linkedin',
    profile_url: url,
    username: userData?.fullName,
    user_image: userData?.profilePic,

    user_info: `${userData?.connections} Connections | ${userData?.followers} Followers`,
  };

  console.log(`${time()} end scrapeLinkedin(${url})`);

  return [responseGetPosts?.data?.response, user];
};

// scrapeLinkedin('https://linkedin.com/in/softmuneeb')
//   .then((res) => console.log(JSON.stringify(res, 0, 2)))
//   .catch((e) =>
//     console.log({
//       message: e?.message,
//       data: e?.response?.data,
//     }),
//   );
module.exports = { scrapeLinkedin };
