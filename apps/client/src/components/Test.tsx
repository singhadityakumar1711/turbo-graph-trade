import { useSearchParams } from "react-router-dom";

export default function Test() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Read the current value from the URL (e.g., ?q=react)
  // If it's empty, default to an empty string
  const query = searchParams.get("q") || "";

  const handleChange = (e: any) => {
    const text = e.target.value;
    if (text) {
      // 2. Update the URL to ?q=text
      setSearchParams({ q: text });
    } else {
      // 3. If empty, remove the param entirely
      setSearchParams({});
    }
  };

  return (
    <div>
      <h1>Search</h1>
      <input
        value={query}
        onChange={handleChange}
        placeholder="Search workflows..."
      />
      <p>Current URL param: {query}</p>
    </div>
  );
}
