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
