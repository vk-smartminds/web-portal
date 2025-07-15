"use client";
import Carausel from "../../components/Carousel";


export default function CataloguePage() {


  const products = [
    {
      title: "S.M.A.R.T. Minds Mathematics Textbook for CBSE Class 9th Vol. 1 & 2",
      author: "Anil Ahlawat & B M",
      rating: "4.9",
      price: "₹32",
      image: "/books/smart-minds-class9.jpg",
    },
    // add more products
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <section className="px-8 py-12 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Find Your Next Book</h2>
        <Carausel />
      </section>

      <section className="px-8 py-12 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => (
            <div key={idx} className="border rounded-lg p-4 shadow-sm hover:shadow-lg transition">
              <img src={product.image} alt={product.title} className="h-48 w-full object-cover rounded-md mb-4" />
              <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
              <p className="text-gray-600 text-sm mb-1">By: {product.author}</p>
              <p className="text-yellow-500 font-bold mb-2">⭐ {product.rating}</p>
              <p className="font-bold text-indigo-600 mb-4">{product.price}</p>
              <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 w-full rounded-md">Shop</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
