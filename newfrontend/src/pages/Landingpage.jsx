// src/pages/LandingPage.jsx - With Green Theme
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const scrollTo = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const healthArticles = [
    {
      id: 1,
      title: "10 Essential Tips for Maintaining Heart Health",
      excerpt: "Learn about the best practices for keeping your heart healthy and preventing cardiovascular diseases.",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800",
      category: "Cardiology",
      readTime: "5 min read",
      content: `Heart health is crucial for overall well-being. Here are 10 essential tips:

1. **Eat a Heart-Healthy Diet**: Include plenty of fruits, vegetables, whole grains, and lean proteins. Limit saturated fats, trans fats, and sodium.

2. **Exercise Regularly**: Aim for at least 150 minutes of moderate-intensity exercise per week. Activities like walking, swimming, or cycling are excellent.

3. **Maintain a Healthy Weight**: Being overweight increases your risk of heart disease. Work with your doctor to achieve and maintain a healthy weight.

4. **Quit Smoking**: Smoking is a major risk factor for heart disease. If you smoke, seek help to quit.

5. **Limit Alcohol**: Excessive alcohol can raise blood pressure and contribute to heart problems. Drink in moderation.

6. **Manage Stress**: Chronic stress can contribute to heart disease. Practice relaxation techniques like meditation or yoga.

7. **Get Enough Sleep**: Aim for 7-9 hours of quality sleep per night. Poor sleep can increase heart disease risk.

8. **Monitor Blood Pressure**: High blood pressure is a silent killer. Get regular checkups and follow your doctor's advice.

9. **Control Cholesterol**: High cholesterol can lead to blocked arteries. Eat a healthy diet and take medications if prescribed.

10. **Regular Health Checkups**: Visit your doctor regularly for preventive care and early detection of heart problems.

Remember, small lifestyle changes can make a big difference in your heart health. Start with one or two changes and gradually build healthier habits.`
    },
    {
      id: 2,
      title: "Understanding Mental Health: A Complete Guide",
      excerpt: "Comprehensive guide to understanding mental health, recognizing symptoms, and seeking help.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
      category: "Mental Health",
      readTime: "8 min read",
      content: `Mental health is just as important as physical health. Here's what you need to know:

**What is Mental Health?**
Mental health includes our emotional, psychological, and social well-being. It affects how we think, feel, and act.

**Common Mental Health Conditions:**
- Depression: Persistent sadness, loss of interest, fatigue
- Anxiety: Excessive worry, restlessness, difficulty concentrating
- Stress: Physical and emotional response to challenges

**Signs to Watch For:**
- Changes in sleep patterns
- Loss of interest in activities
- Mood swings
- Difficulty concentrating
- Withdrawal from social activities

**How to Maintain Good Mental Health:**
1. Stay connected with friends and family
2. Exercise regularly
3. Practice mindfulness and meditation
4. Get adequate sleep
5. Eat a balanced diet
6. Limit alcohol and avoid drugs
7. Seek professional help when needed

**When to Seek Help:**
If you experience persistent symptoms that interfere with daily life, don't hesitate to reach out to a mental health professional. Early intervention is key to recovery.

Remember, seeking help is a sign of strength, not weakness.`
    },
    {
      id: 3,
      title: "Nutrition and Diet: Building Healthy Eating Habits",
      excerpt: "Discover how proper nutrition can improve your overall health and prevent chronic diseases.",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
      category: "Nutrition",
      readTime: "6 min read",
      content: `Good nutrition is the foundation of good health. Here's how to build healthy eating habits:

**The Basics of Healthy Eating:**
- Eat a variety of foods from all food groups
- Focus on whole, unprocessed foods
- Balance your meals with proteins, carbs, and healthy fats
- Stay hydrated with water

**Key Nutrients:**
- **Proteins**: Essential for muscle and tissue repair (lean meats, beans, nuts)
- **Carbohydrates**: Primary energy source (whole grains, fruits, vegetables)
- **Fats**: Important for brain health (avocado, nuts, olive oil)
- **Vitamins & Minerals**: Support various body functions

**Tips for Healthy Eating:**
1. Plan your meals ahead
2. Cook at home more often
3. Read food labels
4. Control portion sizes
5. Eat mindfully
6. Limit processed foods
7. Include fruits and vegetables in every meal

**Common Mistakes to Avoid:**
- Skipping meals
- Overeating processed foods
- Not drinking enough water
- Extreme dieting
- Ignoring portion sizes

Start with small changes and build sustainable habits over time.`
    },
    {
      id: 4,
      title: "Exercise and Fitness: Your Path to Better Health",
      excerpt: "Explore the benefits of regular exercise and how to create a sustainable fitness routine.",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
      category: "Fitness",
      readTime: "7 min read",
      content: `Regular exercise is one of the best things you can do for your health. Here's your guide:

**Benefits of Exercise:**
- Improves cardiovascular health
- Strengthens muscles and bones
- Boosts mental health
- Helps with weight management
- Improves sleep quality
- Increases energy levels

**Types of Exercise:**
1. **Cardio**: Running, cycling, swimming (150 min/week recommended)
2. **Strength Training**: Weight lifting, resistance bands (2-3 times/week)
3. **Flexibility**: Yoga, stretching (daily if possible)
4. **Balance**: Important for older adults

**Creating a Fitness Routine:**
- Start slow and gradually increase intensity
- Choose activities you enjoy
- Set realistic goals
- Schedule workouts like appointments
- Find a workout buddy for motivation
- Mix different types of exercises

**Safety Tips:**
- Warm up before exercising
- Stay hydrated
- Listen to your body
- Use proper form
- Rest when needed
- Consult a doctor before starting if you have health concerns

Remember, any movement is better than none. Start where you are and build from there.`
    },
    {
      id: 5,
      title: "Preventive Care: Regular Health Checkups Matter",
      excerpt: "Why regular health checkups are crucial for early detection and prevention of diseases.",
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800",
      category: "Preventive Care",
      readTime: "4 min read",
      content: `Preventive care is essential for maintaining good health. Here's why regular checkups matter:

**Why Preventive Care?**
- Early detection of health problems
- Prevention of serious diseases
- Lower healthcare costs in the long run
- Peace of mind
- Better treatment outcomes

**Recommended Checkups:**
- **Annual Physical**: Complete health assessment
- **Dental Checkup**: Every 6 months
- **Eye Exam**: Every 1-2 years
- **Blood Pressure**: Regular monitoring
- **Cholesterol Check**: Every 5 years (or as recommended)
- **Cancer Screenings**: Based on age and risk factors

**What to Expect:**
- Review of medical history
- Physical examination
- Blood tests
- Vaccination updates
- Health counseling

**Age-Specific Screenings:**
- **20s-30s**: Basic screenings, STD tests
- **40s**: Mammograms, colonoscopy prep
- **50s+**: More frequent screenings

**Between Checkups:**
- Monitor your health at home
- Track symptoms
- Maintain healthy lifestyle
- Don't ignore warning signs

Regular checkups help catch problems early when they're easier to treat.`
    },
    {
      id: 6,
      title: "Sleep Hygiene: The Foundation of Good Health",
      excerpt: "Learn how quality sleep affects your health and discover tips for better sleep hygiene.",
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
      category: "Wellness",
      readTime: "5 min read",
      content: `Quality sleep is essential for physical and mental health. Here's how to improve your sleep:

**Why Sleep Matters:**
- Restores and repairs the body
- Improves memory and learning
- Boosts immune system
- Regulates mood
- Supports growth and development

**How Much Sleep Do You Need?**
- Adults: 7-9 hours
- Teenagers: 8-10 hours
- Children: 9-12 hours
- Infants: 12-16 hours

**Tips for Better Sleep:**
1. **Stick to a Schedule**: Go to bed and wake up at the same time daily
2. **Create a Bedtime Routine**: Relaxing activities before sleep
3. **Optimize Your Bedroom**: Cool, dark, and quiet
4. **Limit Screen Time**: Avoid screens 1 hour before bed
5. **Avoid Caffeine**: No caffeine after 2 PM
6. **Exercise Regularly**: But not too close to bedtime
7. **Manage Stress**: Practice relaxation techniques
8. **Avoid Large Meals**: Don't eat heavy meals before bed

**Common Sleep Problems:**
- Insomnia: Difficulty falling or staying asleep
- Sleep Apnea: Breathing interruptions during sleep
- Restless Legs: Uncomfortable sensations in legs

**When to See a Doctor:**
If sleep problems persist for more than a few weeks and affect your daily life, consult a healthcare provider.

Good sleep is not a luxury—it's a necessity for good health.`
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

  const healthQuiz = [
    {
      question: "How much water should an average adult drink daily?",
      options: ["4-5 glasses", "6-8 glasses", "10-12 glasses", "Only when thirsty"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400"
    },
    {
      question: "What is the recommended amount of sleep for adults?",
      options: ["4-5 hours", "6-7 hours", "7-9 hours", "10+ hours"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400"
    },
    {
      question: "How many minutes of exercise per week is recommended?",
      options: ["60 minutes", "90 minutes", "150 minutes", "300 minutes"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"
    },
    {
      question: "Which vitamin is primarily obtained from sunlight?",
      options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
      correct: 3,
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400"
    },
    {
      question: "What is a healthy resting heart rate for adults?",
      options: ["40-60 bpm", "60-100 bpm", "100-120 bpm", "120-140 bpm"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"
    }
  ];

  const handleQuizAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    if (answerIndex === healthQuiz[currentQuestion].correct) {
      setScore(score + 1);
    }
    setTimeout(() => {
      if (currentQuestion < healthQuiz.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setQuizStarted(false);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
  };

  return (
    <>
      <Navbar />

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedArticle(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{selectedArticle.title}</h2>
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
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
                <span className="px-3 py-1 bg-[#0F9D76]/10 text-[#0F9D76] rounded-full text-sm font-semibold">
                  {selectedArticle.category}
                </span>
                <span className="text-sm text-gray-500">{selectedArticle.readTime}</span>
              </div>
              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">{selectedArticle.content}</div>
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
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Health & Wellness Articles
              </h2>
              <p className="text-xl text-gray-600">
                Stay informed with expert health advice and wellness tips
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {healthArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x250/0F9D76/ffffff?text=Health+Article";
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-[#0F9D76]/10 text-[#0F9D76] rounded-full text-xs font-semibold">
                        {article.category}
                      </span>
                      <span className="text-sm text-gray-500">{article.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {article.excerpt}
                    </p>
                    <button className="text-[#0F9D76] font-semibold hover:underline flex items-center gap-2">
                      Read More
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* HEALTH QUIZ SECTION */}
        <section id="quiz" className="py-16 bg-gradient-to-br from-[#E9F7EF] to-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Health & Fitness Quiz
              </h2>
              <p className="text-xl text-gray-600">
                Test your health knowledge and learn something new!
              </p>
            </div>

            {!quizStarted ? (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-6xl">🧠</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Test Your Health Knowledge?
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Take our quick 5-question quiz about health, fitness, and wellness. 
                  Learn fun facts while testing what you know!
                </p>
                <button
                  onClick={resetQuiz}
                  className="px-8 py-4 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-bold text-lg hover:from-[#059669] hover:to-[#047857] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Start Quiz
                </button>
                {score > 0 && (
                  <div className="mt-8 p-6 bg-[#0F9D76]/10 rounded-xl">
                    <p className="text-2xl font-bold text-[#0F9D76] mb-2">
                      Your Score: {score}/{healthQuiz.length}
                    </p>
                    <p className="text-gray-600">
                      {score === healthQuiz.length 
                        ? "Perfect! You're a health expert! 🎉"
                        : score >= healthQuiz.length * 0.7
                        ? "Great job! You know your health facts! 👍"
                        : "Good try! Keep learning about health! 💪"
                      }
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-[#0F9D76]">
                      Question {currentQuestion + 1} of {healthQuiz.length}
                    </span>
                    <span className="text-sm font-semibold text-gray-600">
                      Score: {score}/{healthQuiz.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#10B981] to-[#059669] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / healthQuiz.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {healthQuiz[currentQuestion] && (
                  <>
                    <div className="mb-6">
                      <img
                        src={healthQuiz[currentQuestion].image}
                        alt="Health Quiz"
                        className="w-full h-48 object-cover rounded-xl mb-4"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/600x300/0F9D76/ffffff?text=Health+Quiz";
                        }}
                      />
                      <h3 className="text-2xl font-bold text-gray-900">
                        {healthQuiz[currentQuestion].question}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {healthQuiz[currentQuestion].options.map((option, index) => {
                        let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all font-medium ";
                        if (selectedAnswer !== null) {
                          if (index === healthQuiz[currentQuestion].correct) {
                            buttonClass += "bg-green-100 border-green-500 text-green-800";
                          } else if (index === selectedAnswer && index !== healthQuiz[currentQuestion].correct) {
                            buttonClass += "bg-red-100 border-red-500 text-red-800";
                          } else {
                            buttonClass += "bg-gray-50 border-gray-200 text-gray-600";
                          }
                        } else {
                          buttonClass += "bg-white border-gray-200 hover:border-[#10B981] hover:bg-[#10B981]/5 text-gray-900 cursor-pointer";
                        }
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handleQuizAnswer(index)}
                            disabled={selectedAnswer !== null}
                            className={buttonClass}
                          >
                            {option}
                            {selectedAnswer === index && index === healthQuiz[currentQuestion].correct && (
                              <span className="ml-2">✓</span>
                            )}
                            {selectedAnswer === index && index !== healthQuiz[currentQuestion].correct && (
                              <span className="ml-2">✗</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {currentQuestion === healthQuiz.length - 1 && selectedAnswer !== null && (
                      <div className="mt-8 p-6 bg-gradient-to-r from-[#10B981]/10 to-[#059669]/10 rounded-xl text-center">
                        <p className="text-2xl font-bold text-[#10B981] mb-2">
                          Quiz Complete!
                        </p>
                        <p className="text-gray-700 mb-4">
                          Your Final Score: {score + (selectedAnswer === healthQuiz[currentQuestion].correct ? 1 : 0)}/{healthQuiz.length}
                        </p>
                        <button
                          onClick={resetQuiz}
                          className="px-6 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-lg font-semibold hover:from-[#059669] hover:to-[#047857] transition-all"
                        >
                          Take Quiz Again
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
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
