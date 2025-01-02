const axios = require('axios');
const { messageDev } = require('./utilEmailSend');
const { sleep, time, randomBetween } = require('./util');
require('dotenv').config();

const askAITextOnly = async (inputText) => {
  const apiKey = process.env.GEMINI_GPT_API;
  const postData = {
    contents: [
      {
        parts: [
          {
            text: inputText,
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
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  const response = await axios.post(url, postData);
  // console.log(JSON.stringify(response.data, 0, 2));
  const text = response.data.candidates[0].content.parts[0].text;
  return text;
};

const labelText = async (text) => {
  if (text?.trim() === '') {
    return { label: 'Positive', label_reason: 'Empty Post' };
  }

  let res;
  let logs = '';

  for (let i = 0; i < 5; i++) {
    try {
      res = await askAITextOnly(
        `Output valid JSON in format: {"translation": "translation only if possible", "label": "Positive or Negative", "label_reason": "The reason of label", tags: [any negative related tags from Harassment, Intolerance, Nudity, Violence, Threats, Crime, Cannabis, Drugs, Political]}
      
      Label links or empty data as "Positive"
      Label promoting smoking as "Negative"
      and stopping from smoking as "Positive"
      Stripes is referred to as cocaine
      💨 is referred to as smoking

      The social media post is:
      
      ${text}`,
      );

      logs += ' ' + time() + ' ' + res + '\n';

      const labelObj = JSON.parse(res);

      if (
        !['positive', 'negative', 'neutral'].includes(
          labelObj?.label?.toLowerCase(),
        )
      )
        throw new Error('Label not correct');

      console.log(
        i,
        `${time()} labelText ${labelObj?.label} ${text?.substring(0, 30)}... `,
      );

      return JSON.parse(res);
    } catch (error) {
      // too many requests
      if (error?.response?.status === 429) {
        const w = randomBetween(5, 15); // random wait so that requests are scattered accross time instead of parallel requests
        await sleep(w, 'sec');
        const eObj = {
          tag: `utilGeminiText.js:88`,
          res,
          time: time('is'),
          message: error?.message,
          data: error?.response?.data,
        };
        const m = JSON.stringify(eObj, 0, 2);
        logs += m;
      }
      // invalid json
      else if (
        error?.message?.includes('not valid JSON') ||
        error?.message?.includes('Label not correct') ||
        error?.message?.includes('Expected double-quoted property name in JSON')
      ) {
        await sleep(2, 'sec');
      }
      // new error
      else {
        const eObj = {
          tag: `utilGeminiText.js:105`,
          res,
          time: time('is'),
          message: error?.message,
          data: error?.response?.data,
        };
        const m = JSON.stringify(eObj, 0, 2);
        logs += m;
        messageDev(`Serious new issue, text ${text}, logs ${logs}`);
        return { label: 'Positive', label_reason: 'No negativity found' };
      }
    }
  }

  // all retries failed to label data
  messageDev(`Serious label issue, text ${text}, logs ${logs}`);
  return { label: 'Positive', label_reason: 'No negativity detected' };
};

// (async () => {
//   console.log(time(), 'start');

//   for (let i = 0; i < 20; i++) {
//     labelText('Got some dust on my boots 😃 💨', i);
//   }

//   console.log(time(), 'end');
// })();

labelText('Might have a little dirt on my boots 🤠 💨', 1).then(console.log);
labelText('Pocket full of stripes 🎱', 1).then(console.log);

module.exports = labelText;
