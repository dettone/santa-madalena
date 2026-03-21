"use client";
import useSWR from "swr";

async function fetchApi(key: string) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <div>
      <h1 className="text-xl font-bold">Database Info</h1>
      <UpdatedAt />
      <DataBaseInfo />
    </div>
  );
}

function UpdatedAt() {
  const { isLoading, data } = StatusApi();
  return (
    <div>
      {isLoading ? (
        "Loading..."
      ) : (
        <>
          <strong>Last updated at: </strong>
          {new Date(data.updated_at).toLocaleString()}
        </>
      )}
    </div>
  );
}

function DataBaseInfo() {
  const { isLoading, data } = StatusApi();
  const { version, maxConnections, usedConnections } = data || {};
  return (
    <div>
      {isLoading ? (
        "Loading..."
      ) : (
        <ul>
          <li>
            <strong>Version:</strong> {version}
          </li>
          <li>
            <strong>Max Connections:</strong> {maxConnections}
          </li>
          <li>
            <strong>Used Connections:</strong> {usedConnections}
          </li>
        </ul>
      )}
    </div>
  );
}

function StatusApi() {
  const { isLoading, data } = useSWR("/api/status", fetchApi, {
    refreshInterval: 2000,
  });
  return { isLoading, data };
}
