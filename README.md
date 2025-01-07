This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## **Table of Contents**

1. [Getting Started](#getting-started)
2. [Handling Hot-Reload Errors with Mongoose in Development](#handling-hot-reload-errors-with-mongoose-in-development)
   - [The Problem](#the-problem)
   - [The Cause](#the-cause)
   - [Steps Taken to Solve the Problem](#steps-taken-to-solve-the-problem)
     - [Check if the Model Exists](#1-check-if-the-model-exists)
     - [Use Conditional Model Initialization](#2-use-conditional-model-initialization)
   - [Implementation Details](#implementation-details)
   - [Future Improvements](#future-improvements)
   - [Takeaway](#takeaway)
3. [Debugging Insights: Proper Use of Status Codes](#debugging-insights-proper-use-of-status-codes)
4. [Anonymous Message App: Middleware Bug and Fix](#anonymous-message-app-middleware-bug-and-fix)
5. [Database Challenge: ObjectId Mismatch in Aggregation](#database-challenge-objectid-mismatch-in-aggregation)
   - [The Problem](#the-problem-1)
   - [The Cause](#the-cause-1)
   - [Steps Taken to Solve the Problem](#steps-taken-to-solve-the-problem-1)
   - [Takeaway](#takeaway-1)
6. [Fixing Window ReferenceError in Next.js](#fixing-window-referenceerror-in-nextjs)
7. [Handling params in Next.js: Resolving the Promise Warning](#handling-params-in-nextjs-resolving-the-promise-warning)

---

## **Getting Started**

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## **Handling Hot-Reload Errors with Mongoose in Development**

### **The Problem**

When working with **Mongoose** in a development environment, especially with frameworks like **Next.js**, frequent hot reloads can cause an issue where the same Mongoose model is defined multiple times. This typically results in the following error:

```
Overwriting model 'User' error
```

This happens because Mongoose doesn't allow redefining models that already exist in `mongoose.models`.

---

### **The Cause**

Next.js (or similar frameworks) uses a **hot-reloading feature** in development mode to restart the server whenever changes are made. However:

- Mongoose keeps track of all defined models in a global `mongoose.models` object.
- When the server restarts, the application attempts to redefine the same models, leading to conflicts and errors.

---

### **Steps Taken to Solve the Problem**

#### **1. Check if the Model Exists**

To handle this, we first check if the model already exists in `mongoose.models` before attempting to redefine it.

#### **2. Use Conditional Model Initialization**

We modified our model definition code as follows:

```ts
const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;
```

**Explanation**:

- `mongoose.models.User`: Checks if the "User" model already exists in Mongoose's registry.
- If it exists, we reuse the existing model.
- If it doesn’t exist, we define a new model using `mongoose.model()`.

This ensures the model is only defined once, even with hot-reloading.

---

### **Implementation Details**

Here’s an example of the complete code for the `User` model:

```ts
import mongoose, { Schema, Document } from "mongoose";

// Define the Message interface and schema
export interface Message extends Document {
  content: string;
  createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Define the User interface and schema
export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  messages: Message[];
}

const UserSchema: Schema<User> = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verifyCode: { type: String, required: true },
  verifyCodeExpiry: { type: Date, required: true },
  isVerified: { type: Boolean, default: false },
  isAcceptingMessage: { type: Boolean, default: true },
  messages: [MessageSchema],
});

// Safeguard against model redefinition
const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;
```

---

### **Future Improvements**

1. **Global Mongoose Connection Handling**:

   - Use a single connection instance and reuse it across the app.
   - Useful in serverless environments where connections are frequently opened and closed.

2. **Environment-Specific Configurations**:
   - Avoid hot-reload errors by using different strategies for model initialization in production vs. development environments.

---

### **Takeaway**

By checking if a model already exists in `mongoose.models` before defining it, we can avoid errors caused by model redefinition during hot-reloading. This is a critical step when developing with Next.js or similar frameworks that restart the server frequently.

---

## **Debugging Insights: Proper Use of Status Codes**

While building the **username validation feature** for this project, I encountered a noteworthy issue related to HTTP status codes. Here's what happened and the lesson learned:

### **The Issue**

The backend was designed to return a JSON response indicating success or failure during username validation:

- **Response Body**: `{"success": true, "message": "Username is Unique"}`
- **Status Code**: `400` (Bad Request)

Despite the success message, the `400` status code caused the frontend to misinterpret the response as an error, leading to unexpected behavior.

---

### **Root Cause**

The mismatch between the **response body** and the **status code** was the root of the problem:

- A status code of `400` signals a client-side error, which contradicted the success message in the response.

---

### **The Fix**

To resolve this, I updated the backend logic to use proper HTTP status codes:

- **200 (OK)**: For successful validation, when the username is unique.
- **400 (Bad Request)**: For invalid input or when the username is already taken.
- **500 (Internal Server Error)**: For server-side issues.

This alignment made the frontend logic simpler and debugging more intuitive.

---

### **Key Takeaways**

1. **Status Codes Matter**  
   Status codes should accurately represent the intent of the response to avoid confusion and errors across the stack.

2. **Clear Communication Between Backend and Frontend**  
   Consistency in API responses ensures seamless integration and better debugging experiences.

3. **Adhering to Standards**  
   Following HTTP standards helps maintain clarity and simplifies collaboration within the team.

---

### **Code Update Example**

Here's the updated snippet for proper status code handling:

```typescript
return Response.json(
  {
    success: true,
    message: "Username is Unique",
  },
  { status: 200 }
);
```

---

### **Outcome**

This small adjustment significantly improved the integration between the backend and frontend, saving time and reducing complexity in error handling.

---

## **Anonymous Message App: Middleware Bug and Fix**

### **The Problem**

During the development of my **Anonymous Message App**, I encountered a perplexing bug with `next-auth` middleware. The application entered a redirect loop that resulted in the following error:

```
This page isn’t working
localhost redirected you too many times.
Try deleting your cookies.
ERR_TOO_MANY_REDIRECTS
```

### **The Cause**

The middleware's logic inadvertently redirected users repeatedly without allowing the request to proceed to its intended route. Broad route matching and insufficient logic to differentiate between public and private routes were the main culprits.

---

### **The Fix**

By refining the middleware with explicit conditions and precise route checks, I resolved the issue. [Detailed implementation provided above.]

---

## **Database Challenge: ObjectId Mismatch in Aggregation**

### **The Problem**

While implementing a MongoDB aggregation pipeline, I encountered an issue where the query using an `ObjectId` returned no results, even though the `ObjectId` appeared correct.

---

### **The Cause**

The problem was due to using the field `id` in the `$match` stage instead of `_id`. In MongoDB, the primary key field is `_id`, and `id` does not refer to the same field. This mismatch caused the aggregation to fail.

---

### **Steps Taken to Solve the Problem**

1. **Diagnosis**:

   - Verified that the `ObjectId` was correct and matched the database document.
   - Realized the issue stemmed from the wrong field name in the `$match` stage.

2. **Fix**:
   Updated the aggregation pipeline to correctly use `_id` instead of `id`:

```typescript
const userId = new mongoose.Types.ObjectId(user._id);

const user = await UserModel.aggregate([
  { $match: { _id: userId } },
  { $unwind: "$messages" },
  { $sort: { "messages.createdAt": -1 } },
  { $group: { _id: "$_id", messages: { $push: "$messages" } } },
]);
```

---

### **Outcome**

The fix resolved the issue, and the aggregation pipeline returned the expected results. This highlights the importance of using correct field names when working with MongoDB queries.

---

### **Takeaway**

- Always verify field names in queries, especially when using MongoDB's aggregation framework.
- Understanding the difference between `_id` and custom fields like `id` can save hours of debugging.

---

# Fixing Window ReferenceError in Next.js

## Problem

When building a Next.js application, an error occurs during server-side rendering (SSR) when trying to access the `window` object. The error message typically looks like:

```
ReferenceError: window is not defined
```

This error happens because the `window` object is part of the browser’s runtime environment and does not exist on the server, where SSR occurs.

## Root Cause

Next.js supports both SSR and client-side rendering (CSR). When a component or page uses the `window` object directly, Next.js attempts to render that code on the server during the initial rendering phase. Since the `window` object does not exist on the server, it results in a `ReferenceError`.

In this specific case, the issue arose from trying to build a URL using `window.location` within a page marked with `"use client"`. While the `"use client"` directive enables CSR for the page, some parts of the page lifecycle might still trigger SSR initially, causing the error.

## Solution

To address the issue, ensure that any code relying on the `window` object is executed only in the browser runtime. This can be achieved by conditionally checking for the existence of the `window` object:

```typescript
const baseUrl =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "";
```

### Explanation

1. `typeof window !== "undefined"`: This checks whether the `window` object is available before trying to access its properties.
2. If `window` is defined, the `baseUrl` is constructed using `window.location.protocol` and `window.location.host`.
3. If `window` is not defined (i.e., during SSR), the `baseUrl` is set to an empty string, ensuring no errors are thrown.

## Steps to Implement the Fix

1. Locate the code where the `window` object is accessed.
2. Wrap the code in a conditional check, as shown above.
3. Test the application to ensure both SSR and CSR work seamlessly.

## Lessons Learned

- Be cautious when using browser-specific objects like `window` or `document` in Next.js.
- Understand the dual rendering nature of Next.js and write code that adapts to both SSR and CSR environments.
- Use conditional checks to prevent SSR-related errors when accessing browser-only APIs.

## Example Use Case

Here’s the updated code snippet for generating a profile URL in a dashboard component:

```typescript
const baseUrl =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "";

const profileUrl = `${baseUrl}/u/${username}`;

const copyToClipboard = () => {
  navigator.clipboard.writeText(profileUrl);
  toast({
    title: "Copied",
    description: "Profile URL copied to clipboard",
    variant: "default",
  });
};
```

By implementing this fix, the dashboard page renders correctly without errors during SSR and allows users to copy their profile URL seamlessly.

---

# Handling params in Next.js: Resolving the Promise Warning

## Introduction

In Next.js, dynamic route parameters (`params`) are transitioning to be handled as asynchronous `Promises`. This change may result in a warning if you access `params` directly in your component.

This guide explains why this warning occurs and how to resolve it by unwrapping the `params` Promise using `React.use()`.

## The Warning

When accessing `params` directly in a Next.js component, you might encounter the following warning:

```

A param property was accessed directly with `params.username`. `params` is now a Promise and should be unwrapped with `React.use()` before accessing properties of the underlying params object. In this version of Next.js direct access to param properties is still supported to facilitate migration but in a future version you will be required to unwrap `params` with `React.use()`.

```

## Why is This Happening?

Next.js is moving toward treating dynamic route parameters as **Promises** to improve the way they are handled in server-side and static rendering. This change requires that you unwrap the `params` Promise before accessing its properties.

## Solution: Using `React.use()` to Unwrap `params`

To fix this issue and ensure your code remains compatible with future versions of Next.js, you need to **unwrap** the `params` Promise using `React.use()` in the `useEffect` hook.

### Steps to Fix the Warning

1. **Use `React.use()` to Unwrap the `params` Promise**:
   Since `params` is now a `Promise`, you need to resolve it asynchronously before accessing its properties.

2. **Handle Asynchronous Logic in `useEffect`**:
   React components expect **synchronous** functions, so the asynchronous `params` should be handled **outside** of the render process in a `useEffect` hook.

### Code Example

Here’s the updated code for resolving the `params` Promise:

```tsx
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
```

## Explanation

1. **Unwrapping `params` with `React.use()`**:
   We use `useEffect` to asynchronously resolve the `params` Promise and set the `username` state once it's available.

2. **Rendering the Component**:
   After resolving the `username`, we render the component with the correct username.

3. **Loading State**:
   If the username hasn't been set yet, we show a loading state until the asynchronous operation completes.

## Why This Works

- **React’s Synchronous Rendering**: React components are designed to be synchronous. Handling asynchronous logic inside `useEffect` keeps the render cycle intact and predictable.
- **Future-Proofing**: By adapting to the new behavior of `params` as a Promise, your code will be ready for the future of Next.js, where this pattern is the expected way to handle dynamic route parameters.

## Conclusion

Next.js' transition to handling dynamic parameters as `Promises` requires developers to adjust their code to avoid warnings and ensure compatibility with future versions. By using `React.use()` inside `useEffect` to unwrap the `params` Promise, you can resolve the issue while adhering to modern best practices.

With this fix, you’ll have a more reliable and maintainable Next.js project, and you’ll be well-prepared for upcoming releases.

---
