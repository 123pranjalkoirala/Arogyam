// src/pages/LandingPage.jsx - With Green Theme
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedArticle, setSelectedArticle] = useState(null);

  const scrollTo = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const healthArticles = [
    {
      id: 1,
      title: "Breaking: New Research Reveals Surprising Heart Disease Prevention Strategy",
      excerpt: "Latest study from Johns Hopkins shows that intermittent fasting may reduce heart disease risk by 40% more than previously thought.",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800",
      category: "Cardiology",
      readTime: "5 min read",
      author: "Dr. Sarah Johnson, MD",
      date: "December 28, 2025",
      content: `In a groundbreaking study published today in the New England Journal of Medicine, researchers from Johns Hopkins University have discovered that intermittent fasting could be significantly more effective at preventing heart disease than traditional dietary approaches.

The comprehensive study, which followed over 10,000 participants for five years, revealed that those who practiced 16:8 intermittent fasting showed a 40% reduction in cardiovascular events compared to the control group.

"This changes everything we thought we knew about dietary prevention," says lead researcher Dr. Michael Chen. "The metabolic benefits of fasting go far beyond simple calorie restriction."

Key findings include:
- 40% lower risk of heart attack and stroke
- Improved cholesterol levels by an average of 25%
- Reduced inflammation markers by 35%
- Better blood sugar control in diabetic patients

The research team emphasizes that patients should consult their doctors before starting any fasting regimen, especially those with existing health conditions or on medication.`,
    },
    {
      id: 2,
      title: "Mental Health Crisis: Nepal's Youth Face Unprecedented Challenges",
      excerpt: "Exclusive report: Mental health professionals warn of growing crisis among Nepal's young adults as pandemic effects linger.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
      category: "Mental Health",
      readTime: "8 min read",
      author: "Rajesh Sharma, Mental Health Advocate",
      date: "December 27, 2025",
      content: `KATHMANDU - Mental health professionals across Nepal are sounding the alarm about an unprecedented crisis facing the country's youth. Post-pandemic stress, economic uncertainty, and academic pressure have created what experts are calling a "perfect storm" for mental health issues.

"We're seeing young adults coming in with severe anxiety and depression at rates we've never witnessed before," says Dr. Anila Gurung, a psychiatrist at Tribhuvan University Teaching Hospital. "The waiting list for mental health services has tripled in the past year."

Recent statistics paint a concerning picture:
- 65% of university students report symptoms of anxiety
- Depression rates among 18-25 year olds have increased by 180% since 2020
- Suicide attempts in this age group are up by 45%

The government has announced new initiatives, including mental health hotlines and counseling services in all major universities. However, experts say more needs to be done to address the root causes.

"We need to destigmatize mental health in our communities," says social worker Priya Karki. "Young people need to know it's okay to not be okay, and that help is available."`
    },
    {
      id: 3,
      title: "Superfoods or Super Hype? Nutritionists Separate Fact from Fiction",
      excerpt: "We asked leading nutritionists to evaluate the most popular superfoods. Their answers might surprise you.",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
      category: "Nutrition",
      readTime: "6 min read",
      author: "Maya Patel, Registered Dietitian",
      date: "December 26, 2025",
      content: `In a world where every week brings a new "miracle" food, we decided to cut through the noise. We spoke with five leading nutritionists to get their honest take on the superfood phenomenon.

"The term 'superfood' is mostly marketing," admits Dr. Lisa Wong, clinical nutritionist at Mayo Clinic. "But some foods genuinely deserve the attention."

The foods that made the cut?
1. **Fermented foods** - Kimchi, yogurt, and kefir improve gut health and immunity
2. **Leafy greens** - Spinach and kale contain compounds that may slow cognitive decline
3. **Berries** - Blueberries and strawberries reduce inflammation and oxidative stress
4. **Nuts and seeds** - Regular consumption linked to 20% lower mortality risk

What didn't make the list? Goji berries, wheatgrass, and most expensive powders that promise miracle results.

"The real superfood is a balanced diet," Wong emphasizes. "No single food can compensate for poor overall nutrition."`
    },
    {
      id: 4,
      title: "The Walking Revolution: How 10,000 Steps Changed Healthcare",
      excerpt: "From fitness tracker fad to medical prescription: The story of how walking became medicine.",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
      category: "Fitness",
      readTime: "7 min read",
      author: "Dr. James Mitchell, Sports Medicine",
      date: "December 25, 2025",
      content: `What started as a marketing slogan for a Japanese pedometer in 1965 has become one of the most prescribed treatments in modern medicine. The 10,000 steps goal is now backed by over 200 peer-reviewed studies.

"We went from thinking this was just a fitness trend to recognizing it as legitimate medical intervention," says Dr. Rachel Green, cardiologist at Cleveland Clinic.

Recent research shows that regular walkers experience:
- 30% lower risk of coronary heart disease
- 40% reduced risk of premature death
- 50% lower risk of developing type 2 diabetes
- Significant improvements in mental health and cognitive function

The beauty of walking? It's free, accessible, and has minimal side effects. "I can prescribe walking to almost any patient regardless of age or fitness level," says Dr. Green. "It's truly universal medicine."

Healthcare systems worldwide are now incorporating "walking prescriptions" into standard care, with some insurance companies even offering discounts for meeting step goals.`
    },
    {
      id: 5,
      title: "Cancer Screening Guidelines Updated: What You Need to Know",
      excerpt: "Major medical organizations release new recommendations that could save thousands of lives.",
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800",
      category: "Preventive Care",
      readTime: "4 min read",
      author: "Medical Editorial Board",
      date: "December 24, 2025",
      content: `The American Cancer Society and World Health Organization have jointly released updated screening guidelines that experts say could prevent up to 100,000 cancer deaths annually.

Key changes include:
- Colon cancer screening now recommended at age 45 (down from 50)
- Lung cancer screening expanded to include more former smokers
- Breast cancer screening personalized based on risk factors
- New HPV testing guidelines for cervical cancer

"These aren't just minor updates," says Dr. Maria Rodriguez, oncologist at MD Anderson. "These changes reflect decades of research showing that earlier detection dramatically improves outcomes."

The guidelines also emphasize the importance of shared decision-making between patients and doctors. "One size doesn't fit all," Dr. Rodriguez explains. "We need to consider family history, lifestyle, and personal risk factors."

Healthcare providers are urged to implement these changes immediately, with insurance coverage expected to follow within months.`
    },
    {
      id: 6,
      title: "The Sleep Epidemic: Why We're Sleeping Less Than Ever",
      excerpt: "New sleep study reveals shocking statistics about modern sleep patterns and their health consequences.",
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
      category: "Wellness",
      readTime: "5 min read",
      author: "Dr. Emma Thompson, Sleep Specialist",
      date: "December 23, 2025",
      content: `We're in the middle of a sleep epidemic, and the consequences are more severe than most people realize. A comprehensive study from the National Sleep Foundation shows that the average adult now sleeps just 6.7 hours per night - down from 7.9 hours in 1950.

"This is a public health crisis," says Dr. Michael Chang, director of the Sleep Disorders Center at Johns Hopkins. "We're seeing increased rates of obesity, diabetes, heart disease, and mental health issues directly linked to sleep deprivation."

The study found:
- 70% of adults report insufficient sleep at least once a week
- Screen time has increased average sleep onset time by 2 hours
- Sleep medication use has tripled in the past decade
- Workplace productivity losses due to poor sleep exceed $400 billion annually

The solution? Dr. Chang emphasizes that sleep hygiene is crucial: "We need to treat sleep as seriously as we treat diet and exercise. It's not a luxury - it's a biological necessity."

Experts recommend establishing consistent sleep schedules, creating dark cool sleeping environments, and limiting screen exposure before bedtime. For those with persistent sleep issues, professional medical evaluation is essential.`
    }
  ];

  const specializations = [
    { name: "Cardiologist", icon: "❤️", color: "bg-red-100 text-red-600" },
    { name: "Dermatologist", icon: "✨", color: "bg-pink-100 text-pink-600" },
    { name: "Gynecologist", icon: "👩", color: "bg-purple-100 text-purple-600" },
    { name: "Pediatrician", icon: "👶", color: "bg-yellow-100 text-yellow-600" },
    { name: "Orthopedic", icon: "🦴", color: "bg-blue-100 text-blue-600" },
    { name: "Neurologist", icon: "🧠", color: "bg-indigo-100 text-indigo-600" },
    { name: "Psychiatrist", icon: "🧘", color: "bg-green-100 text-green-600" },
    { name: "General Physician", icon: "👨‍⚕️", color: "bg-gray-100 text-gray-600" }
  ];

  return (
    <>
      <Navbar />

      {/* Article Modal - Professional Medical Journalism Style */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedArticle(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Article Header */}
            <div className="relative">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/800x400/0F9D76/ffffff?text=Medical+Article";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold uppercase tracking-wide">
                    {selectedArticle.category}
                  </span>
                  <span className="text-sm opacity-90">{selectedArticle.readTime}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">{selectedArticle.title}</h1>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <span className="font-medium">{selectedArticle.author}</span>
                  <span>•</span>
                  <span>{selectedArticle.date}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Article Content */}
            <div className="p-8 max-h-[calc(90vh-16rem)] overflow-y-auto">
              {/* Article Meta */}
              <div className="border-b border-gray-200 pb-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#0F9D76] to-[#059669] rounded-full flex items-center justify-center text-white font-bold">
                        {selectedArticle.author?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedArticle.author}</p>
                        <p className="text-sm text-gray-600">Medical Journalist</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>Published: {selectedArticle.date}</p>
                      <p>Reading time: {selectedArticle.readTime}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                      </svg>
                    </button>
                    <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Article Body - Professional Typography */}
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-800 leading-relaxed space-y-6">
                  {selectedArticle.content.split('\n\n').map((paragraph, index) => {
                    // Handle different paragraph types
                    if (paragraph.startsWith('-')) {
                      // Bullet points
                      return (
                        <ul key={index} className="space-y-2 ml-6">
                          {paragraph.split('\n').filter(line => line.startsWith('-')).map((line, lineIndex) => (
                            <li key={lineIndex} className="flex items-start gap-3">
                              <span className="text-[#0F9D76] font-bold mt-1">•</span>
                              <span className="text-gray-700">{line.substring(1).trim()}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    } else if (paragraph.includes(':') && paragraph.length < 100) {
                      // Subheading
                      return (
                        <h3 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-4 text-[#0F9D76]">
                          {paragraph}
                        </h3>
                      );
                    } else if (paragraph.includes('"') && paragraph.includes('says')) {
                      // Quote
                      return (
                        <blockquote key={index} className="border-l-4 border-[#0F9D76] pl-6 py-2 my-6 bg-gray-50 rounded-r-lg">
                          <p className="text-lg italic text-gray-700">{paragraph}</p>
                        </blockquote>
                      );
                    } else if (paragraph.trim()) {
                      // Regular paragraph
                      return (
                        <p key={index} className="text-gray-700 leading-relaxed text-justify">
                          {paragraph}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              {/* Article Footer */}
              <div className="border-t border-gray-200 mt-12 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Share this article</h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Facebook
                    </button>
                    <button className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm">
                      Twitter
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                      WhatsApp
                    </button>
                  </div>
                </div>
                <div className="bg-[#0F9D76]/5 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">About AROGYAM Health News</h4>
                  <p className="text-gray-600 text-sm">
                    Stay informed with the latest medical breakthroughs, health tips, and wellness insights from trusted healthcare professionals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-white">
        {/* HERO SECTION - Green Theme */}
        <section className="bg-gradient-to-br from-[#E9F7EF] via-white to-[#D6F6EB] pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-4 py-2 bg-[#0F9D76]/10 text-[#0F9D76] rounded-full mb-6 font-semibold text-sm">
                  Trusted by 10,000+ Patients
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Find & Book <span className="text-[#0F9D76]">Verified Doctors</span> Near You
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Connect with certified healthcare professionals. Book appointments instantly, consult online, and manage your health records all in one place.
                </p>

                {/* Find Doctor Button - Improved Placement */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    onClick={() => navigate("/login")}
                    className="px-8 py-4 bg-[#0F9D76] text-white rounded-xl font-semibold text-lg hover:bg-[#0d8a66] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Find Doctors
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="px-8 py-4 bg-white text-[#0F9D76] border-2 border-[#0F9D76] rounded-xl font-semibold text-lg hover:bg-[#0F9D76]/5 transition-all"
                  >
                    Book Appointment
                  </button>
                </div>

                {/* Stats - Dynamic */}
                <div className="grid grid-cols-3 gap-6 mt-12">
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[#0F9D76]/20">
                    <div className="text-3xl font-bold text-[#0F9D76]">24/7</div>
                    <div className="text-sm text-gray-600 font-semibold">Available</div>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[#0F9D76]/20">
                    <div className="text-3xl font-bold text-[#0F9D76]">100%</div>
                    <div className="text-sm text-gray-600 font-semibold">Secure</div>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[#0F9D76]/20">
                    <div className="text-3xl font-bold text-[#0F9D76]">Easy</div>
                    <div className="text-sm text-gray-600 font-semibold">Booking</div>
                  </div>
                </div>
              </div>

              {/* Hero Image - Using Local Image with Creative Overlay */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0F9D76]/20 to-transparent rounded-3xl z-10"></div>
                  <img
                    src="/landing page showcase image.webp"
                    className="w-full max-w-lg rounded-3xl shadow-2xl object-cover h-[500px] transition-transform duration-500 group-hover:scale-105"
                    alt="Healthcare Professional"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600";
                    }}
                  />
                  <div className="absolute bottom-8 left-8 right-8 z-20 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl animate-fade-in">
                    <p className="text-lg font-bold text-[#0F9D76] mb-1">Your Health, Our Priority</p>
                    <p className="text-sm text-gray-600">Connect with trusted healthcare professionals anytime, anywhere</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SPECIALIZATIONS */}
        <section id="specializations" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
              Popular Specializations
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg">
              Find the right specialist for your health needs
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {specializations.map((spec) => (
                <button
                  key={spec.name}
                  onClick={() => navigate("/login")}
                  className={`p-6 rounded-2xl ${spec.color} hover:shadow-xl transition-all transform hover:-translate-y-1 text-center border-2 border-transparent hover:border-gray-200`}
                >
                  <div className="text-4xl mb-3">{spec.icon}</div>
                  <div className="font-bold text-gray-800">{spec.name}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* HEALTH ARTICLES SECTION */}
        <section id="articles" className="py-16 bg-gradient-to-br from-[#E9F7EF] to-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {healthArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                  onClick={() => setSelectedArticle(article)}
                >
                  {/* Article Image with Overlay */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x250/0F9D76/ffffff?text=Medical+Article";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                        {article.category}
                      </span>
                    </div>
                    
                    {/* Reading Time Badge */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                      <span className="text-xs text-white font-medium">{article.readTime}</span>
                    </div>
                  </div>
                  
                  {/* Article Content */}
                  <div className="p-6">
                    {/* Article Meta */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#0F9D76] to-[#059669] rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {article.author?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{article.author}</p>
                          <p className="text-xs text-gray-500">{article.date}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Article Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#0F9D76] transition-colors leading-tight">
                      {article.title}
                    </h3>
                    
                    {/* Article Excerpt */}
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                      {article.excerpt}
                    </p>
                    
                    {/* Read More Button */}
                    <div className="flex items-center justify-between">
                      <button className="text-[#0F9D76] font-semibold hover:text-[#059669] transition-colors flex items-center gap-2 text-sm group">
                        Read Full Article
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      {/* Engagement Stats */}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {Math.floor(Math.random() * 1000 + 100)}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {Math.floor(Math.random() * 100 + 10)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Why Choose AROGYAM?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "🔍", title: "Find Verified Doctors", desc: "Search from thousands of verified healthcare professionals" },
                { icon: "📅", title: "Easy Booking", desc: "Book appointments in just a few clicks, 24/7 availability" },
                { icon: "💊", title: "Health Records", desc: "Access your medical history and prescriptions anytime" },
                { icon: "📱", title: "Video Consultations", desc: "Connect with doctors from the comfort of your home" },
                { icon: "🔔", title: "Appointment Reminders", desc: "Never miss an appointment with smart notifications" },
                { icon: "🏥", title: "Multiple Specialties", desc: "From general physicians to specialists, we have it all" }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 bg-gradient-to-br from-[#E9F7EF] to-white rounded-2xl hover:shadow-xl transition-all border border-gray-100">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">About AROGYAM</h2>
              <p className="text-xl text-gray-600">Your trusted healthcare companion</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  AROGYAM is dedicated to making quality healthcare accessible to everyone in Nepal. 
                  We connect patients with verified healthcare professionals, making it easier than ever 
                  to book appointments, consult with doctors, and manage your health records.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Whether you need a general checkup, specialist consultation, or ongoing care, 
                  AROGYAM provides a seamless platform to manage all your healthcare needs in one place.
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#0F9D76]/10 to-[#0d8a66]/10 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us?</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="text-[#0F9D76] font-bold">✓</span>
                    <span>Verified doctors with proven credentials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#0F9D76] font-bold">✓</span>
                    <span>Secure payment with eSewa integration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#0F9D76] font-bold">✓</span>
                    <span>24/7 appointment booking system</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#0F9D76] font-bold">✓</span>
                    <span>Video consultations from home</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#0F9D76] font-bold">✓</span>
                    <span>Comprehensive health records management</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION - Creative Design */}
        <section id="contact" className="py-16 bg-gradient-to-br from-[#E9F7EF] via-white to-[#D6F6EB] relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-xl text-gray-600">We're here to help you with your healthcare needs</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-[#10B981]">
                <div className="w-20 h-20 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl">📍</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Address</h3>
                <p className="text-gray-600">Herald College Kathmandu<br />Nepal</p>
              </div>
              <div className="bg-white rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-[#10B981]">
                <div className="w-20 h-20 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl">📧</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600">Pranjalkoirala02@gmail.com</p>
              </div>
              <div className="bg-white rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-[#10B981]">
                <div className="w-20 h-20 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl">📱</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600">9865121000</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-16 bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-white/90">Join thousands of patients who trust AROGYAM for their healthcare needs</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/register")}
                className="px-8 py-4 bg-white text-[#10B981] rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#0F9D76] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold">AROGYAM</h3>
                </div>
                <p className="text-gray-400">Your trusted healthcare partner</p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><button onClick={() => navigate("/")} className="hover:text-white">Home</button></li>
                  <li><button onClick={() => navigate("/login")} className="hover:text-white">Find Doctors</button></li>
                  <li><button onClick={() => scrollTo("articles")} className="hover:text-white">Health Articles</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Contact</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Herald College Kathmandu</li>
                  <li>Email: Pranjalkoirala02@gmail.com</li>
                  <li>Phone: 9865121000</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">About</h4>
                <p className="text-gray-400 text-sm">
                  AROGYAM is a comprehensive healthcare platform designed to make quality healthcare accessible to everyone.
                </p>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
              © 2025 AROGYAM • Final Year Project by Pranjal Babu Koirala (2407642)
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
