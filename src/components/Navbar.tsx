"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "./ui/button";

export default function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user as User;

  return (
    <nav className="bg-gradient-to-r from-white to-blue-50 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center py-4 px-6 md:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-extrabold text-blue-700 hover:opacity-90 transition-opacity"
        >
          Anonymous <span className="text-blue-900">Message</span>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          {session ? (
            <>
              {/* Greeting */}
              <span
                className="text-gray-600 text-sm md:text-base whitespace-nowrap"
                title={`Logged in as ${user?.username || user?.email}`}
              >
                Welcome,{" "}
                <span className="font-semibold text-blue-700">
                  {user?.username || user?.email}
                </span>
              </span>
              {/* Logout Button */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all"
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/sign-in">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
              >
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

// "use client";

// import React from "react";
// import Link from "next/link";
// import { useSession, signOut } from "next-auth/react";
// import { User } from "next-auth";
// import { Button } from "./ui/button";

// export default function Navbar() {
//   const { data: session } = useSession();
//   const user: User = session?.user as User;

//   return (
//     <nav className="bg-white shadow-md sticky top-0 z-50">
//       <div className="container mx-auto flex flex-col md:flex-row justify-between items-center py-4 px-6 md:px-10">
//         {/* Logo */}
//         <Link href="/" className="text-2xl font-extrabold text-blue-700">
//           Anonymous <span className="text-blue-900">Message</span>
//         </Link>

//         {/* Right Side */}
//         <div className="flex items-center gap-4 mt-4 md:mt-0">
//           {session ? (
//             <>
//               {/* Greeting */}
//               <span className="text-gray-600 text-sm md:text-base">
//                 Welcome,{" "}
//                 <span className="font-medium text-blue-700">
//                   {user?.username || user?.email}
//                 </span>
//               </span>
//               {/* Logout Button */}
//               <button
//                 onClick={() => signOut()}
//                 className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm md:text-base font-medium rounded-md transition-all"
//               >
//                 Logout
//               </button>
//             </>
//           ) : (
//             <Link href="/sign-in">
//               <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm md:text-base rounded-md">
//                 Login
//               </Button>
//             </Link>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// }
