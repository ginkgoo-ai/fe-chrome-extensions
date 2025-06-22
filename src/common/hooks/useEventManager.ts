import { useCallback, useEffect } from "react";
import EventManager from "@/common/kits/EventManager";

/**
 * 自定义 Hook，用于订阅和管理事件
 * @param eventName 事件名称
 * @param callback 事件回调函数
 * @param deps 依赖数组，用于控制事件监听器的重新订阅
 */
export const useEventManager = (eventName: string, callback: (data: any) => void, deps: any[] = []) => {
  // 使用 useCallback 缓存回调函数，避免不必要的重新订阅
  const memoizedCallback = useCallback(callback, deps);

  useEffect(() => {
    // 订阅事件
    EventManager.on(eventName, memoizedCallback);

    // 清理函数：组件卸载时取消订阅
    return () => {
      EventManager.off(eventName, memoizedCallback);
    };
  }, [eventName, memoizedCallback]);

  // 返回一些有用的方法供组件使用
  return {
    // 发送事件
    emit: (data: any) => EventManager.emit(eventName, data),
    // 手动取消订阅
    off: () => EventManager.off(eventName, memoizedCallback),
    // 清除特定事件的所有监听器
    clear: () => EventManager.clear(eventName),
    // 清除所有事件的监听器
    clearAll: () => EventManager.clearAll(),
  };
};
