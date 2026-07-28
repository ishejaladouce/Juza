import * as React from 'react';

export type AsyncState<T> =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: T | null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: string };

/** Load async data and track loading / error state. */
export function useAsync<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList,
): AsyncState<T> {
  const [state, setState] = React.useState<AsyncState<T>>({
    status: 'loading',
    data: null,
    error: null,
  });

  React.useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({
      status: 'loading',
      data: prev.status === 'success' ? prev.data : null,
      error: null,
    }));

    fn(controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return;
        setState({ status: 'success', data, error: null });
      },
      (err: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : 'Something went wrong.';
        setState({ status: 'error', data: null, error: message });
      },
    );

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
