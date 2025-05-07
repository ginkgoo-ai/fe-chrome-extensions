const mock_url1 = "http://localhost:9002/#/home";
const mock_url2 = "https://www.baidu.com/";
const mock_url3 = "http://localhost:4100/";

const mock_localStorage = [
  {
    documentId: "68534920EDF2134CD75D7637A57E5CCF",
    result: [
      {
        storageKey: "key1",
        storageValue: "value1",
      },
      {
        storageKey: "key2",
        storageValue: "value2",
      },
    ],
  },
];

export const mock_chromeManager_executeScript_getLocalStorage = mock_localStorage;

export const mock_chromeManager_executeScript_queryHtmlInfo = "<html><body><h1>Hello, World!</h1></body></html>";

export const mock_chromeManager_createTab = mock_url2;

export const mock_chromeManager_queryTabInfo = mock_url2;

export default {
  mock_chromeManager_executeScript_getLocalStorage,
  mock_chromeManager_executeScript_queryHtmlInfo,
  mock_chromeManager_createTab,
  mock_chromeManager_queryTabInfo,
};
