"use client";
import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { Message } from "@/model/User";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ApiResponse } from "@/types/ApiResponse";

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

export default function MessageCard({
  message,
  onMessageDelete,
}: MessageCardProps) {
  const { toast } = useToast();

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message._id}`
      );

      toast({
        title: "Success",
        description: response.data.message,
      });

      onMessageDelete(message._id as string);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the message. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white shadow-lg rounded-lg transition-transform transform hover:scale-105">
      <CardHeader className="flex items-center justify-between p-4">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Anonymous Message
        </CardTitle>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-red-600">
              <X className="w-5 h-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-gray-900">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-gray-600">
                This action cannot be undone. This will permanently delete the
                message from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-200 text-gray-800 hover:bg-gray-300">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent className="p-4 text-gray-700">
        <p>{message.content}</p>
      </CardContent>
      <CardFooter className="p-4 border-t border-gray-200 text-sm text-gray-500">
        Sent on {new Date(message.createdAt).toLocaleDateString()}
      </CardFooter>
    </Card>
  );
}

// "use client";
// import React from "react";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Button } from "./ui/button";
// import { X } from "lucide-react";
// import { Message } from "@/model/User";
// import { useToast } from "@/hooks/use-toast";
// import axios from "axios";
// import { ApiResponse } from "@/types/ApiResponse";

// type MessageCardProps = {
//   message: Message;
//   onMessageDelete: (messageId: string) => void;
// };

// export default function MessageCard({
//   message,
//   onMessageDelete,
// }: MessageCardProps) {
//   const { toast } = useToast();

//   const handleDeleteConfirm = async () => {
//     const response = await axios.delete<ApiResponse>(
//       `/api/delete-message/${message._id}`
//     );

//     toast({
//       title: response.data.message,
//     });

//     onMessageDelete(message._id as string);
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Card Title</CardTitle>

//         <AlertDialog>
//           <AlertDialogTrigger asChild>
//             <Button variant="destructive">
//               <X className="w-5 h-5" />
//             </Button>
//           </AlertDialogTrigger>
//           <AlertDialogContent>
//             <AlertDialogHeader>
//               <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//               <AlertDialogDescription>
//                 This action cannot be undone. This will permanently delete your
//                 account and remove your data from our servers.
//               </AlertDialogDescription>
//             </AlertDialogHeader>
//             <AlertDialogFooter>
//               <AlertDialogCancel>Cancel</AlertDialogCancel>
//               <AlertDialogAction onClick={handleDeleteConfirm}>
//                 Continue
//               </AlertDialogAction>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialog>

//         <CardDescription>Card Description</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <p>{message}</p>
//       </CardContent>
//       <CardFooter>
//         <p>Card Footer</p>
//       </CardFooter>
//     </Card>
//   );
// }
