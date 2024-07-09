import { useState, useCallback, useEffect, useRef } from 'react'

// Unlike the class component setState, the updates are not allowed to be partial
type SetStateAction<S> = S | ((prevState: S) => S);
// this technically does accept a second argument, but it's already under a deprecation warning
// and it's not even released so probably better to not define it.
type Dispatch<A> = (value: A) => void;

type DispatchCallback<A> = (value: A, callback?: Dispatch<A>) => void;

function isFunctionReturnType<S> (param: SetStateAction<S>): param is ((param: S) => S) {
  return typeof param === 'function'
}

export function useStateCallback<S> (initState: S | (() => S)): [S, DispatchCallback<SetStateAction<S>>] {
  const callbackRef = useRef<Dispatch<S>>()
  const [innerState, setInnerState] = useState<S>(initState)

  const setState = useCallback<DispatchCallback<SetStateAction<S>>>(
    (newState: SetStateAction<S>, callback?: Dispatch<S>) => {
      setInnerState((prevState) => {
        callbackRef.current = callback
        return isFunctionReturnType<S>(newState) ? newState(prevState) : newState
      })
    }, [])

  useEffect(() => {
    if (typeof callbackRef?.current === 'function') {
      callbackRef?.current(innerState)
    }
  }, [innerState])

  return [innerState, setState]
}

export { useTableRequest } from './useTableRequest'
