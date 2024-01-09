const rpcInfo = {
  largeImageKey: 'youtube-main',
  largeImageText: 'Youtube',
  smallImageKey: 'small-thumbpng',
  smallImageText: 'Opened in electron app',
};

const ytPause = (rpcInfo) => {
  delete rpcInfo.endTimestamp;
  rpcInfo.smallImageKey = 'pause';
  rpcInfo.smallImageText = 'Paused';
};

const ytPlay = (rpcInfo, videoName, author, videoUrl) => {
  rpcInfo.details = videoName;
  rpcInfo.state = '𝗖𝗵𝗮𝗻𝗻𝗲𝗹: ' + author;
  rpcInfo.smallImageKey = 'play';
  rpcInfo.smallImageText = 'Playing';
  rpcInfo.buttons = [{ label: 'Watch', url: videoUrl }];
};

const rpcReset = async (win) => {
  const url = win.webContents.getURL();

  rpcInfo.details = 'Browsing';
  rpcInfo.state = 'Homepage';
  rpcInfo.smallImageKey = 'small-thumbpng';

  console.log(url);

  const pathname = new URL(url).pathname;
  const parts = pathname.split('/');
  const channelName = parts[1];

  const channelRegex = /^https:\/\/www\.youtube\.com\/@[\w-]+$/;
  const featuredRegex = /^https:\/\/www\.youtube\.com\/@[\w-]+\/featured$/;
  const videosRegex = /^https:\/\/www\.youtube\.com\/@[\w-]+\/videos$/;
  const playlistRegex = /^https:\/\/www\.youtube\.com\/@[\w-]+\/playlists$/;
  const streamRegex = /^https:\/\/www\.youtube\.com\/@[\w-]+\/streams$/;
  const searchRegex = /^https:\/\/www\.youtube\.com\/results\?search_query/;

  switch (true) {
    case featuredRegex.test(url):
      rpcInfo.state = `${channelName}\ Featured videos`;
      break;
    case channelRegex.test(url):
      rpcInfo.state = `${channelName}\ Channel`;
      break;
    case videosRegex.test(url):
      rpcInfo.state = `${channelName}\ Videos`;
      break;
    case playlistRegex.test(url):
      rpcInfo.state = `${channelName}\ Playlist`;
      break;
    case streamRegex.test(url):
      rpcInfo.state = `${channelName}\ streams`;
      break;
    case searchRegex.test(url): {
      const searchParams = new URLSearchParams(new URL(url).search);
      const query = searchParams.get('search_query');
      rpcInfo.state = `searching for ${query}`;
      break;
    }
    default:
      rpcInfo.state = url;
      break;
  }

  if (rpcInfo.buttons || rpcInfo.endTimestamp) {
    delete rpcInfo.buttons;
    delete rpcInfo.endTimestamp;
  }
};

module.exports = { rpcInfo, ytPause, ytPlay, rpcReset };
