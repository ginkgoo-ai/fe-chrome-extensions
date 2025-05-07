import "./index.less";

// function Content(): JSX.Element {
//   const [isShowModalVisible, setShowModalVisible] = useState(false);

//   const handleBtnClick = (): void => {
//     setShowModalVisible(true);
//   };

//   const handleModalClose = (): void => {
//     setShowModalVisible(false);
//   };

//   return (
//     <div className="CRX-content">
//       <div className="content-entry" onClick={handleBtnClick}></div>
//       {isShowModalVisible ? <MKMainModal onClose={handleModalClose} /> : null}
//     </div>
//   );
// }

// // 创建id为CRX-container的div
// const app = document.createElement("div");
// app.id = "CRX-container";
// // 将刚创建的div插入body最后
// document.body.appendChild(app);
// // 将ReactDOM插入刚创建的div
// const crxContainer = ReactDOM.createRoot(document.getElementById("CRX-container")!);
// crxContainer.render(<Content />);

// // 向目标页面驻入js
// try {
//   let insertScript = document.createElement("script");
//   insertScript.setAttribute("type", "text/javascript");
//   // insertScript.src = window.chrome.runtime.getURL("insert.js");
//   insertScript.src = ChromeManager.getURLRuntime("insert.js");
//   document.body.appendChild(insertScript);
// } catch (err) {}

// 监听复制操作
// try {
//   document.addEventListener("copy", (event: ClipboardEvent) => {
//     // 获取被复制的文本内容
//     const clipboardData = event.clipboardData || window.clipboardData;
//     if (!clipboardData || !clipboardData.items) {
//       console.log("暂不支持复制");
//       return;
//     }
//     const text = clipboardData.getData("text");
//     console.log("得到复制内容", text);
//   });
// } catch (err) {}

// window.addEventListener("load", () => {
//   try {
//     // 访问window对象上的数据
//     const info = window.DEBUG_TEST;

//     // 将数据发送到插件的background脚本
//     ChromeManager.sendMessageRuntime({
//       type: "test",
//       info,
//     });
//     console.log("0000", info);
//   } catch (error) {
//     console.log("0000 error", error);
//   }
// });
