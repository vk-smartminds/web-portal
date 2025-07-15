"use client";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import sm9 from "../public/sm9.png"

const books = [
  {
    title: "sm9",
    image: "https://vkpublications.com/cdn/shop/files/Class-9_2.jpg?v=1748239248&width=750",
    bg: "bg-[#9dbdb2]",
  },
  {
    title: "sm10",
    image: "https://vkpublications.com/cdn/shop/files/1_2_8cf8b71c-02c4-4748-bb0d-dee3547381ee.jpg?v=1733995950&width=550",
    bg: "bg-[#8b73b1]",
  },
  {
    title: "sm11",
    image: "https://vkpublications.com/cdn/shop/files/Class-11-2.jpg?v=1744804001&width=550",
    },
    {
    title: "sm12",
    image: "https://vkpublications.com/cdn/shop/files/Class-12_1_b9535664-5823-4f44-af45-0d80c810d88a.jpg?v=1739599811&width=550",
    },
];

export default function FlowerCarousel() {
  const [index, setIndex] = useState(0);

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + books.length) % books.length);
  };

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % books.length);
  };

  const getIndex = (offset: number) =>
    (index + offset + books.length) % books.length;

  return (
    <div className="max-w-[700px] mx-auto p-6">
      <div className="flex items-center justify-between mb-2 text-gray-600">
        <h2 className="text-lg font-semibold">Theme</h2>
        <span className="font-semibold text-sm">{String(index + 1).padStart(2)}/4</span>
      </div>
      <div className="relative flex items-center space-x-4">
        <button onClick={prevSlide} className="z-10 bg-white rounded-full shadow p-2">
          <FaChevronLeft />
        </button>

        <div className="flex-1 flex items-center justify-center space-x-4 overflow-hidden">
          {[-1, 0, 1].map((offset) => {
            const flower = books[getIndex(offset)];
            return (
              <div
                key={flower.title}
                className={`flex-shrink-0 rounded-2xl ${flower.bg} transition-all duration-300 ${
                  offset === 0 ? "w-[300px] h-[400px]" : "w-[200px] h-[300px] opacity-60"
                }`}
                style={{
                  backgroundImage: `url(${flower.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
  
              </div>
            );
          })}
        </div>

        <button onClick={nextSlide} className="z-10 bg-white rounded-full shadow p-2">
          <FaChevronRight />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {books.map((_, idx) => (
          <div
            key={idx}
            className={`w-3 h-1.5 rounded-full transition-all duration-300 ${
              idx === index ? "bg-black w-6" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
