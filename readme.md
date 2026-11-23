# xansync

Lightweight React utilities for loading asynchronous data in components. `xansync` provides a hook for managing data, loading and error state, plus a higher-order component for rendering a loaded value.

Website: [xansync.devnax.com](https://xansync.devnax.com)

## Installation

```bash
npm install xansync
```

The package uses React hooks and should be used from a React component. In frameworks with server and client components, use it in a client component.

## `useSync`

Use `useSync` to run an asynchronous function and access its result and request state.

```tsx
import { useState } from "react";
import { useSync } from "xansync";

type Post = {
  id: number;
  title: string;
  body: string;
};

function PostViewer() {
  const [postId, setPostId] = useState(1);
  const { data, isLoading, error, reload } = useSync<Post>(async () => {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/posts/${postId}`
    );

    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    return response.json() as Promise<Post>;
  }, [postId]);

  if (error) {
    return <p role="alert">Could not load post: {error.message}</p>;
  }

  return (
    <section>
      {isLoading && <p>Loading...</p>}
      {data && (
        <article>
          <h2>{data.title}</h2>
          <p>{data.body}</p>
        </article>
      )}
      <button onClick={() => setPostId((id) => id + 1)}>
        Load next post
      </button>
      <button onClick={reload} disabled={isLoading}>
        Reload
      </button>
    </section>
  );
}
```

### Signature

```ts
useSync<T>(
  asyncFn: () => Promise<T>,
  deps: any[] = []
): UseAsyncResult<T>
```

`deps` controls when the asynchronous function is recreated and run again. Include every changing value read by `asyncFn`; for example, include `postId` when the request uses it.

The returned `UseAsyncResult<T>` contains:

| Property | Type | Description |
| --- | --- | --- |
| `data` | `T \| null` | The most recently resolved value, or `null` before a value is available. |
| `setData` | `Dispatch<SetStateAction<T \| null>>` | Update the stored value directly. |
| `isLoading` | `boolean` | Whether the current operation is in progress. |
| `error` | `Error \| null` | The error from the most recent failed operation, if any. |
| `reload` | `() => void` | Run the asynchronous function again. |

When a new operation starts, the hook clears the previous error. If the component unmounts or a newer operation replaces the current one, the older result is ignored. The underlying promise is not cancelled; `asyncFn` does not receive an `AbortSignal`.

## `withSync`

Use `withSync` to wrap an asynchronous component function. It receives the component props, waits for its promise to resolve to a React node, and then renders that node.

```tsx
import { withSync } from "xansync";

type Profile = {
  name: string;
};

type ProfileProps = {
  userId: string;
};

const ProfileCard = withSync<ProfileProps>(
  async ({ userId }) => {
    const response = await fetch(`/api/profile/${encodeURIComponent(userId)}`);
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    const profile = (await response.json()) as Profile;
    return <p>Welcome, {profile.name}.</p>;
  }
);

function App() {
  return <ProfileCard userId="123" />;
}
```

### Signature

```ts
withSync<P extends object>(
  Component: (props: P) => Promise<React.ReactNode>
): (props: P) => React.ReactNode
```

The wrapped component starts the async function after mounting and runs it again when the props object changes. It renders nothing while loading. If the promise rejects, the error is thrown during rendering so the nearest React error boundary can handle it. When props change or the component unmounts, results from the previous request are ignored; the underlying promise is not cancelled.

