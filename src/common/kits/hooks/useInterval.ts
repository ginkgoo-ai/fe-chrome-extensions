import { useEffect, useRef } from "react";

interface UseIntervalOptions {
  delay?: number;
  immediate?: boolean;
  enabled?: boolean;
}

export function useInterval(callback: () => void, options: UseIntervalOptions = {}) {
  const { delay = 1000, immediate = false, enabled = true } = options;
  const savedCallback = useRef<() => void>();
  const timerRef = useRef<NodeJS.Timeout>();

  // 保存最新的回调函数
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // 设置定时器
  useEffect(() => {
    const tick = () => {
      savedCallback.current?.();
    };

    if (immediate && enabled) {
      tick();
    }

    if (delay !== null && enabled) {
      timerRef.current = setInterval(tick, delay);
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [delay, immediate, enabled]);

  // 返回清除定时器的方法
  const clear = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  return { clear };
}
