"use client";
import React from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Autoplay from "embla-carousel-autoplay";
import messages from "@/messages.json";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <main className="flex-grow flex flex-col items-center justify-center px-6 md:px-12 lg:px-24 py-12">
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-blue-700 mb-4">
            Welcome to <span className="text-blue-900">Anonymous Message</span>
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-gray-600">
            A platform where your thoughts are shared, but your identity remains
            hidden.
          </p>
        </section>

        <Carousel
          className="w-full max-w-[90vw] sm:max-w-[70vw] md:max-w-[50vw] lg:max-w-[40vw] shadow-md rounded-lg overflow-hidden border border-gray-200"
          plugins={[Autoplay({ delay: 2500 })]}
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index}>
                <div className="p-2">
                  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-blue-100 text-blue-900 p-2 text-md font-semibold rounded-t-md">
                      {message.title}
                    </CardHeader>
                    <CardContent className="flex h-32 items-center justify-center p-4 bg-white">
                      <span className="text-lg md:text-xl font-bold text-gray-800">
                        {message.content}
                      </span>
                    </CardContent>
                    <CardFooter className="bg-gray-50 text-xs text-gray-600 p-2 rounded-b-md">
                      {message.received}
                    </CardFooter>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="text-gray-700 hover:text-blue-700" />
          <CarouselNext className="text-gray-700 hover:text-blue-700" />
        </Carousel>
      </main>
    </div>
  );
}
