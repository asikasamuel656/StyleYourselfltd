import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Shop from "./pages/Shop.jsx";
import Cart from "./pages/Cart.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import WishList from "./pages/WishList.jsx";

// Components
import Navbar from "./components/Navbar.jsx";
import HeroSlider from "./components/HeroSlider.jsx";
import Collection from "./components/Collection.jsx";
import About from "./components/About.jsx";
import Reviews from "./components/Reviews.jsx";
import Sale from "./components/Sale.jsx";
import Contact from "./components/Contact.jsx";

function Home() {
  return (
    <>
      <HeroSlider />
      <About />
      <Collection />
      <Sale />
      <Reviews />
      <Contact />
    </>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/StyleYourself" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<WishList />} />
        <Route path="/product/:id" element={<ProductDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;