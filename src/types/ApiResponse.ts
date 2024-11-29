import { Message } from "@/model/User";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMesages?: boolean;
  messages?: Array<Message>;
}
