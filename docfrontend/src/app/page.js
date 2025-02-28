"use client";
import { useState } from "react";
import { ChatInterface } from "./components/ChatInterface";
import { JsonCarousel } from "./components/JsonCarousel";

export default function Home() {
  const [jsonData, setJsonData] = useState([]);

  const handleNewJson = (newResults) => {
    if (!newResults || !Array.isArray(newResults.results)) {
      console.error("Invalid results format:", newResults);
      return;
    }
    setJsonData(newResults.results);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24">
      <div className="w-full max-w-4xl space-y-8">
        <h1 className="text-4xl font-bold text-center"> Doctor Search</h1>
        
        <ChatInterface onNewJson={handleNewJson} />

        {jsonData.length > 0 ? (
          <JsonCarousel jsonData={jsonData} />
        ) : (
          <div className="text-center text-gray-500">
            No products found. Try searching for something!
          </div>
        )}
      </div>
    </main>
  );
}
