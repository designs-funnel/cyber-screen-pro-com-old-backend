const axios = require('axios');
require('dotenv').config();

const askAITextAndImage = async (inputText, imageUrl) => {
  const apiKey = process.env.GEMINI_GPT_API;

  const imageRes = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
  });

  if (!imageRes.statusText === 'OK') {
    throw new Error(`Failed to download image: ${imageUrl}`);
  }

  const base64Image = Buffer.from(imageRes.data, 'binary').toString('base64');

  const postData = {
    contents: [
      {
        parts: [
          {
            text: inputText,
          },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Image,
            },
          },
        ],
      },
    ],
    safety_settings: [
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`;
  const response = await axios.post(url, postData);
  const text = response.data.candidates[0].content.parts[0].text;
  return text;
};

// try JSON.parse(res)
// try catch at usage level is good?
// retry 3 times other wise report to developer in email
const labelTextAndImage = async (text, image) => {
  const res = await askAITextAndImage(
    `Output valid JSON in format: {"translation": "translation only if possible", "label": "Positive or Negative", "label_reason": "The reason of label", tags: [any negative related tags from Harassment, Intolerance, Nudity, Violence, Threats, Crime, Cannabis, Drugs, Political]}
      
      Label links or empty data as "Positive"
      Label smoking as "Negative"

      The social media post is:
      
      ${text}. I am attaching an image.`,
    image,
  );

  return res;
};

// resize image for faster results

// labelTextAndImage(
//   'Might have a little dirt on my boots 🤠 💨',
//   'https://scontent-cdninstagram-com.translate.goog/v/t51.2885-15/75616342_457155821860256_456751232918193434_n.jpg?stp=dst-jpg_e35_s1080x1080&_nc_ht=scontent.cdninstagram.com&_nc_cat=108&_nc_ohc=vR1smJjGZ8cQ7kNvgH53lC9&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfDoJGnRnAxGnCmyzZfcOSGpNRyrjAg1XNTXAfSCBMt-Rg&oe=663A4935&_nc_sid=10d13b',
// ).then(console.log);

labelTextAndImage(
  'Pocket full of stripes 🎱',
  'https://scontent-cdninstagram-com.translate.goog/v/t51.2885-15/47690599_2146792785634828_3907233032875444963_n.jpg?stp=dst-jpg_e35&_nc_ht=scontent.cdninstagram.com&_nc_cat=104&_nc_ohc=STmJCgVXek4Q7kNvgHYd-bb&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfDN-CB1fIYM3w8L3TFP6H2KnFL7cctusgwe2ACfOSKlIQ&oe=663A3470&_nc_sid=10d13b',
).then(console.log);

module.exports = labelTextAndImage;
