
export const fetchRedditPosts = async (symbol: string) => {
  try {
    // Fetch from multiple relevant subreddits
    const subreddits = ['wallstreetbets', 'stocks', 'investing'];
    const posts = await Promise.all(
      subreddits.map(async (subreddit) => {
        const response = await fetch(
          `https://www.reddit.com/r/${subreddit}/search.json?q=${symbol}&restrict_sr=on&limit=10&sort=new`
        );
        const data = await response.json();
        return data.data?.children || [];
      })
    );

    // Flatten and transform the posts
    return posts
      .flat()
      .map((post: any) => ({
        id: post.data.id,
        text: post.data.title + (post.data.selftext ? ` ${post.data.selftext}` : ''),
        author: post.data.author,
        timestamp: new Date(post.data.created_utc * 1000).toISOString(),
      }))
      .filter(post => post.text.length > 0)
      .slice(0, 10); // Limit to 10 most recent posts
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return [];
  }
};
