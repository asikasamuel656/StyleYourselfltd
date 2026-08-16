import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "./context/StoreContext";
import { useEffect } from "react";

// Pages
import Shop from "./pages/Shop.jsx";
import Cart from "./pages/Cart.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import WishList from "./pages/WishList.jsx";
import NotFound from "./pages/NotFound.jsx";
import Dashboard from "./admin/pages/Dashboard.jsx";
import AdminLogin from "./admin/components/AdminLogin.jsx";
import VerifyMagicLink from "./admin/pages/VerifyMagicLink.jsx";
import Checkout from "./pages/Checkout.jsx";

// Components
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar.jsx";
import HeroSlider from "./components/HeroSlider.jsx";
import Collection from "./components/Collection.jsx";
import About from "./components/About.jsx";
import Reviews from "./components/Reviews.jsx";
import Sale from "./components/Sale.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import { ThemeProvider } from "./context/ThemeContext";
import Delivery from "./customer/Delivery.jsx";
import FAQs from "./customer/FAQs.jsx";
import PrivacyPolicy from "./customer/PrivacyPolicy.jsx";
import ReturnRefund from "./customer/ReturnRefund.jsx";
import SubSlider from "./components/SubSlider.jsx";
import Main from "./components/Home.jsx"
import Styling from "./components/Styling.jsx";

function Home() {
  return (
    <>
      <ThemeProvider>
        <Main/>
      </ThemeProvider>
    </>
  );
}

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* ── PUBLIC STORE ROUTES ── */}
          <Route path="/" element={<Home />} />
        
          <Route path="/About" element={<About/>} />
          <Route path="/Collection" element={<Collection />} />
          <Route path="/Sale" element={<Sale />} />
          <Route path="/Review" element={<Reviews />} />
          <Route path="/Styling" element={<Styling />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<WishList />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* ── ADMIN ROUTES (no link from the store, bookmark only) ── */}
          {/* Share this link with yourself: yourdomain.com/StyleYourself/manage/login */}
          <Route path="/manage/login" element={<AdminLogin />} />
          <Route path="/manage/verify" element={<VerifyMagicLink />} />
          <Route path="/manage/dashboard" element={<Dashboard />} />

          {/* ── 404 ── */}
          <Route path="*" element={<NotFound />} />

          {/* customer support */}
          <Route path="/customer/faqs" element={<FAQs />} />
          <Route path="/customer/delivery" element={<Delivery />} />
          <Route path="/customer/return-refund" element={<ReturnRefund />} />
          <Route path="/customer/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;