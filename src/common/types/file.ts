export enum FileStatus {
  UPLOADING = 'UPLOADING',
  ANALYSIS = 'ANALYSIS',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export enum FileTypeEnum {
  DOC = 'application/msword',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS = 'application/vnd.ms-excel',
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT = 'application/vnd.ms-powerpoint',
  PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  PDF = 'application/pdf',
  JSON = 'application/json',
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  GIF = 'image/gif',
  WEBP = 'image/webp',
  BMP = 'image/bmp',
  ICO = 'image/x-icon',
  TXT = 'text/plain',
  UNKNOW = 'unknow',
}

export interface ICloudFileType {
  id: string;
  originalName: string;
  storageName: string;
  fileType: FileTypeEnum;
  fileSize: number;
  storagePath: string;
  videoDuration?: number;
  videoThumbnailId?: string;
  videoThumbnailUrl?: string;
  videoResolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOcrFileType {
  id: string;
  title: string;
  description: string;
  filePath: string;
  fileType: FileTypeEnum;
  fileSize: number;
  storageId: string;
  caseId: string;
  documentType: string;
  downloadUrl: string;
  metadataJson: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface IFileItemType {
  localId: string;
  status: FileStatus;
  progress?: number; // ignore
  localFile?: File;
  cloudFile?: ICloudFileType;
  ocrFile?: IOcrFileType;
  ocrResult?: Record<string, string>[];
}
