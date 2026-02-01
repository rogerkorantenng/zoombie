import { Devvit } from '@devvit/public-api';
import { GamePost } from './components/GamePost.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add menu item to create game post
Devvit.addMenuItem({
  label: 'Create Zombie Apocalypse Game',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const subreddit = await context.reddit.getCurrentSubreddit();
    const post = await context.reddit.submitPost({
      title: '🧟 Zombie Apocalypse - Survive the Horde! 🧟',
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="center middle" backgroundColor="#1a0a0a">
          <text size="xxlarge" weight="bold" color="#ff4444">
            🧟 ZOMBIE APOCALYPSE 🧟
          </text>
          <text size="medium" color="#cccccc">
            Loading game...
          </text>
        </vstack>
      ),
    });
    context.ui.navigateTo(post);
  },
});

// Register custom post type
Devvit.addCustomPostType({
  name: 'Zombie Apocalypse',
  height: 'tall',
  render: (context) => <GamePost context={context} />,
});

export default Devvit;
