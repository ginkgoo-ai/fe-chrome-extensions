/**
 * 执行action
 */
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";

type ActionCreator = (dispatch: Dispatch) => Record<string, (...args: any[]) => void>;

export function useActions<T extends ActionCreator>(actionCreators: T, deps: any[] = []): ReturnType<T> {
  const dispatch = useDispatch();

  return useMemo(() => actionCreators(dispatch), deps ? [dispatch, ...deps] : [dispatch]);
}

export default useActions;
