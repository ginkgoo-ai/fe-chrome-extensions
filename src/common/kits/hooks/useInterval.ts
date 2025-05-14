import { useEffect, useRef } from "react";

export function useInterval(callback: () => void, wait: number | null, immediate: boolean = false) {
  const savedCallback = useRef<() => void>();

  // 保存最新的回调函数
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // 设置定时器
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }

    if (wait !== null) {
      // 如果需要立即执行
      if (immediate) {
        tick();
      }
      const id = setInterval(tick, wait);
      return () => clearInterval(id);
    }
  }, [wait, immediate]);
}
