// Scroll to Top Component - For all dashboards
import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Button is visible after scrolling down 300px
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-[#0F9D76] text-white p-3 rounded-full shadow-lg hover:bg-[#0d8a66] transition-all duration-300 group"
          aria-label="Scroll to top"
        >
          <ChevronUp 
            className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-300" 
          />
        </button>
      )}
    </>
  );
}
