const blogger = require('./blogger');
const getpocket = require('./getpocket');
const bsky = require('./bsky');

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
    const image = post?.image?.src || post?.top_image_url || process.env.POST_DEFAULT_IMAGE;

    const pocketPost = { title, excerpt, url, image };

    debug.pocketFavPosts.push(pocketPost);

    const isAlreadyPosted = bloggerPosts.some(
      (bloggerPost) => bloggerPost.title === title
    );

    if (!isAlreadyPosted) {
      const newBloggerPost = await blogger.createPost(pocketPost);
      debug.posted.push(pocketPost);

      const blogUrl = newBloggerPost.url;
      console.log({title, excerpt, blogUrl, image })
      await bsky.createPost({ title, excerpt, blogUrl, imageUrl: image });
    } else {
      debug.ignored.push(pocketPost);
    }
  }

  console.log(JSON.stringify(debug, null, 4));
}

main();
