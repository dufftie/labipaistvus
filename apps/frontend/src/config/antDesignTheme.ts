import type { ThemeConfig } from 'antd';

const antDesignTheme: ThemeConfig = {
  token: {
    colorPrimary: '#121111',
    colorInfo: '#121111',
    colorPrimaryBg: '#f6e6db',
    colorPrimaryActive: '#fa541c',
    colorSuccess: '#8fcc7e',
    colorError: '#ea5753',
    fontFamily: "'Mulish', sans-serif",
  },
  components: {
    Button: {
      fontFamily: "'IBM Plex Mono', monospace",
      contentFontSizeLG: 20,
    },
  },
};

export default antDesignTheme;