const blogger = require('./blogger');
const getpocket = require('./getpocket');
require('dotenv').config();

const debug = { bloggerPosts: [], pocketFavPosts: [], posted: [], ignored: [] };

async function main() {
  const bloggerPosts = await blogger.listPosts();
  const pocketFavPosts = await getpocket.listFavPosts();

  debug.bloggerPosts = bloggerPosts;

  for (const [key, post] of Object.entries(pocketFavPosts)) {
    const title = post.resolved_title;
    const excerpt = post.excerpt;
    const url = post.resolved_url;
    const image = post?.image?.src || post?.top_image_url;
    const pocketPost = { title, excerpt, url, image };

    debug.pocketFavPosts.push(pocketPost);

    const isAlreadyPosted = bloggerPosts.some(
      (bloggerPost) => bloggerPost.title === title
    );

    if (!isAlreadyPosted) {
      await blogger.createPost(pocketPost);
      debug.posted.push(pocketPost);
    } else {
      debug.ignored.push(pocketPost);
    }
  }

  console.log(JSON.stringify(debug, null, 4));
}

main();
