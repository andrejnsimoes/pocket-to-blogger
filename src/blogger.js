'use strict';

const path = require('path');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const blogger = google.blogger('v3');

const defaultImage =
  process.env.GOOGLE_BLOGGER_DEFAULT_IMAGE ||
  'https://lh3.googleusercontent.com/-xXiVLUL1PQg/VJ8HJGh11vI/AAAAAAAAFbQ/IP2Vky0DlOo/w498-h255-no/3bd01cb.jpg';

function sleep(millis) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}

function authorize() {
  return new Promise(async (resolve, reject) => {
    const auth = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    if (process.env.GOOGLE_ACCESS_TOKEN) {
      auth.setCredentials({ access_token: process.env.GOOGLE_ACCESS_TOKEN });
      google.options({ auth });
      resolve('GOOGLE_ACCESS_TOKEN already defined');
      return;
    }

    if (!process.env.GOOGLE_CODE_TOKEN) {
      const url = auth.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/blogger',
      });

      console.log({ url });
      reject('GOOGLE_CODE_TOKEN to be defined');
      return;
    }

    const { tokens } = await auth.getToken(process.env.GOOGLE_CODE_TOKEN);
    console.log({ tokens });
    reject('GOOGLE_ACCESS_TOKEN to be defined');
  });
}

async function createPost({ title, excerpt, url, image = defaultImage }) {
  await authorize();

  const content =
    `<div class="ajs_post_separator"><a href="${image}" class="ajs_post_img_link"><img class="ajs_post_img" src="${image}" /></a></div>\n` +
    '<br />\n' +
    `${excerpt}<br />\n` +
    '<br />\n' +
    `<a href="${url}" class="ajs_post_fullarticle_link">Full article</a><br />\n`;

  const newPost = {
    requestBody: {
      content,
      title,
    },
    blogId: process.env.GOOGLE_BLOG_ID,
  };

  const res = await blogger.posts.insert(newPost);
  // console.log(res.data);
  return res.data;
}

async function listPosts() {
  // Obtain user credentials to use for the request
  const blogger = google.blogger({
    version: 'v3',
    auth: process.env.GOOGLE_BLOGGER_AUTH,
  });

  const res = await blogger.posts.list({ blogId: process.env.GOOGLE_BLOG_ID });

  // console.log(res.data);
  return res.data.items;
}

module.exports = { createPost, listPosts };
