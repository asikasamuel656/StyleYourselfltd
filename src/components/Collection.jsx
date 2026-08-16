import React, { useState, useMemo } from "react";
import {
  Heart,
  ArrowLeft,
  Share2,
  SlidersHorizontal,
  Sparkles,
  ShoppingCart,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import SubSlider from "./SubSlider.jsx";

import showroomWide from "../assets/showroom-wide.jpg";
import showroomWide1 from "../assets/showroom-wide1.jpg";
import rails from "../assets/rails.jpg";
import productImg from "../assets/Product.jpg";
import mannequinPolo from "../assets/mannequin-polo.jpg";
import mrSys from "../assets/MrSYS.jpg";

import shirt1 from "../assets/Shirt.jpg";
import shirt2 from "../assets/Shirt2.jpg";
import shirt3 from "../assets/Shirt3.jpg";
import shirt4 from "../assets/Shirt4.jpg";
import shirt5 from "../assets/Shirt5.jpg";
import shirt6 from "../assets/Shirt6.jpg";

import short1 from "../assets/Short.jpg";
import short2 from "../assets/Short2.jpg";

import perfume1 from "../assets/perfume.jpg";
import perfume2 from "../assets/perfume2.jpg";
import perfume3 from "../assets/perfume3.jpg";
import perfume4 from "../assets/perfume4.jpg";
import perfume5 from "../assets/perfume5.jpg";
import perfume6 from "../assets/perfume6.jpg";
import perfume7 from "../assets/perfume5.jpg";
import perfume8 from "../assets/perfume8.jpg";

import Slippers from "../assets/Slippers.jpg"
import Slippers2 from "../assets/Slippers2.jpg"
import Sneaker from "../assets/Sneaker.jpg"
import Sneaker2 from "../assets/Sneaker2.jpg"
import ItalianShoe2 from "../assets/ItalianShoe.jpg"
import ItalianShoe1 from "../assets/ItalianShoe1.jpg"

import Baggy2 from "../assets/Baggy2.jpg";
import Baggy from "../assets/Baggy.jpg";
import Handless from "../assets/Handless.jpg";
import Hoddy2 from "../assets/Hoody2.jpg";
import img5 from "../assets/img5.jpg"
import FacaCap from "../assets/FaceCap.jpg"
import Belt from "../assets/belt-detail.jpg"

import Slippers3 from "../assets/Slippers3.jpg"
import Hat from "../assets/hat-detail.jpg"
import TravellingBag3 from "../assets/TravellingBag3.jpg"

const collections = [
  {
    id: "vacation",
    title: "Vacation Edit",
    count: 1,
    tagline: "Sun-Drenched Elegance",
    cover: showroomWide,
    products: [
      { name: "Traveling Bag", kicker: "AMBER EDITION", price: 270000, was: null, tag: "Best Seller", image: TravellingBag3 },
    ],
  },
  {
    id: "weekend",
    title: "Weekend Edit",
    count: 5,
    tagline: "Off-Duty Sophistication",
    cover: Hat,
    products: [
      { name: "Zara Vintage Shirt", kicker: "AMBER EDITION", price: 30000, was: null, tag: "Best Seller", image: shirt3 },
      { name: "Forest Men Polo", kicker: "ATELIER", price: 40000, tag: null, image: shirt4 },
      { name: "Jean Short", kicker: "AMBER EDITION", price: 45000, was: null, tag: null, image: short2 },
      { name: "Hat", kicker: "EXCLUSIVE", price: 35000, tag: "Best Seller", image: Hat },
      { name: "Rubber Slide", kicker: "EXCLUSIVE", price: 35000, tag: "Best Seller", image: Slippers3 },
    ],
  },
  {
    id: "denim",
    title: "Denim Story",
    count: 6,
    tagline: "Raw & Sculpted",
    cover: mannequinPolo,
    products: [
      { name: "Jean Short", kicker: "AMBER EDITION", price: 45000, tag: "Best Seller", image: short1 },
      { name: "Baggy Jean", kicker: "AMBER EDITION", price: 75000, tag: null, image: Baggy2 },
      { name: "Jogger Short", kicker: "AMBER EDITION", price: 45000, tag: null, image: mannequinPolo },
      { name: "Handless", kicker: "AMBER EDITION", price: 25000, tag: null, image: Handless },
      { name: "Hoodie", kicker: "AMBER EDITION", price: 60000, tag: null, image: Hoddy2 },
      { name: "2 pcs", kicker: "AMBER EDITION", price: 50000, tag: null, image: img5 },
    ],
  },
  {
    id: "executive",
    title: "Cultivated Motion",
    count: 6,
    tagline: "Executive Vibe",
    cover: productImg,
    products: [
      { name: "Rubber Slide", kicker: "AMBER EDITION", price: 35000, was: null, tag: "Best Seller", image: Slippers },
      { name: "Pino Rossetti", kicker: "EXCLUSIVE", price: 250000, tag: null, image: ItalianShoe1 },
      { name: "Air Jordan 4 Retro", kicker: "EXCLUSIVE", price: 750000, tag: null, image: Sneaker2 },
      { name: "Air Force 1' 07LX", kicker: "EXCLUSIVE", price: 270000, tag: null, image: Sneaker },
      { name: "Roberto Serpentini", kicker: "EXCLUSIVE", price: 145000, tag: null, image: ItalianShoe2 },
      { name: "Air Jordan 4 Retro", kicker: "ATELIER", price: 310000, was: null, tag: null, image: productImg },
    ],
  },
  {
    id: "polo",
    title: "Polo Archive",
    count: 2,
    tagline: "Sport Heritage Defined",
    cover: shirt2,
    products: [
      { name: "Forest Men Polo", kicker: "AMBER EDITION", price: 40000, was: null, tag: "Best Seller", image: shirt2 },
      { name: "New Fashion Studio Polo", kicker: "ATELIER", price: 40000, was: 45000, tag: null, image: shirt1 },
      // { name: "Terry Popover Polo", kicker: "ATELIER", price: 26500, was: 33000, tag: null, image: shirt4 },
      // { name: "Terry Popover Polo", kicker: "ATELIER", price: 26500, was: 33000, tag: null, image: shirt3 },
    ],
  },
  {
    id: "sneaker",
    title: "Scent & Accessories",
    count: 9,
    tagline: "The Finishing Touch",
    cover: perfume3,
    products: [
      { name: "Emeer Lattafa", kicker: "EXCLUSIVE", price: 70000, tag: "Best Seller", image: perfume1 },
      { name: "Eclat D'arpege", kicker: "AMBER EDITION", price: 55000, was: null, tag: null, image: perfume2 },
      { name: "Hayaati Lattafa", kicker: "EXCLUSIVE", price: 40000, was: null, tag: null, image: perfume3 },
      { name: "Maahir Black Lattafa", kicker: "LIMITED EDITION", price: 50000, was: null, tag: null, image: perfume4 },
      { name: "Club De Nuit Sillage", kicker: "AMBER EDITION", price: 135000, was: null, tag: null, image: perfume5 },
      { name: "Versace Pour Homme", kicker: "AMBER EDITION", price: 155000, was: null, tag: null, image: perfume6 },
      { name: "212 MEN NYC", kicker: "AMBER EDITION", price: 54000, was: null, tag: null, image: perfume8 },
      { name: "Face Cap", kicker: "AMBER EDITION", price: 20000, was: null, tag: null, image: FacaCap },
      { name: "Belt", kicker: "AMBER EDITION", price: 20000, was: null, tag: null, image: Belt },
    ],
  },
];

const naira = (n) => `\u20A6${n.toLocaleString("en-NG")}`;
const isActive = (path) => location.pathname === path;

function Wishlist({ active, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 z-10 ${
        active
          ? "bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/40"
          : "bg-black/60 border-amber-500/30 text-amber-500 hover:border-amber-500 backdrop-blur-md"
      }`}
    >
      <Heart size={15} className={active ? "fill-black stroke-black" : "stroke-amber-500"} />
    </button>
  );
}

function ProductCard({ product }) {
  const [liked, setLiked] = useState(false);
  const { T } = useTheme();

  return (
    <div
      style={{ background: T?.cardBg, color: T?.text }}
      className="group relative border border-amber-500/20 hover:border-amber-500/80 transition-all duration-500 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/10"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-black">
        {product.tag && (
          <span className="absolute top-3 left-3 z-10 text-[10px] tracking-widest uppercase font-semibold px-2.5 py-1 text-black bg-amber-500 rounded-sm shadow-md shadow-amber-500/30">
            {product.tag}
          </span>
        )}
        <Wishlist active={liked} onToggle={() => setLiked((v) => !v)} />
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button className="mt-1 w-full py-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold text-xs bg-[#F59E0B]">
            <ShoppingCart size={13} />
            Add to Cart
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-amber-500">
            {product.kicker}
          </p>
        </div>
        <h3 className="text-base font-medium leading-snug mb-2 font-display line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-amber-500 font-bold text-base">{naira(product.price)}</span>
          {product.was && (
            <span className="text-zinc-500 text-xs line-through">{naira(product.was)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function CollectionTile({ collection, onOpen }) {
  if (!collection) return null;

  return (
    <div
      onClick={() => onOpen(collection.id)}
      className="group cursor-pointer relative overflow-hidden rounded-2xl border border-amber-500/20 hover:border-amber-500 transition-all duration-500 aspect-[4/5] w-full block bg-zinc-900"
    >
      <img
        src={collection.cover}
        alt={collection.title}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent group-hover:from-black/90 transition-all" />
      <div className="absolute inset-0 ring-1 ring-inset ring-amber-500/10 group-hover:ring-amber-500/50 rounded-2xl transition-all" />

      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
        <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-amber-500 mb-1">
          {collection.tagline}
        </span>
        <h3 className="font-display text-2xl md:text-3xl text-white font-bold leading-tight group-hover:text-amber-400 transition-colors">
          {collection.title}
        </h3>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-500/20">
          <p className="text-xs text-zinc-400 tracking-wider">
            {collection.count} Curated Items
          </p>
          <span className="text-amber-500 text-xs font-bold tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Explore &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}

function GridView({ onOpen, activeFilter, setActiveFilter }) {
  const { T } = useTheme();

  return (
    <>
      <Navbar />

      <SubSlider
        eyebrow="Collection"
        title="What We Offer"
        subtitle="Style Yourself brings you luxurious men's wear and accessories."
        images={[rails, showroomWide]}
      />

      <div style={{ background: T?.bg, color: T?.text }}>
        {/* Hero Header */}
        <div className="relative flex items-center justify-center overflow-hidden py-24 px-6 border-b border-amber-500/20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <p className="opacity-80 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Curated menswear pieces defined by warm amber aesthetics, structured silhouettes, and uncompromised luxury.
            </p>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                  activeFilter === "all"
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                    : "bg-zinc-900/60 border-amber-500/20 text-white hover:border-amber-500/50"
                }`}
              >
                All Collections
              </button>
              {collections.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveFilter(c.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                    activeFilter === c.id
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                      : "bg-zinc-900/60 border-amber-500/20 text-white hover:border-amber-500/50"
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Collections */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections
              .filter((c) => activeFilter === "all" || c.id === activeFilter)
              .map((item) => (
                <CollectionTile key={item.id} collection={item} onOpen={onOpen} />
              ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function DetailView({ collection, onBack }) {
  const [sort, setSort] = useState("featured");
  const [bestOnly, setBestOnly] = useState(false);
  const { T } = useTheme();

  const items = useMemo(() => {
    let list = [...collection.products];
    if (bestOnly) list = list.filter((p) => p.tag === "Best Seller");
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    return list;
  }, [collection, sort, bestOnly]);

  return (
    <div className="min-h-screen" style={{ background: T?.bg, color: T?.text }}>
      {/* Navigation Header */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-amber-500/20 px-6 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-amber-500 hover:text-amber-400 font-semibold text-xs tracking-wider uppercase transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Vault
        </button>
        <span className="text-xs font-display font-bold tracking-widest text-amber-500 uppercase">
          {collection.title}
        </span>
        {/* <button className="p-2 rounded-full border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 transition-colors">
          <Share2 size={15} />
        </button> */}
      </div>

      {/* Title Hero */}
      <div className="relative py-16 px-6 text-center border-b border-amber-500/10 bg-amber-500/5">
        <p className="text-xs tracking-[0.3em] font-bold text-amber-500 uppercase mb-2">
          {collection.tagline}
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold">
          {collection.title}
        </h1>
        <p className="text-zinc-500 text-xs tracking-wider mt-2">
          {collection.count} Handcrafted Essentials
        </p>
      </div>

      {/* Controls */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => setBestOnly((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold tracking-wider transition-all ${
            bestOnly
              ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20"
              : "border-amber-500/30 text-amber-500 hover:border-amber-500"
          }`}
        >
          <SlidersHorizontal size={13} />
          Best Sellers Only
        </button>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-zinc-900 border border-amber-500/30 text-amber-500 text-xs font-semibold px-4 py-2 rounded-lg focus:outline-none focus:border-amber-500"
        >
          <option value="featured">Featured Order</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
      </div>

      {/* Product Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p, i) => (
          <ProductCard key={i} product={p} />
        ))}
      </div>
    </div>
  );
}

export default function CollectionPage() {
  const [activeId, setActiveId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const { T } = useTheme();
  const active = collections.find((c) => c.id === activeId);

  return (
    <div
      className="min-h-screen selection:bg-amber-500 selection:text-black transition-colors duration-300"
      style={{ background: T?.bg, color: T?.text }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .font-display { font-family: 'Syne', sans-serif; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      {active ? (
        <DetailView collection={active} onBack={() => setActiveId(null)} />
      ) : (
        <GridView
          onOpen={setActiveId}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
      )}
    </div>
  );
}