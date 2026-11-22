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

## `withAsync`

Use `withAsync` to create a component that loads a value and passes it to a render function.

```tsx
import { withAsync } from "xansync";

type Profile = {
  name: string;
};

const ProfileCard = withAsync<Profile>(
  async () => {
    const response = await fetch("/api/profile");
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    return response.json() as Promise<Profile>;
  },
  (profile) => <p>Welcome, {profile.name}.</p>,
  <p>Loading profile...</p>,
  (error) => <p role="alert">Could not load profile: {error.message}</p>
);

function App() {
  return <ProfileCard />;
}
```

### Signature

```ts
withAsync<T>(
  loader: () => Promise<T>,
  render: (data: T) => React.ReactNode,
  fallback?: React.ReactNode,
  onError?: (error: Error) => React.ReactNode
): () => React.ReactNode
```

The returned component invokes `loader` when it mounts, displays `fallback` while loading, and uses `onError` to render a failure state. If no fallback or error renderer is provided, it renders nothing for that state. It also renders nothing if the resolved value is `null` or `undefined`.

## Development

```bash
npm run start
npm run build
npm run release
```

These scripts run the corresponding `makepack` commands.
