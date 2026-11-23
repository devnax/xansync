import { useEffect, useState } from "react";

type AsyncComponent<P> = (props: P) => Promise<React.ReactNode>;

export function withSync<P extends object>(Component: AsyncComponent<P>) {
  return function SyncComponent(props: P) {
    const [content, setContent] = useState<React.ReactNode>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      let active = true;

      async function execute() {
        setLoading(true);
        setError(null);

        try {
          const result = await Component(props);

          if (active) {
            setContent(result);
          }
        } catch (err) {
          if (active) {
            setError(err instanceof Error ? err : new Error("Unknown error"));
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      execute();

      return () => {
        active = false;
      };
    }, [props]);

    if (isLoading) return null;
    if (error) throw error;

    return content;
  };
}
