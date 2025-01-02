// routes/employeeScan.js

const { ObjectId } = require('mongodb');
const labelText = require('../utilGeminiText');
const { scrapeFb } = require('../utilScrapeFb');
const { scrapeInsta } = require('../utilScrapeInsta');
const { scrapeTwitter } = require('../utilScrapeTwitter');
const { scrapeLinkedin } = require('../utilScrapeLinkedin');

// Run Employee Scan
async function runEmployeeScan(employeeId) {
  // Perform the scan operation here
  return 'Employee scan initiated successfully';
}

// Get Employee Scan Progress Percentage
async function getEmployeeScanProgress(employeeId) {
  // Calculate and return the progress percentage
  return '100%';
}

// Get Employee Scan Report
async function getEmployeeScanReport(employee, user) {
  // Fetch and return the scan report based on the platform

  // get social links of a user
  // traverse links
  // for fb link call fb scraper
  // for insta link call insta scraper
  // for x link call x scraper
  // gather data in respective variables

  const fbData = []; // require('../data/fb-jayshetty.json');
  const instaData = []; // require('../data/insta-jayshetty.json');
  const xData = []; // require('../data/x-jayshetty.json');
  const linkedinData = [];

  const posts = [];
  const userProfiles = [];

  const links = employee?.socialLinks;
  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    if (link.includes('facebook.com')) {
      const [posts, user] = await scrapeFb(link);
      fbData.push(...posts);
      userProfiles.push(user);
    } else if (link.includes('instagram.com')) {
      const [posts, user] = await scrapeInsta(link);
      instaData.push(...posts);
      userProfiles.push(user);
    } else if (link.includes('linkedin.com')) {
      const [posts, user] = await scrapeLinkedin(link);
      linkedinData.push(...posts);
      userProfiles.push(user);
    } else if (link.includes('twitter.com') || link.includes('x.com')) {
      const [posts, user] = await scrapeTwitter(link);
      xData.push(...posts);
      userProfiles.push(user);
    }
  }

  for (let i = 0; i < fbData.length; i++) {
    const p = fbData[i];
    const text = p.text;

    let { label, label_reason, tags } = await labelText(text);
    if (
      user?.positive_keywords?.some((k) =>
        text?.toLowerCase()?.includes(k?.toLowerCase()),
      )
    ) {
      label = 'Positive';
      label_reason = 'Positive Keyword';
    }
    if (
      user?.negative_keywords?.some((k) =>
        text?.toLowerCase()?.includes(k?.toLowerCase()),
      )
    ) {
      label = 'Negative';
      label_reason = 'Negative Keyword';
    }
    posts.push({
      platform: 'Facebook',
      time: p.time,
      text,
      url: p.url,
      image: p?.media?.[0]?.thumbnail,
      media_type: p?.media?.[0]?.__typename?.toLowerCase(),
      label,
      label_reason,
      tags,
    });
  }

  for (let i = 0; i < instaData.length; i++) {
    const p = instaData[i];
    const text = p.caption === '' ? 'Positive' : p.caption;

    let { label, label_reason, tags } = await labelText(text);
    if (
      user?.positive_keywords?.some((k) =>
        text?.toLowerCase()?.includes(k?.toLowerCase()),
      )
    ) {
      label = 'Positive';
      label_reason = 'Positive Keyword';
    }
    if (
      user?.negative_keywords?.some((k) =>
        text?.toLowerCase()?.includes(k?.toLowerCase()),
      )
    ) {
      label = 'Negative';
      label_reason = 'Negative Keyword';
    }

    posts.push({
      platform: 'Instagram',
      time: p.timestamp,
      text,
      url: p.url,
      image: p?.displayUrl,
      media_type: ['Image', 'Sidecar'].includes(p.type)
        ? 'photo'
        : p.type?.toLowerCase(),
      label,
      label_reason,
      tags,
    });
  }

  // TODO: improve repetitive code
  for (let i = 0; i < linkedinData.length; i++) {
    const p = linkedinData[i];
    const text = p.postText === '' ? 'Positive' : p.postText;

    let { label, label_reason, tags } = await labelText(text);
    if (
      user?.positive_keywords?.some((k) =>
        text?.toLowerCase()?.includes(k?.toLowerCase()),
      )
    ) {
      label = 'Positive';
      label_reason = 'Positive Keyword';
    }
    if (
      user?.negative_keywords?.some((k) =>
        text?.toLowerCase()?.includes(k?.toLowerCase()),
      )
    ) {
      label = 'Negative';
      label_reason = 'Negative Keyword';
    }

    posts.push({
      platform: 'Linkedin',
      time: p?.postedAt,
      text,
      url: p?.postLink,
      image: p?.imageComponent?.[0] || p?.linkedInVideoComponent?.thumbnail,
      media_type:
        (p?.imageComponent?.[0] && 'photo') ||
        (p?.linkedInVideoComponent?.thumbnail && 'video') ||
        'text',
      label,
      label_reason,
      tags,
    });
  }

  for (let i = 0; i < xData.length; i++) {
    const p = xData[i];
    const text = p.full_text;

    let { label, label_reason, tags } = await labelText(text);
    if (
      user?.positive_keywords?.some((k) =>
        text?.toLowerCase()?.includes(k?.toLowerCase()),
      )
    ) {
      label = 'Positive';
      label_reason = 'Positive Keyword';
    }
    if (
      user?.negative_keywords?.some((k) =>
        text?.toLowerCase()?.includes(k?.toLowerCase()),
      )
    ) {
      label = 'Negative';
      label_reason = 'Negative Keyword';
    }

    posts.push({
      platform: 'X',
      time: p.created_at,
      text,
      url: p.url,
      image: p?.media?.[0]?.media_url,
      media_type: p?.media?.[0]?.type, // TODO: how text media type appears on backend and frontend?
      label,
      label_reason,
      tags,
    });
  }

  return { posts, userProfiles };
}

// getEmployeeScanReport(
//   {
//     socialLinks: [
//       // 'https://twitter.com/jayshetty',
//       // 'https://facebook.com/jayshetty',
//       // 'https://instagram.com/jayshetty',
//       'https://linkedin.com/in/softmuneeb',
//     ],
//   },
//   { positive_keywords: [], negative_keywords: [] },
// ).then(console.log);

// Get Employee Scan Summary
async function getEmployeeScanSummary(employeeId) {
  // Calculate and return the scan summary
  return [
    {
      pos: 34,
      neg: 48,
      neutral: 126,
      political: 20,
      image: '',
      followers: 30,
      following: 20,
    },
  ];
}

// Send an email to the employee about his report
async function sendEmailToEmployee(employeeId) {
  // Send the email to the employee
  return 'Email sent successfully';
}

async function saveKeywordsFilter(req, res, usersCollection) {
  const { userId } = req;
  const { positive_keywords, negative_keywords } = req.body;

  // TODO: try catch or by default error log in express then send email to dev
  await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        positive_keywords,
        negative_keywords,
      },
    },
  );
  res.status(200).json({ message: 'Employee updated successfully' });
}

module.exports = {
  runEmployeeScan,
  getEmployeeScanProgress,
  getEmployeeScanReport,
  saveKeywordsFilter,
  getEmployeeScanSummary,
  sendEmailToEmployee,
};
