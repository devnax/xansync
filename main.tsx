import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { useSync, withSync } from "./src";

const Async = () => {
  const [id, setId] = useState(1);
  const { data, isLoading, error, reload } = useSync(async () => {
    return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then(
      (res) => res.json(),
    );
  }, [id]);

  console.log(data, isLoading);

  if (isLoading) return <>Loading...</>;
  if (error) return <>Error: {error.message}</>;

  return (
    <>
      <h2>{data.title}</h2>
      <p>{data.body}</p>
      <button onClick={() => setId(id + 1)}>Random Post</button>
    </>
  );
};

const AsyncPost = withSync<{ id: number }>(async ({ id }) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`,
  );
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  const post = (await response.json()) as { title: string; body: string };
  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
    </article>
  );
});

const App = () => {
  const [postId, setPostId] = useState(1);
  return (
    <div
      style={{
        fontFamily: "monospace,math, sans-serif",
        textAlign: "center",
        marginTop: "50px",
      }}
    >
      <div style={{ marginTop: "50px" }}>
        <Async />

        <h1>withSync Post</h1>
        <button onClick={() => setPostId((id) => id + 1)}>
          Load next post
        </button>

        <AsyncPost id={postId} />
      </div>
    </div>
  );
};
const rootEle = document.getElementById("root");
if (rootEle) {
  const root = createRoot(rootEle);
  root.render(<App />);
}
