"use client";
import { useCompletion } from "ai/react";
import React, { useState, useEffect } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

import suggestions from "@/suggestions.json";
import { Loader2 } from "lucide-react";
import Link from "next/link";

// type SuggestedMessage = {
//   id: string;
//   text: string;
// };

export default function Page({ params }: { params: { username: string } }) {
  const [username, setUsername] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // const [aiIsLoading, setAiIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  // const [suggestedMessages, setSuggestedMessages] =
  //   useState<SuggestedMessage[]>(suggestions);
  const { toast } = useToast();

  useEffect(() => {
    const fetchParams = async () => {
      // Using React.use() to unwrap params as Promise
      const resolvedParams = await params;
      setUsername(resolvedParams.username); // Set username after resolving the Promise
    };

    fetchParams(); // Fetch params asynchronously
  }, [params]); // Re-run effect when params change

  const handleSendMessage = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/send-message", {
        username,
        content: message,
      });

      // console.log(response.data.message);
      toast({
        title: "Success",
        description: response.data.message,
      });

      setMessage(""); // Clear the form after sending
    } catch (error) {
      console.error("Error sending message", error);

      if (
        axios.isAxiosError(error) &&
        error.response?.data?.message === "User is not accepting messages"
      ) {
        toast({
          description:
            "User is not accepting messages. Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Using `useCompletion` hook to generate suggestions
  const {
    complete,
    completion,
    isLoading: aiIsLoading,
  } = useCompletion({
    api: "/api/suggest-messages", // Endpoint for generating suggestions
    onError: (error) => {
      console.error("Error fetching AI suggestions", error);

      toast({
        title: "Error",
        description: "Failed to fetch suggestions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSuggestMessages = () => {
    complete(""); // Trigger the useCompletion hook
  };

  // Split the suggestions string into a list
  const suggestedMessages = completion
    ? completion
        .split("||")
        .map((text, index) => ({ id: index.toString(), text: text.trim() }))
    : suggestions;

  // const handleSuggestMessages = async () => {
  //   try {
  //     const response = await axios.post("/api/suggest-messages");
  //     console.log(response);
  //   } catch (error) {
  //     console.error("Error fetching suggestions", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to fetch suggestions. Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  // const handleSuggestMessages = async () => {
  //   setAiIsLoading(true); // Show loading state during fetch
  //   try {
  //     const response = await axios.post("/api/suggest-messages");

  //     if (response.data.success) {
  //       const aiSuggestions = response.data.suggestions.map(
  //         (text: string, index: number) => ({
  //           id: `ai-${index}`,
  //           text,
  //         })
  //       );

  //       setSuggestedMessages(aiSuggestions);

  //       toast({
  //         title: "Suggestions generated!",
  //         description: "Click on any suggestion to use it.",
  //       });
  //     } else {
  //       toast({
  //         title: "Error",
  //         description: response.data.message || "Failed to fetch suggestions.",
  //         variant: "destructive",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching AI suggestions", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to fetch suggestions. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setAiIsLoading(false); // Hide loading state
  //   }
  // };

  // const handleSuggestMessages = async () => {
  //   setAiIsLoading(true);
  //   try {
  //     const response = await axios.post("/api/suggest-messages");
  //     const { data } = response;

  //     if (data.success) {
  //       setSuggestedMessages(
  //         data.suggestions.map((text: string, index: number) => ({
  //           id: index.toString(),
  //           text,
  //         }))
  //       );
  //     } else {
  //       throw new Error(data.message || "Unknown error");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching AI suggestions", error);

  //     if (axios.isAxiosError(error) && error.response?.status === 429) {
  //       toast({
  //         title: "Quota Exceeded",
  //         description: "OpenAI quota exceeded. Please try again later.",
  //         variant: "destructive",
  //       });
  //     } else {
  //       toast({
  //         title: "Error",
  //         description: "Failed to fetch suggestions. Please try again.",
  //         variant: "destructive",
  //       });
  //     }
  //   } finally {
  //     setAiIsLoading(false);
  //   }
  // };

  const handleSelectSuggestedMessage = (text: string) => {
    setMessage(text);
  };

  // Render a loading state if username is not available
  if (!username) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-4 w-4 animate-spin " />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-2xl bg-white p-6 shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-4">
          Send a Message to {username}
        </h1>
        <div className="mb-4">
          <Textarea
            placeholder="Write your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full"
          />
        </div>
        <Button onClick={handleSendMessage} className="w-full mb-4">
          {isLoading ? "Please Wait..." : "Send Message"}
        </Button>

        {/* <Button
          onClick={handleSuggestMessages}
          variant="outline"
          className="w-full"
        >
          Suggest Messages
        </Button> */}

        <Button
          onClick={handleSuggestMessages}
          variant="outline"
          className="w-full"
          disabled={aiIsLoading} // Disable button during loading
        >
          {aiIsLoading ? "Please Wait" : "Suggest Messages"}
        </Button>

        {suggestedMessages.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">
              Click on any message below to select it
            </h2>
            <ul className="space-y-2">
              {suggestedMessages.map((suggestion, index) => (
                <li
                  key={index}
                  className="cursor-pointer p-2 border rounded hover:bg-gray-100"
                  onClick={() => handleSelectSuggestedMessage(suggestion.text)}
                >
                  {suggestion.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don’t have an account?{" "}
          <Link href="/sign-up" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
