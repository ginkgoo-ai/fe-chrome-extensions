import { useEffect, useState } from "react";
import CacheManager from "@/common/kits/CacheManager";
import UtilsManager from "@/common/kits/UtilsManager";

/**
 * 拥有缓存能力的useState
 * @param initialState
 * @param key
 * @returns
 */
export default function useSyncStorageChromeState<T>(initialState: T, key: string): [T, (newValue: T) => void] {
  const [value, setValue] = useState<T>(initialState);

  const init = async (): Promise<void> => {
    const obj = (await CacheManager.getSyncStorageChrome([key])) || {};
    const valueSync = obj[key];
    if (UtilsManager.checkValueExist(valueSync)) {
      setValue(valueSync);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return [
    value,
    (newValue: T) => {
      const obj = { [key]: newValue };
      CacheManager.setSyncStorageChrome(obj);
      setValue(newValue);
    },
  ];
}
