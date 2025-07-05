import { SetStateAction, useEffect, useRef, useState } from "react";

// 类型定义：setState 支持 (value, callback) 形式
// callback 在 state 更新并渲染后执行
export function useStateCallback<S = any>(
  initialState: S | (() => S)
): [S, (value: SetStateAction<S>, callback?: void | (() => void)) => void] {
  const [state, setState] = useState<S>(initialState);
  const callbackRef = useRef<(() => void) | undefined>(undefined);

  // 包装 setState，允许传递回调
  const setStateCallback = (value: SetStateAction<S>, callback?: () => void) => {
    callbackRef.current = callback;
    setState(value);
  };

  // 监听 state 变化，变化后执行回调
  useEffect(() => {
    if (callbackRef.current) {
      callbackRef.current();
      callbackRef.current = undefined;
    }
  }, [state]);

  return [state, setStateCallback];
}
