import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET() {
  await dbConnect();

  //
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;
  //   const user: User = session?.user;
  //   const user = session?.user;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 }
    );
  }

  // const userId = user._id;

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    // console.log(userId);
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);
    // console.log(user);
    if (!user || user.length === 0) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, messages: user[0].messages },
      { status: 200 }
    );
  } catch (error) {
    console.error("An unexpected error occurred : ", error);
    return Response.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
