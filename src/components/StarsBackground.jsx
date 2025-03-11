import React, { useEffect, useRef } from "react";

const StarsBackground = () => {
  // Ref for stars container
  const starsRef = useRef(null);

  // Create stars for background
  useEffect(() => {
    if (!starsRef.current) return;

    const starsContainer = starsRef.current;
    starsContainer.innerHTML = "";

    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.classList.add("star");

      // Random position
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;

      // Random size
      const size = Math.random() * 3;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      // Random opacity
      star.style.opacity = Math.random();

      // Random animation delay for twinkling effect
      star.style.animation = `pulse ${3 + Math.random() * 4}s infinite ${
        Math.random() * 5
      }s`;

      starsContainer.appendChild(star);
    }
  }, []);

  return <div ref={starsRef} className="stars-container" />;
};

export default StarsBackground;