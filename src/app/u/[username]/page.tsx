"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

import suggestions from "@/suggestions.json";

type SuggestedMessage = {
  id: string;
  text: string;
};

export default function Page({ params }: { params: { username: string } }) {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchParams = async () => {
      // Using React.use() to unwrap params as Promise
      const resolvedParams = await params;
      setUsername(resolvedParams.username); // Set username after resolving the Promise
    };

    fetchParams(); // Fetch params asynchronously
  }, [params]); // Re-run effect when params change

  const [message, setMessage] = useState("");
  const [suggestedMessages, setSuggestedMessages] =
    useState<SuggestedMessage[]>(suggestions);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    try {
      const response = await axios.post("/api/send-message", {
        content: message,
      });

      toast({
        title: "Success",
        description: response.data.message,
      });

      setMessage(""); // Clear the form after sending
    } catch (error) {
      console.error("Error sending message", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSuggestMessages = async () => {
    try {
      const response = await axios.post("/api/suggest-messages");
      console.log(response);
    } catch (error) {
      console.error("Error fetching suggestions", error);
      toast({
        title: "Error",
        description: "Failed to fetch suggestions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectSuggestedMessage = (text: string) => {
    setMessage(text);
  };

  // Render a loading state if username is not available
  if (!username) {
    return <div>Loading...</div>;
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
          Send Message
        </Button>

        <Button
          onClick={handleSuggestMessages}
          variant="outline"
          className="w-full"
        >
          Suggest Messages
        </Button>

        {suggestedMessages.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">
              Click on any message below to select it
            </h2>
            <ul className="space-y-2">
              {suggestedMessages.map((suggestion) => (
                <li
                  key={suggestion.id}
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
    </div>
  );
}

// "use client";

// import React, { useState } from "react";
// import axios from "axios";

// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";

// import suggestions from "@/suggestions.json";

// type SuggestedMessage = {
//   id: string;
//   text: string;
// };

// export default function Page({ params }: { params: { username: string } }) {
//   const { username } = params; // Access the username from params

//   const [message, setMessage] = useState("");
//   const [suggestedMessages, setSuggestedMessages] =
//     useState<SuggestedMessage[]>(suggestions);
//   const { toast } = useToast();

//   const handleSendMessage = async () => {
//     try {
//       const response = await axios.post("/api/send-message", {
//         // username,
//         content: message,
//       });

//       toast({
//         title: "Success",
//         description: response.data.message,
//       });

//       setMessage(""); // Clear the form after sending
//     } catch (error) {
//       console.error("Error sending message", error);
//       toast({
//         title: "Error",
//         description: "Failed to send message. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleSuggestMessages = async () => {
//     try {
//       const response = await axios.post("/api/suggest-messages");
//       console.log(response);
//     } catch (error) {
//       console.error("Error fetching suggestions", error);
//       toast({
//         title: "Error",
//         description: "Failed to fetch suggestions. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleSelectSuggestedMessage = (text: string) => {
//     setMessage(text);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
//       <div className="w-full max-w-2xl bg-white p-6 shadow-lg rounded-lg">
//         <h1 className="text-3xl font-bold mb-4">
//           Send a Message to {username}
//         </h1>
//         <div className="mb-4">
//           <Textarea
//             placeholder="Write your message here..."
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             className="w-full"
//           />
//         </div>
//         <Button onClick={handleSendMessage} className="w-full mb-4">
//           Send Message
//         </Button>

//         <Button
//           onClick={handleSuggestMessages}
//           variant="outline"
//           className="w-full"
//         >
//           Suggest Messages
//         </Button>

//         {suggestedMessages.length > 0 && (
//           <div className="mt-4">
//             <h2 className="text-xl font-semibold mb-2">
//               Click on any message below to select it
//             </h2>
//             <ul className="space-y-2">
//               {suggestedMessages.map((suggestion) => (
//                 <li
//                   key={suggestion.id}
//                   className="cursor-pointer p-2 border rounded hover:bg-gray-100"
//                   onClick={() => handleSelectSuggestedMessage(suggestion.text)}
//                 >
//                   {suggestion.text}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
