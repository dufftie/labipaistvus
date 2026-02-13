import type { ThemeConfig } from 'antd';

const darkTheme: ThemeConfig = {
  token: {
    colorInfo: '#ffffff',
    colorPrimaryBg: '#121212',
    colorPrimaryActive: '#fa541c',
    colorSuccess: '#8fcc7e',
    colorError: '#ea5753',
    fontFamily: "'Mulish', sans-serif",
    colorBgBase: '#121212',
    colorTextBase: '#bcd1e3',
  },
  components: {
    Button: {
      fontFamily: "'IBM Plex Mono', monospace",
      contentFontSizeLG: 20,
    },
  },
};

export default darkTheme; 