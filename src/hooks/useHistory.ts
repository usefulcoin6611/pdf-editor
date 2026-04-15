import { useState, useCallback } from "react";
import { toast } from "sonner";

/**
 * A generic hook to manage state with undo/redo capability.
 */
export function useHistory<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  const set = useCallback((newPresent: T | ((prev: T) => T)) => {
    setState((prevPresent) => {
      const computedNext = typeof newPresent === 'function' 
        ? (newPresent as (p: T) => T)(prevPresent) 
        : newPresent;
        
      if (computedNext === prevPresent) return prevPresent;

      // Limit history to 50 steps
      setPast((prev) => [...prev.slice(-49), prevPresent]);
      setFuture([]);
      return computedNext;
    });
  }, []);

  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setFuture((prev) => [state, ...prev.slice(0, 49)]);
    setPast(newPast);
    setState(previous);
    toast.info("Undo", { duration: 800 });
  }, [past, state]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast((prev) => [...prev.slice(-49), state]);
    setFuture(newFuture);
    setState(next);
    toast.info("Redo", { duration: 800 });
  }, [future, state]);

  const reset = useCallback((newState: T) => {
    setState(newState);
    setPast([]);
    setFuture([]);
  }, []);

  return {
    state,
    setState: set,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
