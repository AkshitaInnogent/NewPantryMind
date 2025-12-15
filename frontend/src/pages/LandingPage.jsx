import React from "react";
import {
  PhotoCamera,
  AccessTime,
  AutoAwesome,
  Insights,
  ShoppingCart,
  Group,
  Inventory2,
  RestaurantMenu,
  TrendingDown,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

const HERO_IMAGE = "/p1.jpg";

export default function LandingPage() {
  return (
    <div className="font-inter antialiased text-gray-900 bg-gray-50">
      {/* ================= HERO SECTION ================= */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-16 sm:py-28 md:py-40">
        <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-12">
          {/* Left Illustration */}
          <div className="flex-1 flex justify-center">
            <img
              src="/image/home.jpg"
              alt="PantryMind hero"
              className="w-full max-w-[480px] object-contain"
            />
          </div>

          {/* Right Content */}
          <div className="flex-1 max-w-xl">
            <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
              Smart Kitchen Management
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              Never Waste Food <span className="text-green-600">Again</span>
            </h1>

            <p className="mt-4 text-gray-600 text-sm sm:text-base">
              Track your pantry, monitor expiry dates, and get AI-powered recipe
              suggestions based on what you already have at home.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/register">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl w-full sm:w-auto">
                  Get Started Free
                </button>
              </Link>
              <Link to="/login">
                <button className="border border-green-600 text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl w-full sm:w-auto">
                  Log-In
                </button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-400">
              Join thousands reducing food waste and cooking smarter
            </p>
          </div>
        </div>
      </header>

      {/* ================= FEATURES SECTION ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">
            Everything You Need to{" "}
            <span className="text-green-600">Manage Your Kitchen</span>
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">
            A complete pantry management system designed to reduce waste and
            simplify meal planning.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <Feature icon={<PhotoCamera />} title="Smart Photo Scanning">
            Upload grocery bills or labels. AI detects items, quantities &
            expiries automatically.
          </Feature>

          <AngledFeature title="Expiry Tracking">
            Dashboard shows what’s fresh, expiring soon, or already expired —
            with intelligent reminders.
          </AngledFeature>

          <Feature icon={<AutoAwesome />} title="AI Recipe Suggestions">
            Get personalized recipes based on your current pantry.
          </Feature>

          <AngledFeatureLeft title=" . Waste Analytics">
            Track food saved, usage patterns & frequently wasted items.
          </AngledFeatureLeft>

          <Feature icon={<ShoppingCart />} title="Smart Shopping Lists">
            Auto-generate lists when items go low or missing.
          </Feature>

          <Feature icon={<Group />} title="Household Sharing">
            Share pantry inventory with your household.
          </Feature>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-green-50 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold">How PantryMind Works</h3>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            From scanning to cooking in four simple steps
          </p>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <TimelineStep
              index="01"
              icon={<Inventory2 />}
              title="Add Your Items"
            >
              Scan receipts or add product labels. The AI fills in the details.
            </TimelineStep>

            <TimelineStep
              index="02"
              icon={<AccessTime />}
              title="Track & Monitor"
            >
              View expiry dates, quantities & freshness status.
            </TimelineStep>

            <TimelineStep
              index="03"
              icon={<RestaurantMenu />}
              title="Cook Smart"
            >
              Get recipes based on what’s available. Suggestions included.
            </TimelineStep>

            <TimelineStep
              index="04"
              icon={<TrendingDown />}
              title="Reduce Waste"
            >
              Insights show waste avoided, usage patterns & savings.
            </TimelineStep>
          </div>
        </div>
      </section>

      {/* ================= CTA FOOTER ================= */}
      <footer className="bg-green-900 text-white py-12 sm:py-20 text-center px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1 mb-4 rounded-full bg-green-700/50 text-xs sm:text-sm">
            Start Waste-Free Journey
          </span>

          <h4 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">
            Ready to Transform Your Kitchen?
          </h4>

          <p className="mt-3 text-green-200 text-sm sm:text-base">
            Start reducing food waste, saving money, and cooking smarter with
            AI-powered pantry management.
          </p>

          <div className="mt-8">
            <Link to="/register">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl w-full sm:w-auto">
                Get Started Free
              </button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ================================================================
   COMPONENTS
================================================================ */

function Feature({ icon, title, children }) {
  return (
    <div
      className="flex gap-4 items-start p-6 bg-white rounded-xl shadow-sm
      transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
    >
      <div className="w-12 h-12 flex items-center justify-center bg-green-50 text-green-600 rounded-lg text-2xl">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-gray-600 text-sm mt-1">{children}</p>
      </div>
    </div>
  );
}

function AngledFeature({ title, children }) {
  return (
    <div className="relative transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
      <div
        className="p-6 text-white rounded-lg"
        style={{
          background: "linear-gradient(90deg,#19a35b,#168c4c)",
          clipPath: "polygon(0 0, 100% 0, 85% 100%, 0% 100%)",
        }}
      >
        <h4 className="font-bold text-lg">{title}</h4>
        <p className="text-sm mt-2 text-white/90">{children}</p>
      </div>
    </div>
  );
}

function AngledFeatureLeft({ title, children }) {
  return (
    <div className="relative transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
      <div
        className="p-6 text-white rounded-lg"
        style={{
          background: "linear-gradient(90deg,#19a35b,#168c4c)",
          clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)",
        }}
      >
        <h4 className="font-bold text-lg">{title}</h4>
        <p className="text-sm mt-2 text-white/90">{children}</p>
      </div>
    </div>
  );
}

function TimelineStep({ index, icon, title, children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
          {index}
        </div>
        <div className="text-green-600 text-2xl">{icon}</div>
      </div>
      <h5 className="font-semibold mt-4">{title} </h5>
      <p className="text-gray-600 text-sm mt-2">{children}</p>
    </div>
  );
}
