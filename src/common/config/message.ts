export const MESSAGE = {
  // 通用提示
  TOAST_PROBLEM: "An unexpected problem has occurred.", // 发生了一个意外问题。
  TOAST_VERSION_MISMATCH: "Extension Outdated: Please reinstall and refresh.",

  // 用户
  TOAST_USER_ID_EMPTY: "User information could not be retrieved. Please try again later.", // 无法获取用户信息，请稍后重试。

  // Case 管理
  TOAST_CREATE_CASE_FAILED: "Case creation failed.", // Case 创建失败。
  TOAST_REFRESH_CASE_DETAIL_FAILED: "Failed to refresh case details.", // 刷新 Case 详情失败。
  TOAST_REFRESH_CASE_LIST_FAILED: "Failed to refresh the case list.", // 刷新 Case 列表失败。

  // Workflow 管理
  TOAST_CREATE_WORKFLOW_FAILED: "Workflow creation failed.", // Workflow 创建失败。
  TOAST_WORKFLOW_DEFINITIONS_MISSING: "A required workflow template could not be found.", // 未能找到所需的 Workflow 模板。
  TOAST_REFRESH_WORKFLOW_DEFINITIONS_FAILED: "Failed to refresh workflow templates.", // 刷新 Workflow 模板列表失败。
  TOAST_REFRESH_WORKFLOW_DETAIL_FAILED: "Failed to refresh workflow details.", // 刷新 Workflow 详情失败。
  TOAST_REFRESH_WORKFLOW_LIST_FAILED: "Failed to refresh the workflow list.", // 刷新 Workflow 列表失败。

  // Action
  TOAST_ANALYZE_ACTION_ERROR: "Failed to analyze the action result. Please try again.", //

  // 文件操作
  TOAST_UPLOAD_FILE_FAILED: "File upload failed.", // 文件上传失败。
  TOAST_UPLOAD_FILE_MAX: "Please upload a maximum of 10 files at a time.", // 上传文件一次性不能超过10个
  TOAST_UPLOAD_PDF_FILE_FAILED: "Failed to retrieve the PDF from the source system.", // 从源系统获取 PDF 失败。
  TOAST_BIND_PDF_FILE_FAILED: "Failed to attach the PDF to the workflow.", // 将 PDF 附加到 Workflow 失败。
  TOAST_DOWNLOAD_PDF_FILE_FAILED: "The PDF file could not be downloaded. Please try again later.", // PDF 文件无法下载，请稍后重试。

  // 警告及用户操作提示
  ALERT_MANUAL_TIP: "This step requires manual operation to continue.", // 此步骤需要手动操作才能继续。
  ALERT_QUERY_HTML_FAILED: "Failed to load page content. Please try again later.", // 加载页面内容失败，请稍后重试。
  ALERT_REPEAT_MAX: "Automation could not proceed. Please operate manually and then restart the process.", // 自动化流程无法继续。请手动操作，然后重启流程。
};
