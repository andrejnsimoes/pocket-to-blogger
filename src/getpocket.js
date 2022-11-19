'use strict';

const GetPocket = require('node-getpocket');
const util = require('util');
require('dotenv').config()

const POCKET_CONFIG = {
  consumer_key: process.env.POCKET_CONSUMER_KEY,
  redirect_uri: process.env.POCKET_REDIRECT_URI,
  access_token: process.env.POCKET_ACCESS_TOKEN,
};

const pocket = new GetPocket(POCKET_CONFIG);

function sleep(millis) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}

function authorize() {
  return new Promise(async (resolve, reject) => {
    if (POCKET_CONFIG.access_token) {
      resolve('POCKET_ACCESS_TOKEN defined');
      return;
    }

    const getRequestToken = util.promisify(pocket.getRequestToken).bind(pocket);
    const requestTokenResponse = await getRequestToken(POCKET_CONFIG);
    const requestToken = JSON.parse(requestTokenResponse.body).code;
    POCKET_CONFIG.request_token = requestToken;

    const url = pocket.getAuthorizeURL(POCKET_CONFIG);
    console.log({ url });

    await sleep(10000);

    const getAccessToken = util.promisify(pocket.getAccessToken).bind(pocket);
    const accessTokenReponse = await getAccessToken(POCKET_CONFIG);
    const access_token = JSON.parse(accessTokenReponse.body).access_token;
    POCKET_CONFIG.access_token = access_token;

    pocket.refreshConfig(POCKET_CONFIG);
    // console.log(POCKET_CONFIG);

    reject('POCKET_ACCESS_TOKEN to be defined');
  });
}

async function listFavPosts(filter = {}) {
  const defaultFilter = {
    count: '5',
    detailType: 'complete',
    favorite: '1',
    sort: 'newest',
    state: 'archive',
  };

  const filteringOptions = { ...defaultFilter, ...filter };

  await authorize();

  const getPocketPosts = util.promisify(pocket.get).bind(pocket);
  const res = await getPocketPosts(filteringOptions);

  // console.log(res.list);
  return res.list;
}

module.exports = { listFavPosts };
