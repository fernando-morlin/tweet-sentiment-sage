
export const fetchRedditPosts = async (symbol: string, settings: { startDate: Date; endDate: Date; subreddits: string[] }) => {
  try {
    // Fetch from specified subreddits
    const posts = await Promise.all(
      settings.subreddits.map(async (subreddit) => {
        const response = await fetch(
          `https://www.reddit.com/r/${subreddit}/search.json?q=${symbol}&restrict_sr=on&limit=100&sort=new`
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
        subreddit: post.data.subreddit,
        timestamp: new Date(post.data.created_utc * 1000).toISOString(),
        score: post.data.score,
        numComments: post.data.num_comments,
      }))
      .filter(post => {
        const postDate = new Date(post.timestamp);
        return post.text.length > 0 &&
               postDate >= settings.startDate &&
               postDate <= settings.endDate;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 30); // Limit to 30 most recent posts within date range
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return [];
  }
};
