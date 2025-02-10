'use strict';

const { BskyAgent } = require('@atproto/api');
const axios = require('axios');
require('dotenv').config();

async function createPost({ title, excerpt, blogUrl, imageUrl }) {
  const agent = new BskyAgent({
    service: 'https://bsky.social',
  });
  
  try {
    await agent.login({
      identifier: process.env.BSKY_USERNAME,
      password: process.env.BSKY_PASSWORD
    });

    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });

    const imageBuffer = Buffer.from(imageResponse.data);

    const uploadedImage = await agent.uploadBlob(imageBuffer, {
      encoding: 'image/jpeg',
    });


    const post = {
      text: '',
      embed: {
        $type: 'app.bsky.embed.external',
        external: {
          uri: blogUrl,
          title: title,
          description: excerpt,
          thumb: uploadedImage.data.blob,
        },
      },
    };

    const response = await agent.post(post);
    return response;
  } catch (error) {
    console.error('Error creating bsky post:', error);
    throw error;
  }
}

module.exports = { createPost };
