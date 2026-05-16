import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

// Mock data for courts
const courts = [
  {
    id: 1,
    name: "Canton Community Courts",
    address: "456 Cherry Hill Road, Canton, MI",                                                                                          
    thumbnail: "https://via.placeholder.com/300x180"
  },
  {
    id: 2,
    name: "Plymouth Meadow Courts",
    address: "789 Ann Arbor Trail, Plymouth, MI",
    thumbnail: "https://via.placeholder.com/300x180"
  }
];

function NavBar() {
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <div className="logo">The Net Finder</div>
        <ul className="nav-menu">
          <li><a href="#hero" className="active">Home</a></li>
          <li><a href="#courts">Courts</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section id="hero" className="hero">
      <h1>Courts in Canton and Plymouth, MI</h1>
      <p>Discover local tennis & pickleball courts</p>
    </section>
  );
}

function CourtCard({ court }) {
  return (
    <div className="court-card">
      <img src={court.thumbnail} alt={court.name} />
      <h3>{court.name}</h3>
      <p className="location">{court.address}</p>
    </div>
  );
}

function CourtsSection() {
  return (
    <section id="courts" className="courts-section">
      <h2>Available Courts</h2>
      <div className="courts-grid">
        {courts.map(court => (
          <CourtCard key={court.id} court={court} />
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="contact-section">
      <h2>Contact Us</h2>
      <p>Email us at <a href="mailto:info@courtfinder.com">info@courtfinder.com</a></p>
    </section>
  );
}

function App() {
  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <CourtsSection />
        <About />
        <Contact />
      </main>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);




