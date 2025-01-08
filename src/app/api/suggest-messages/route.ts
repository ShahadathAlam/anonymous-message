// This is from documentation

import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is correctly set in the environment
});

export async function POST() {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform like Qooh.me and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. Ensure the questions are intriguing, foster curiosity, and contribute to a positive conversational environment.";

    // Generate suggestions using OpenAI Chat Completion API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Update this to "gpt-4" if needed
      messages: [
        {
          role: "system",
          content: "You are an assistant generating suggestions.",
        },
        { role: "user", content: prompt },
      ],
    });

    // Extract the generated content
    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response content received from OpenAI.");
    }

    // Split suggestions by '||' and trim whitespace
    const suggestions = responseText.split("||").map((q) => q.trim());

    if (!suggestions || suggestions.length === 0) {
      throw new Error("No suggestions generated by the OpenAI API.");
    }

    return NextResponse.json({ success: true, suggestions });
  } catch (error) {
    console.error("Error in suggest-messages route:", error);

    // Handle specific OpenAI API error
    if (error instanceof OpenAI.APIError) {
      const status = error.status || 500;
      return NextResponse.json(
        {
          success: false,
          message: error.message || "An error occurred with OpenAI API.",
        },
        { status }
      );
    }

    // Handle generic errors
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch suggestions.",
        error: "Unknown error occurred.",
      },
      { status: 500 }
    );
  }
}

//////////////////////////////// From Chatgpt /////////////////////////////
// import OpenAI from "openai";
// import { NextResponse } from "next/server";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY, // Ensure this key is correct
// });

// export async function POST(req: Request) {
//   try {
//     const prompt =
//       "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience.";

//     const response = await openai.completions.create({
//       model: "gpt-3.5-turbo-instruct",
//       max_tokens: 150,
//       prompt,
//     });
//     console.log("OpenAI Response:", response.choices[0]?.text);

//     const suggestions = response.choices[0]?.text
//       .split("||")
//       .map((q) => q.trim());

//     if (!suggestions || suggestions.length === 0) {
//       throw new Error("No suggestions generated by the OpenAI API");
//     }

//     return NextResponse.json({ success: true, suggestions });
//   } catch (error) {
//     console.error("Error in suggest-messages route:", error);

//     if (error instanceof OpenAI.APIError && error.status === 429) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "OpenAI quota exceeded. Please try again later.",
//         },
//         { status: 429 }
//       );
//     }

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch suggestions",
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

//////////////////////////////////////////// From Hitesh Code ///////////////////////////////
// import OpenAI from "openai";
// import { OpenAIStream, StreamingTextResponse } from "ai";
// import { NextResponse } from "next/server";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export const runtime = "edge";

// export async function POST(req: Request) {
//   try {
//     const prompt =
//       "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be seperated by '||' . These questions are for an anonymous social messaging platform , like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: Which hobby you have rwecently started? || If you could have dinner with any historical figure , who would it be? || Which simple thing that makes you happy ?. Ensure the questions are intriguing, foster curiosity and contribute to  a positive and welcoming conversational environment";

//     const response = await openai.completions.create({
//       model: "gpt-3.5-turbo-instruct",
//       max_tokens: 400,
//       stream: true,
//       prompt,
//     });
//     const stream = OpenAIStream(response);

//     return new StreamingTextResponse(stream);
//   } catch (error) {
//     if (error instanceof OpenAI.APIError) {
//       const { name, status, headers, message } = error;
//       return NextResponse.json(
//         {
//           name,
//           status,
//           headers,
//           message,
//         },
//         { status }
//       );
//     } else {
//       console.error("An error occurred", error);
//       return NextResponse.json(
//         { message: "An error occurred while processing your request" },
//         { status: 500 }
//       );
//     }
//   }
// }
