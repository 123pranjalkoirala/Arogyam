// Enhanced Landing Page - Professional Healthcare Platform
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
      title: "Breaking: New Heart Disease Prevention Study Reveals Surprising Results",
      excerpt: "Latest research from Johns Hopkins shows that intermittent fasting may reduce heart disease risk by 40% more than previously thought.",
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

The research team emphasizes that patients should consult their doctors before starting any fasting regimen, especially those with existing health conditions or on medication.`
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
    { name: "Cardiologist", icon: "❤️", color: "bg-red-100 text-red-600", description: "Heart and blood vessel specialists" },
    { name: "Dermatologist", icon: "✨", color: "bg-pink-100 text-pink-600", description: "Skin, hair, and nail experts" },
    { name: "Gynecologist", icon: "👩", color: "bg-purple-100 text-purple-600", description: "Women's reproductive health" },
    { name: "Pediatrician", icon: "👶", color: "bg-yellow-100 text-yellow-600", description: "Children's healthcare specialists" },
    { name: "Orthopedic", icon: "🦴", color: "bg-blue-100 text-blue-600", description: "Bone and joint specialists" },
    { name: "Neurologist", icon: "🧠", color: "bg-indigo-100 text-indigo-600", description: "Brain and nervous system experts" },
    { name: "Psychiatrist", icon: "🧘", color: "bg-green-100 text-green-600", description: "Mental health professionals" },
    { name: "General Physician", icon: "👨‍⚕️", color: "bg-gray-100 text-gray-600", description: "Primary care doctors" }
  ];

  return (
    <>
      <Navbar />

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedArticle(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{selectedArticle.title}</h2>
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  className="w-full h-64 object-cover rounded-xl"
                />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                  {selectedArticle.category}
                </span>
                <span className="text-sm text-gray-500">{selectedArticle.readTime}</span>
                <span className="text-sm text-gray-500">By {selectedArticle.author}</span>
                <span className="text-sm text-gray-500">{selectedArticle.date}</span>
              </div>
              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">{selectedArticle.content}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-white">
        {/* HERO SECTION - Professional Design */}
        <section className="bg-gradient-to-br from-primary/5 via-white to-secondary/10 pt-24 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full mb-6 font-semibold text-sm animate-fade-in">
                  🏆 Trusted by 50,000+ Patients Across Nepal
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Your Health,<br />
                  <span className="text-primary">Our Priority</span>
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Connect with Nepal's most trusted healthcare professionals. 
                  Book appointments instantly, consult online, and manage your health journey with confidence.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    onClick={() => navigate("/login")}
                    className="px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all shadow-medium hover:shadow-strong transform hover:-translate-y-0.5"
                  >
                    Find Doctors Now
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="px-8 py-4 bg-white text-primary border-2 border-primary rounded-xl font-semibold text-lg hover:bg-primary/5 transition-all"
                  >
                    Quick Appointment
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6 mt-12">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary/20 shadow-soft">
                    <div className="text-3xl font-bold text-primary">24/7</div>
                    <div className="text-sm text-gray-600 font-semibold">Available</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary/20 shadow-soft">
                    <div className="text-3xl font-bold text-primary">100%</div>
                    <div className="text-sm text-gray-600 font-semibold">Secure</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary/20 shadow-soft">
                    <div className="text-3xl font-bold text-primary">5★</div>
                    <div className="text-sm text-gray-600 font-semibold">Rated</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl z-10 animate-pulse"></div>
                  <img
                    src="/landing page showcase image.webp"
                    className="w-full max-w-lg rounded-3xl shadow-strong object-cover h-[500px] transition-transform duration-500 group-hover:scale-105"
                    alt="Healthcare Professional"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600";
                    }}
                  />
                  <div className="absolute bottom-8 left-8 right-8 z-20 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-strong animate-slide-up">
                    <p className="text-lg font-bold text-primary mb-1">🏥 Nepal's Leading Healthcare Platform</p>
                    <p className="text-sm text-gray-600">Connecting patients with verified doctors since 2020</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BADGES */}
        <section className="py-8 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <span className="text-sm font-semibold text-gray-600">🏥 Partnered with 50+ Hospitals</span>
              <span className="text-sm font-semibold text-gray-600">👨‍⚕️ 500+ Verified Doctors</span>
              <span className="text-sm font-semibold text-gray-600">💊 eSewa Payment Integrated</span>
              <span className="text-sm font-semibold text-gray-600">🔒 HIPAA Compliant</span>
              <span className="text-sm font-semibold text-gray-600">📱 Mobile App Available</span>
            </div>
          </div>
        </section>

        {/* SPECIALIZATIONS */}
        <section id="specializations" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Find Your Specialist
              </h2>
              <p className="text-center text-gray-600 mb-12 text-lg">
                Expert doctors across all major medical specialties
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {specializations.map((spec) => (
                <button
                  key={spec.name}
                  onClick={() => navigate("/login")}
                  className={`p-6 rounded-2xl ${spec.color} hover:shadow-strong transition-all transform hover:-translate-y-1 text-center border-2 border-transparent hover:border-gray-200 group`}
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{spec.icon}</div>
                  <div className="font-bold text-gray-800 mb-1">{spec.name}</div>
                  <div className="text-xs text-gray-600">{spec.description}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* HEALTH ARTICLES SECTION */}
        <section id="articles" className="py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Latest Health News & Insights
              </h2>
              <p className="text-xl text-gray-600">
                Stay informed with expert health advice and medical breakthroughs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {healthArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-strong transition-all transform hover:-translate-y-2 cursor-pointer group"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x250/primary/ffffff?text=Health+Article";
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-primary/90 text-white rounded-full text-xs font-semibold backdrop-blur-sm">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                      <span>{article.date}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                      <span>•</span>
                      <span>{article.author}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {article.excerpt}
                    </p>
                    <button className="text-primary font-semibold hover:text-primary/80 transition-colors flex items-center gap-2 group">
                      Read Full Article
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose AROGYAM?
              </h2>
              <p className="text-xl text-gray-600">
                Nepal's most comprehensive healthcare platform
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "🔍", title: "Verified Doctors", desc: "All doctors are verified with medical credentials and experience" },
                { icon: "📅", title: "Instant Booking", desc: "Book appointments 24/7 with real-time availability" },
                { icon: "💊", title: "Digital Records", desc: "Access your medical history and prescriptions anytime" },
                { icon: "📹", title: "Video Consultations", desc: "Consult with doctors from comfort of your home" },
                { icon: "💳", title: "eSewa Payment", desc: "Secure payments with Nepal's trusted digital wallet" },
                { icon: "🏥", title: "All Specialties", desc: "From general physicians to super-specialists" }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl hover:shadow-medium transition-all border border-gray-100 group">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of Nepalese who trust AROGYAM for their healthcare needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/register")}
                className="px-8 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-strong"
              >
                Get Started Free
              </button>
              <button
                onClick={() => scrollTo("specializations")}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-white/30 transition-all border border-white/30"
              >
                Browse Specialties
              </button>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">About AROGYAM</h2>
              <p className="text-xl text-gray-600">Nepal's trusted healthcare companion since 2020</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  AROGYAM is revolutionizing healthcare access in Nepal by connecting patients with verified healthcare professionals through our innovative digital platform. We believe quality healthcare should be accessible to everyone, regardless of location or circumstances.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  From routine checkups to specialized consultations, we provide a seamless experience that puts your health first. Our platform combines cutting-edge technology with compassionate care to deliver the future of healthcare today.
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Nepal Chooses Us</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>500+ verified doctors across all specialties</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>Secure eSewa payment integration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>24/7 appointment booking system</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>Video consultations from anywhere</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>Digital health records management</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
