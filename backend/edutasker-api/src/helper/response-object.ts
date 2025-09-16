export interface IPaginationResponse<T = any> {
  content: T[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export interface IPaginationWrapper<T extends any[]> {
  data: T;
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export interface IResponseObject<T> {
  message: string;
  content: T;
  messages: string[];
  code: string;
  success: boolean;
  pagination?: IPaginationResponse;
}

export const createResponseObject = <T>(params: {
  content: T;
  messages?: string[] | string;
  code: string;
  success: boolean;
  pagination?: IPaginationResponse;
}): IResponseObject<T> => {
  const { content, messages, code, success, pagination } = params;
  const messageArray = typeof messages === "string" ? [messages] : (messages ?? []);
  return {
    message: messageArray[0] ?? "",
    content,
    messages: messageArray,
    code,
    success,
    pagination,
  };
};

export const unwrapPaginationWrapper = <T extends any[]>(
  wrapper: IPaginationWrapper<T>,
  options?: {
    code?: string;
    messages?: string[] | string;
    success?: boolean;
  },
): IResponseObject<T> => {
  if (!wrapper?.data) throw new Error("Invalid wrapper: data is undefined");

  const messageArray =
    typeof options?.messages === "string" ? [options.messages] : (options?.messages ?? []);

  return {
    message: messageArray[0] ?? "",
    content: wrapper.data,
    messages: messageArray,
    code: options?.code ?? "200",
    success: options?.success ?? true,
    pagination: {
      content: wrapper.data,
      page: wrapper.page,
      size: wrapper.size,
      totalPages: wrapper.totalPages,
      totalElements: wrapper.totalElements,
    },
  };
};
