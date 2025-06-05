const themeInfoDefault = {
  DEFAULT: {
    customStyle: {
      "--color-primary": "#ec6d2d",
    },
  },
};

const entryListDefault = [
  {
    appList: [
      {
        surface: {
          x: 0,
          y: 5,
          bgColorLight: "rgb(241 245 249)",
          bgColor: "rgb(100 116 139)",
          src: "icon-bug",
          name: "Debug",
        },
        info: {
          title: "Debug",
          url: "/debug",
        },
      },
      {
        surface: {
          x: 3,
          y: 5,
          bgColorLight: "rgb(241 245 249)",
          bgColor: "rgb(100 116 139)",
          src: "icon-info-circle",
          name: "About",
        },
        info: {
          title: "About",
          url: "/about",
        },
      },
    ],
  },
];

const config = {
  themeInfoDefault,
  entryListDefault,
};

export default config;
