'use strict';

const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');
require('dotenv').config();

async function createPost({ title, excerpt, blogUrl, imageUrl }) {
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_APP_KEY,
      appSecret: process.env.TWITTER_APP_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });

    const imageBuffer = Buffer.from(imageResponse.data);

    const mediaId = await client.v1.uploadMedia(imageBuffer, {
      mimeType: 'image/jpeg',
    });

    const tweet = await client.v2.tweet({
      text: `${title} 🔗 ${blogUrl}`,
      media: { media_ids: [mediaId] },
    });

    return tweet;
  } catch (error) {
    console.error('Error creating twitter post:', error);
    throw error;
  }
}

module.exports = { createPost };
