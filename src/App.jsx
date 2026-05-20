import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, remove } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, updatePassword } from "firebase/auth";

const ADMIN_UID = "BkKFxqb7FWduUAeeOVnnVgvf0CR2"; 

const firebaseConfig = {
  apiKey: "AIzaSyApj0y619Jb92moLIGZMVAY8ZhA3D25T4M",
  authDomain: "cebu-fierce-fitness-gym.firebaseapp.com",
  databaseURL: "https://cebu-fierce-fitness-gym-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cebu-fierce-fitness-gym",
  messagingSenderId: "485443215357",
  appId: "1:485443215357:web:42700e2347502f09874394",
  measurementId: "G-77KBKFPMXH"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const auth = getAuth(app);

const defaultProducts = [
  { id: 1, title: "Mastering Virtual Assistance", price: 29.99, type: "eBook", desc: "A comprehensive 150-page guide covering client acquisition, system setup, and scaling your VA business from scratch.", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop" },
  { id: 2, title: "The Confident Host", price: 15.00, type: "Digital Guide", desc: "My personal scripts, warm-up routines, and stage presence techniques to own any room or corporate event.", image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=600&auto=format&fit=crop" },
  { id: 3, title: "Teacher's Planner 2026", price: 45.00, type: "Physical Book", desc: "A beautifully bound, undated 12-month planner designed specifically for educators juggling multiple classes and side hustles.", image: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?q=80&w=600&auto=format&fit=crop" },
  { id: 4, title: "Public Speaking Mastery", price: 99.00, type: "Video Course", desc: "A 4-hour high-definition video course breaking down vocal tonality, crowd control, and storytelling mechanics.", image: "https://images.unsplash.com/photo-1475721025505-154dfc4be788?q=80&w=600&auto=format&fit=crop" }
];

const mockBookings = [
  { id: "mock1", name: "Marcus Thorne", email: "marcus@example.com", service: "Virtual Assistant Consultation", date: "2026-05-15", time: "11:00 AM", status: "Confirmed", notes: "I need help auditing my client onboarding workflow. It currently takes too much manual effort." },
  { id: "mock2", name: "Sarah Jenkins", email: "sarah@example.com", service: "1-on-1 Mentorship Class", date: "2026-05-18", time: "03:00 PM", status: "Pending", notes: "Looking to improve my stage presence for an upcoming corporate seminar next month." }
];

const services = [
  { id: 1, title: "1-on-1 Mentorship Class", duration: "60 Min", price: 50.00, desc: "Personalized coaching tailored to your specific goals." },
  { id: 2, title: "Virtual Assistant Consultation", duration: "45 Min", price: 40.00, desc: "System setup, client management, and workflow audits." },
  { id: 3, title: "Event Hosting Pre-Meeting", duration: "30 Min", price: 0.00, desc: "Initial discovery call for upcoming event bookings." }
];

const standardTimeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

const testimonials = [
  { id: 1, text: <>Her 1-on-1 classes <span className="text-[#FFBF00] font-bold">completely transformed</span> my public speaking skills. I booked my <span className="text-white font-bold border-b border-[#FFBF00]">first major hosting gig</span> within a month!</>, author: "Sarah Jenkins", role: "Aspiring Host" },
  { id: 2, text: <>The most <span className="text-[#FFBF00] font-bold">organized and insightful</span> virtual assistant mentor. The shop resources are <span className="text-white font-bold">top-tier</span> and incredibly practical.</>, author: "Marcus Thorne", role: "Freelance VA" },
  { id: 3, text: <>Her book gave me the <span className="text-[#FFBF00] font-bold">exact blueprint</span> I needed. My digital business grew by <span className="text-white font-bold border-b border-[#FFBF00]">300%</span> in just two months.</>, author: "Elena Rodriguez", role: "Digital Shop Owner" }
];

const faqs = [
  { id: 1, question: "How do 1-on-1 mentorship sessions work?", answer: "All sessions are held virtually via Zoom. Once you book a date, you will receive a calendar invite with the meeting link and a quick questionnaire to help me prepare for our session." },
  { id: 2, question: "Can I hire you to host an international event?", answer: "Yes! While I am based locally, I frequently travel for corporate hosting and MC gigs. Please book a free 30-min discovery call to discuss logistics." },
  { id: 3, question: "Are your digital shop items refundable?", answer: "Due to the nature of digital downloads, all eBook and Video Course sales are final. Physical books can be returned within 14 days if damaged upon arrival." }
];

const expertise = [
  { id: 1, title: "Mentorship & Teaching", desc: "Empowering the next generation with direct, actionable guidance.", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" /> },
  { id: 2, title: "Event Hosting", desc: "Commanding stages and keeping corporate events flowing seamlessly.", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /> },
  { id: 3, title: "Virtual Assistance", desc: "Optimizing workflows and scaling digital businesses behind the scenes.", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
  { id: 4, title: "Author & Creator", desc: "Distilling years of experience into premium books and digital courses.", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> }
];

const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3500);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]); 

  if (!message) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-fade-up">
      <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border ${type === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-200' : 'bg-green-950/90 border-green-500/50 text-green-200'} backdrop-blur-md`}>
        {type === 'error' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        )}
        <span className="text-sm font-bold tracking-wide">{message}</span>
      </div>
    </div>
  );
};

// Helper component for Star Ratings
const StarRating = ({ rating, setRating = null, size = "w-4 h-4" }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg 
          key={star}
          onClick={() => setRating && setRating(star)}
          xmlns="http://www.w3.org/2000/svg" 
          className={`${size} ${star <= rating ? 'text-[#FFBF00]' : 'text-gray-600'} ${setRating ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

// Helper component for Eye Icon
const EyeIcon = ({ show }) => {
  return show ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
  );
};

const Home = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="w-full flex flex-col animate-fade-up">
      <section className="relative w-full py-12 px-6 flex justify-center mt-4">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FFBF00] opacity-[0.03] rounded-full blur-[120px] pointer-events-none overflow-hidden"></div>
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center z-10">
          <div className="flex flex-col items-start max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#FFBF00] text-sm font-bold tracking-wide shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FFBF00] animate-pulse"></span>
              Accepting New Students
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
              Elevate Your <br />
              <span className="text-[#FFBF00]">Potential.</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Expert guidance from a seasoned professional. Discover premium resources, classes, and mentorship to accelerate your growth.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {['Teacher', 'Author', 'Host MC', 'Virtual Assistant', 'Digital Shop'].map(role => (
                <span key={role} className="bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-1.5 rounded text-sm font-medium text-gray-300">
                  {role}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/booking" className="cursor-pointer text-center bg-[#FFBF00] text-black font-bold py-3 px-6 rounded hover:bg-white transition-all duration-300 shadow-md">
                Book a Session
              </Link>
              <Link to="/shop" className="cursor-pointer text-center bg-transparent border border-white/20 text-white font-bold py-3 px-6 rounded hover:border-[#FFBF00] hover:text-[#FFBF00] transition-all duration-300">
                Explore Shop
              </Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-[340px] md:w-[380px] aspect-[4/5] rounded-xl overflow-hidden shadow-xl border border-white/10 group shrink-0">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 pointer-events-none"></div>
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" alt="Client Profile" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"/>
              <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-none">
                <h3 className="text-2xl font-bold text-white mb-1">Jane Doe</h3>
                <p className="text-[#FFBF00] text-base font-medium">Empowering professionals globally.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-20 px-6 flex justify-center bg-[#0a0a0a] border-t border-white/5 relative">
        <div className="max-w-6xl mx-auto w-full z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Areas of Expertise</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Combining years of professional experience across multiple disciplines to deliver unmatched value to students and clients.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {expertise.map(item => (
              <div key={item.id} className="bg-[#121212] p-8 rounded-xl border border-white/5 hover:border-[#FFBF00]/30 transition-all duration-300 group">
                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#FFBF00]/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FFBF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {item.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-20 flex flex-col items-center bg-[#050505] overflow-hidden border-t border-white/5">
        <div className="text-center mb-10 px-6">
          <h2 className="text-3xl font-bold text-white tracking-tight">Student Success</h2>
        </div>
        <div className="relative w-full flex overflow-hidden group">
          <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none"></div>
          <div className="animate-scrolling-track gap-6 px-4">
            {[...testimonials, ...testimonials].map((t, index) => (
              <div key={index} className="w-[320px] md:w-[400px] flex-shrink-0 bg-[#121212] p-6 rounded-xl border border-white/5 relative flex flex-col justify-between hover:border-[#FFBF00]/30 transition-colors duration-300">
                <div className="text-[#FFBF00] text-4xl font-serif absolute top-4 left-4 opacity-10 leading-none">"</div>
                <p className="text-gray-300 text-base leading-relaxed mb-6 italic relative z-10">"{t.text}"</p>
                <div className="flex items-center gap-4 mt-auto border-t border-white/5 pt-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-full overflow-hidden border border-[#FFBF00]/30 flex-shrink-0 relative">
                    <img src={`https://i.pravatar.cc/150?u=${t.id}`} alt={t.author} className="absolute inset-0 w-full h-full object-cover"/>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base">{t.author}</h4>
                    <p className="text-[#FFBF00] text-sm font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-20 px-6 flex justify-center bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-3xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400">Everything you need to know before we start working together.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-white pr-4">{faq.question}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-[#FFBF00] transform transition-transform duration-300 ${openFaq === faq.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === faq.id ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const Booking = ({ user, showToast }) => {
  const navigate = useNavigate();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); 
  const [dbServices, setDbServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceAvailability, setServiceAvailability] = useState({});
  const [activeSlots, setActiveSlots] = useState([]);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', notes: '' });

  useEffect(() => {
    setDbServices(services);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (selectedService) {
      const availRef = ref(db, `availability/${selectedService}/${currentYear}/${currentMonth}`);
      onValue(availRef, (snapshot) => {
        setServiceAvailability(snapshot.val() || {});
      }, (error) => {
        console.error(error);
      });
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [selectedService, currentMonth, currentYear]);

  useEffect(() => {
    if (selectedDate && selectedService) {
      const slots = serviceAvailability[selectedDate] || [];
      setActiveSlots(slots);
    }
  }, [selectedDate, selectedService, serviceAvailability]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const activeService = dbServices.find(s => s.id === selectedService);

  const handleDateClick = (day, isAvailable) => {
    if (isAvailable) {
      setSelectedDate(day);
      setSelectedTime(null);
    }
  };

  const handleConfirmClick = () => {
    if (!user) {
      showToast("Please log in to book a session.", "error");
      navigate('/login?redirect=/booking');
      return;
    }
    if (selectedDate && selectedTime) setShowForm(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formattedDateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    const newBooking = {
      name: formData.name || "Guest",
      email: formData.email || "guest@example.com",
      service: activeService ? activeService.title : "Unknown Service",
      date: formattedDateString,
      time: selectedTime,
      status: "Pending", // Keeps it pending for admin approval
      notes: formData.notes || "",
      timestamp: Date.now()
    };
    
    push(ref(db, 'bookings'), newBooking).then(() => {
      setIsSubmitted(true);
      showToast("Booking request sent! Waiting for admin approval.", "success");
    }).catch((err) => {
      showToast(err.message, "error");
    });
  };

  const resetBooking = () => {
    setShowForm(false);
    setIsSubmitted(false);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedService(null);
    setFormData({ name: '', email: '', notes: '' });
  };

  return (
    <div className="w-full py-12 px-6 flex justify-center animate-fade-up">
      <div className="max-w-6xl mx-auto w-full mt-4">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Book a Session</h2>
          <p className="text-gray-400 text-base">Select a service to view availability.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-[#FFBF00]/30 border-t-[#FFBF00] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
            <div className="flex flex-col space-y-4">
              {dbServices.map((service) => (
                <div 
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`p-6 rounded-lg border cursor-pointer transition-all duration-300 ${
                    selectedService === service.id 
                      ? 'bg-[#FFBF00]/10 border-[#FFBF00]' 
                      : 'bg-[#121212] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{service.title}</h3>
                    <div className="text-lg font-bold text-[#FFBF00]">${(service.price || 0).toFixed(2)}</div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{service.desc}</p>
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FFBF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {service.duration}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#121212] rounded-lg border border-white/10 p-6 sticky top-24 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-3">Select Date & Time</h3>
              {!selectedService ? (
                <div className="flex flex-col items-center justify-center h-40 text-center opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-white text-sm">Please select a service first.</p>
                </div>
              ) : (
                <div className="animate-fade-up">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <span className="text-sm font-bold text-white">{monthsList[currentMonth]} {currentYear}</span>
                    <div className="flex gap-2">
                      <button onClick={handlePrevMonth} className="p-1 rounded bg-white/5 border border-white/10 text-gray-400 hover:text-white cursor-pointer">&larr;</button>
                      <button onClick={handleNextMonth} className="p-1 rounded bg-white/5 border border-white/10 text-gray-400 hover:text-white cursor-pointer">&rarr;</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-4 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-gray-500 font-medium text-xs py-1">{day}</div>
                    ))}
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                      <div key={`empty-${i}`} className="py-2"></div>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const daySlots = serviceAvailability[day];
                      const isAvailable = daySlots && Array.isArray(daySlots) && daySlots.length > 0;
                      const isSelected = selectedDate === day;
                      return (
                        <div 
                          key={day} 
                          onClick={() => handleDateClick(day, isAvailable)}
                          className={`py-2 rounded text-sm font-medium transition-colors ${
                            isSelected ? 'bg-[#FFBF00] text-black font-bold shadow-[0_0_10px_rgba(255,191,0,0.4)] cursor-pointer' : 
                            isAvailable ? 'text-white hover:bg-white/10 cursor-pointer' : 
                            'text-gray-700 opacity-30 line-through cursor-not-allowed'
                          }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>

                  {selectedDate && (
                    <div className="mb-6 animate-fade-up">
                      <h4 className="text-sm font-bold text-gray-400 mb-3 border-t border-white/10 pt-4">Available Times</h4>
                      {activeSlots.length === 0 ? (
                        <p className="text-gray-500 text-xs italic">No time slots available for this date.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {activeSlots.map((time) => (
                            <div 
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`text-center py-2 border rounded text-xs font-bold cursor-pointer transition-colors ${
                                selectedTime === time ? 'bg-[#FFBF00] border-[#FFBF00] text-black' : 'border-white/10 text-gray-300 hover:border-[#FFBF00]/50'
                              }`}
                            >
                              {time}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button 
                    onClick={handleConfirmClick}
                    disabled={!selectedDate || !selectedTime}
                    className={`w-full text-sm font-bold py-3 rounded transition-all ${
                      selectedDate && selectedTime
                        ? 'cursor-pointer bg-[#FFBF00] text-black hover:bg-white shadow-[0_0_15px_rgba(255,191,0,0.2)]' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {(selectedDate && selectedTime) ? 'Confirm Details' : 'Select Date & Time'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center px-4 animate-fade-up">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => !isSubmitted && setShowForm(false)}></div>
          <div className="relative bg-[#121212] border border-white/10 rounded-xl w-full max-w-lg p-8 shadow-2xl z-10">
            {!isSubmitted && (
              <button onClick={() => setShowForm(false)} className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}

            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Booking Requested!</h3>
                <p className="text-gray-400 text-sm mb-8">Thank you, {formData.name || user?.email?.split('@')[0] || "Guest"}. Your session request has been submitted. You will be notified once the admin approves your time slot.</p>
                <button onClick={resetBooking} className="cursor-pointer bg-[#FFBF00] text-black font-bold py-2.5 px-6 rounded hover:bg-white transition-all">
                  Close & Return
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Almost there!</h3>
                <p className="text-gray-400 text-sm mb-6 pb-6 border-b border-white/10">
                  You are booking <span className="text-[#FFBF00] font-bold">{activeService?.title || "Session"}</span> for {monthsList[currentMonth]} {selectedDate}, {currentYear} at {selectedTime}.
                </p>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Full Name</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-[#FFBF00] transition-colors" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Email Address</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-[#FFBF00] transition-colors" placeholder="jane@example.com" />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Session Goals</label>
                    <textarea rows="3" required value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-[#FFBF00] transition-colors resize-none" placeholder="What would you like to focus on?"></textarea>
                  </div>
                  <button type="submit" className="cursor-pointer w-full bg-[#FFBF00] text-black font-bold py-3 rounded hover:bg-white transition-all mt-4">
                    Submit Request
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Shop = ({ addToCart, user, showToast }) => {
  const navigate = useNavigate();
  const [dbProducts, setDbProducts] = useState([]);
  const [allReviews, setAllReviews] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [previewItem, setPreviewItem] = useState(null);
  const [addedItems, setAddedItems] = useState({});

  useEffect(() => {
    // Fetch Products
    onValue(ref(db, 'products'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDbProducts(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setDbProducts([]);
      }
      setIsLoading(false);
    });

    // Fetch Reviews
    onValue(ref(db, 'reviews'), (snapshot) => {
      setAllReviews(snapshot.val() || {});
    });
  }, []);

  const getProductRating = (productId) => {
    const productReviews = allReviews[productId];
    if (!productReviews) return { avg: 0, count: 0, list: [] };
    
    const list = Object.keys(productReviews).map(key => ({ id: key, ...productReviews[key] })).reverse();
    const sum = list.reduce((acc, curr) => acc + curr.rating, 0);
    return { avg: sum / list.length, count: list.length, list };
  };

  const handleAddToCart = (product) => {
    if (!user) {
      showToast("Please log in to add items to your cart.", "error");
      navigate('/login?redirect=/shop');
      return;
    }
    addToCart(product);
    setAddedItems(prev => ({ ...prev, [product.id]: true }));
    showToast(`${product.title} added to cart!`, "success");
    setTimeout(() => setAddedItems(prev => ({ ...prev, [product.id]: false })), 2000);
  };

  const displayProducts = dbProducts.length > 0 ? dbProducts : defaultProducts;

  return (
    <>
      <div className="w-full py-12 px-6 flex justify-center animate-fade-up">
        <div className="max-w-6xl mx-auto w-full relative mt-4">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Digital Collection</h2>
            <p className="text-gray-400 text-base">Premium books, guides, and courses curated for your growth.</p>
          </div>
          
          {isLoading ? (
             <div className="flex justify-center items-center h-64">
               <div className="w-8 h-8 border-4 border-[#FFBF00]/30 border-t-[#FFBF00] rounded-full animate-spin"></div>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayProducts.map((product) => {
                const ratingInfo = getProductRating(product.id);
                return (
                  <div key={product.id} className="group flex flex-col bg-[#121212] rounded-lg border border-white/5 hover:border-[#FFBF00]/30 transition-all duration-300 shadow-md hover:-translate-y-1">
                    <div className="p-3 pb-0">
                      <div className="relative h-48 w-full rounded-md overflow-hidden bg-black cursor-pointer shrink-0" onClick={() => setPreviewItem(product)}>
                        <img src={product.image} alt={product.title} className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
                        <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded border border-white/10 pointer-events-none">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">{product.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col p-4">
                      <h3 className="text-base font-bold text-white mb-1">{product.title}</h3>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <StarRating rating={Math.round(ratingInfo.avg)} size="w-3 h-3" />
                        <span className="text-[10px] text-gray-500">({ratingInfo.count})</span>
                      </div>

                      <span className="text-lg font-bold text-[#FFBF00] mb-4">${(parseFloat(product.price) || 0).toFixed(2)}</span>
                      <div className="mt-auto grid grid-cols-2 gap-2">
                        <button onClick={() => setPreviewItem(product)} className="cursor-pointer text-sm font-medium text-white border border-white/20 py-2 rounded hover:bg-white hover:text-black transition-colors">
                          Preview
                        </button>
                        <button onClick={() => handleAddToCart(product)} className={`cursor-pointer text-sm font-medium py-2 rounded transition-colors ${addedItems[product.id] ? 'bg-green-500 text-white' : 'bg-[#FFBF00] text-black hover:bg-yellow-400'}`}>
                          {addedItems[product.id] ? 'Added!' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {previewItem && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center px-4 animate-fade-up">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer" onClick={() => setPreviewItem(null)}></div>
          <div className="relative bg-[#121212] border border-white/10 rounded-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 max-h-[90vh]">
            
            <button onClick={() => setPreviewItem(null)} className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-white z-30 bg-white/5 rounded-full p-2 transition-colors border border-white/10 hover:bg-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            {/* Left side: Product Info */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col border-r border-white/5 overflow-y-auto">
               <div className="w-full max-w-[240px] mx-auto aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border border-white/10 mb-6 shrink-0">
                  <img src={previewItem.image} alt={previewItem.title} className="w-full h-full object-cover"/>
               </div>
               <span className="text-sm font-bold text-[#FFBF00] mb-2 tracking-widest uppercase">{previewItem.type}</span>
               <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{previewItem.title}</h3>
               <p className="text-gray-300 text-sm md:text-base mb-8 leading-relaxed">{previewItem.desc}</p>
               
               <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
                  <span className="text-3xl font-bold text-white">${(parseFloat(previewItem.price) || 0).toFixed(2)}</span>
                  <button onClick={() => { handleAddToCart(previewItem); setPreviewItem(null); }} className="cursor-pointer bg-[#FFBF00] text-black font-bold py-3 px-8 rounded hover:bg-white transition-all shadow-[0_0_15px_rgba(255,191,0,0.2)]">
                    Add to Cart
                  </button>
               </div>
            </div>

            {/* Right side: Reviews */}
            <div className="w-full md:w-1/2 p-6 md:p-8 bg-black/40 overflow-y-auto">
               <h4 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-3 flex items-center justify-between">
                 Customer Reviews
                 <span className="text-sm font-normal text-gray-400">
                    {getProductRating(previewItem.id).count} Reviews
                 </span>
               </h4>
               
               {getProductRating(previewItem.id).list.length === 0 ? (
                 <div className="text-center py-10 opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    <p className="text-gray-400 text-sm">No reviews yet. Be the first to review after purchasing!</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {getProductRating(previewItem.id).list.map((review) => (
                     <div key={review.id} className="bg-[#1a1a1a] p-4 rounded-lg border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                             <span className="text-white font-bold text-sm block">{review.name}</span>
                             <span className="text-[10px] text-gray-500">{review.date}</span>
                           </div>
                           <StarRating rating={review.rating} size="w-3 h-3" />
                        </div>
                        <p className="text-gray-300 text-sm mt-2">{review.text}</p>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Cart = ({ cartItems, removeFromCart, user, showToast, clearCart }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  const handleCheckout = async () => {
    if (!user) {
      showToast("Log in to proceed to checkout.", "error");
      navigate('/login?redirect=/cart');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: total,
          description: `Cart Order (${cartItems.length} items)`
        })
      });

      if (!response.ok) {
        throw new Error('Payment failed or running locally without backend.');
      }
      
      const rawText = await response.text();
      const data = JSON.parse(rawText);

      const newTransaction = {
        user: user?.email || "Guest",
        type: "Purchase",
        item: `Cart Order (${cartItems.length} items)`,
        items: cartItems,
        amount: total,
        date: new Date().toLocaleDateString(),
        status: "Pending",
        checkoutUrl: data.checkoutUrl,
        timestamp: Date.now()
      };

      await push(ref(db, 'transactions'), newTransaction);
      window.location.href = data.checkoutUrl;

    } catch (error) {
      const fallbackTransaction = {
        user: user?.email || "Guest",
        type: "Purchase",
        item: `Cart Order (${cartItems.length} items)`,
        items: cartItems,
        amount: total,
        date: new Date().toLocaleDateString(),
        status: "Completed",
        timestamp: Date.now()
      };
      await push(ref(db, 'transactions'), fallbackTransaction);
      clearCart();
      showToast("Test payment successful (Backend offline).", "success");
      navigate('/dashboard');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full py-12 px-6 flex justify-center animate-fade-up">
      <div className="max-w-6xl mx-auto w-full mt-4">
        <h2 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">Your Shopping Cart</h2>
        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-[#121212] rounded-lg border border-white/5">
            <p className="text-gray-400 text-lg mb-4">Your cart is currently empty.</p>
            <Link to="/shop" className="cursor-pointer text-[#FFBF00] hover:text-white font-medium">Continue Shopping &rarr;</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex items-center gap-4 bg-[#121212] p-4 rounded-lg border border-white/5">
                  <div className="relative w-20 h-20 overflow-hidden rounded shrink-0">
                    <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-lg">{item.title}</h4>
                    <p className="text-gray-400 text-sm">{item.type}</p>
                  </div>
                  <div className="text-xl font-bold text-[#FFBF00]">${(parseFloat(item.price) || 0).toFixed(2)}</div>
                  <button onClick={() => removeFromCart(index)} className="cursor-pointer text-gray-500 hover:text-red-500 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="w-full lg:w-80 bg-[#121212] p-6 rounded-lg border border-white/10 h-fit">
              <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
              <div className="flex justify-between text-gray-300 mb-3 text-base">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300 mb-6 pb-6 border-b border-white/10 text-base">
                <span>Taxes</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-white font-bold text-2xl mb-8">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button onClick={handleCheckout} disabled={isProcessing} className="cursor-pointer w-full bg-[#FFBF00] text-black font-bold text-lg py-3 rounded hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isProcessing && <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>}
                {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const UserDashboard = ({ user, showToast }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('downloads'); // downloads, bookings, settings
  
  const [myBookings, setMyBookings] = useState([]);
  const [myTransactions, setMyTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Settings State
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Review State
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const bookingsRef = ref(db, 'bookings');
    const trxRef = ref(db, 'transactions');

    const unsubB = onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));
        setMyBookings(list.filter(b => b.email === user.email).reverse());
      } else {
        setMyBookings([]);
      }
    });

    const unsubT = onValue(trxRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));
        const userTrxs = list.filter(t => t.user === user.email);
        setMyTransactions(userTrxs.reverse());
      } else {
        setMyTransactions([]);
      }
      setIsLoading(false);
    });

    return () => {
      unsubB();
      unsubT();
    };
  }, [user, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      if (displayName && displayName !== auth.currentUser?.displayName) {
        await updateProfile(auth.currentUser, { displayName });
        showToast("Profile name updated!", "success");
      }
      if (newPassword) {
        if (newPassword !== retypePassword) {
          showToast("Passwords do not match.", "error");
          setIsUpdating(false);
          return;
        }
        await updatePassword(auth.currentUser, newPassword);
        showToast("Password updated successfully!", "success");
        setNewPassword('');
        setRetypePassword('');
      }
    } catch (error) {
      if(error.code === 'auth/requires-recent-login') {
        showToast("Please log out and log back in to change your password.", "error");
      } else {
        showToast(error.message, "error");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewingItem) return;

    try {
      await push(ref(db, `reviews/${reviewingItem.id}`), {
        userId: auth.currentUser.uid,
        name: auth.currentUser.displayName || user?.email?.split('@')[0] || "Guest",
        rating: reviewRating,
        text: reviewText,
        date: new Date().toLocaleDateString()
      });
      showToast("Review submitted successfully!", "success");
      setReviewingItem(null);
      setReviewRating(5);
      setReviewText('');
    } catch (error) {
      showToast("Failed to submit review.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-[#FFBF00]/30 border-t-[#FFBF00] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full py-12 px-6 flex justify-center animate-fade-up">
      <div className="max-w-4xl mx-auto w-full mt-4">
        
        <div className="mb-8">
          {/* Fallback added in case user hasn't fully loaded the object during transition */}
          <h2 className="text-3xl font-bold text-white mb-2">Welcome, {auth.currentUser?.displayName || user?.email?.split('@')[0] || "User"}</h2>
          <p className="text-gray-400 text-base">Manage your active bookings, downloads, and account settings.</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex overflow-x-auto border-b border-white/10 mb-8 gap-8">
          <button 
            onClick={() => setActiveTab('downloads')}
            className={`pb-3 text-sm font-bold tracking-widest uppercase transition-colors whitespace-nowrap ${activeTab === 'downloads' ? 'text-[#FFBF00] border-b-2 border-[#FFBF00]' : 'text-gray-500 hover:text-white'}`}
          >
            Digital Downloads
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 text-sm font-bold tracking-widest uppercase transition-colors whitespace-nowrap ${activeTab === 'bookings' ? 'text-[#FFBF00] border-b-2 border-[#FFBF00]' : 'text-gray-500 hover:text-white'}`}
          >
            My Bookings
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-sm font-bold tracking-widest uppercase transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'text-[#FFBF00] border-b-2 border-[#FFBF00]' : 'text-gray-500 hover:text-white'}`}
          >
            Account Settings
          </button>
        </div>

        {/* Tab Content: Downloads */}
        {activeTab === 'downloads' && (
          <div className="animate-fade-up">
            {myTransactions.filter(t => t.status === 'Completed' && t.items && t.items.length > 0).length === 0 ? (
              <div className="bg-[#121212] border border-white/5 rounded-xl p-10 text-center">
                <p className="text-gray-400">No completed purchases yet.</p>
                <Link to="/shop" className="text-[#FFBF00] font-bold text-sm hover:underline mt-2 inline-block">Browse Digital Shop</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myTransactions.filter(t => t.status === 'Completed' && t.items).map(trx => (
                  <div key={trx.id} className="bg-[#121212] border border-white/5 rounded-xl p-6">
                    <p className="text-xs text-gray-500 font-mono mb-4 border-b border-white/5 pb-2 flex justify-between">
                      <span>Order {trx.id}</span>
                      <span>{trx.date}</span>
                    </p>
                    <div className="space-y-6">
                      {trx.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <img src={item.image} alt={item.title} className="w-20 h-20 rounded object-cover border border-white/10" />
                          <div className="flex-1">
                            <h4 className="text-white font-bold text-base">{item.title}</h4>
                            <p className="text-gray-400 text-xs mb-3">{item.type}</p>
                            
                            <div className="flex gap-4">
                              {item.documentUrl ? (
                                <a href={item.documentUrl} download={item.title} className="text-xs bg-[#FFBF00]/10 text-[#FFBF00] font-bold px-3 py-1.5 rounded hover:bg-[#FFBF00] hover:text-black transition-colors flex items-center gap-1" target="_blank" rel="noreferrer">
                                  Download File
                                </a>
                              ) : (
                                <span className="text-xs bg-green-500/10 text-green-500 font-bold px-3 py-1.5 rounded flex items-center gap-1">
                                  Access Granted
                                </span>
                              )}
                              
                              <button onClick={() => setReviewingItem(item)} className="cursor-pointer text-xs border border-white/20 text-white font-bold px-3 py-1.5 rounded hover:bg-white hover:text-black transition-colors">
                                Write a Review
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Bookings */}
        {activeTab === 'bookings' && (
          <div className="animate-fade-up">
            {myBookings.length === 0 ? (
              <div className="bg-[#121212] border border-white/5 rounded-xl p-10 text-center">
                <p className="text-gray-400">You haven't booked any sessions yet.</p>
                <Link to="/booking" className="text-[#FFBF00] font-bold text-sm hover:underline mt-2 inline-block">Book a Session</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map(b => (
                  <div key={b.id} className="bg-[#121212] border border-white/5 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-bold text-lg">{b.service}</h4>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${b.status === 'Confirmed' ? 'bg-green-500/20 text-green-500' : b.status === 'Declined' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {b.date} at {b.time}
                    </div>
                    {b.status === 'Confirmed' && (
                      <div className="bg-[#1a1a1a] p-3 rounded border border-white/5 text-sm text-gray-300">
                        Check your email for the Zoom meeting invitation!
                      </div>
                    )}
                    {b.status === 'Declined' && (
                      <div className="bg-[#1a1a1a] p-3 rounded border border-red-500/30 text-sm text-gray-400">
                        This slot was unavailable. Please book a different time.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Settings */}
        {activeTab === 'settings' && (
          <div className="animate-fade-up">
            <div className="bg-[#121212] border border-white/5 rounded-xl p-8 max-w-lg">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Display Name</label>
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-[#FFBF00]" placeholder="Your Name" />
                </div>
                
                <div className="border-t border-white/5 pt-6">
                  <label className="block text-white text-sm font-medium mb-3">Change Password</label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-[#FFBF00]" placeholder="New Password" />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer p-1">
                        <EyeIcon show={showNewPassword} />
                      </button>
                    </div>
                    <div className="relative">
                      <input type={showRetypePassword ? "text" : "password"} value={retypePassword} onChange={e => setRetypePassword(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-[#FFBF00]" placeholder="Retype New Password" />
                      <button type="button" onClick={() => setShowRetypePassword(!showRetypePassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer p-1">
                        <EyeIcon show={showRetypePassword} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">Note: Changing password may require you to log in again.</p>
                </div>

                <button type="submit" disabled={isUpdating} className="cursor-pointer w-full bg-[#FFBF00] text-black font-bold py-3 rounded hover:bg-white transition-all disabled:opacity-50">
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewingItem && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center px-4 animate-fade-up">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => setReviewingItem(null)}></div>
          <div className="relative bg-[#121212] border border-white/10 rounded-xl w-full max-w-md p-8 shadow-2xl z-10">
            <button onClick={() => setReviewingItem(null)} className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <h3 className="text-xl font-bold text-white mb-2">Leave a Review</h3>
            <p className="text-sm text-gray-400 mb-6 border-b border-white/10 pb-4">Rate your experience with <span className="text-white font-bold">{reviewingItem.title}</span>.</p>
            
            <form onSubmit={handleSubmitReview}>
              <div className="mb-6 flex justify-center">
                <StarRating rating={reviewRating} setRating={setReviewRating} size="w-8 h-8" />
              </div>
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">Your Review</label>
                <textarea rows="4" required value={reviewText} onChange={e => setReviewText(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-[#FFBF00] resize-none" placeholder="What did you think?"></textarea>
              </div>
              <button type="submit" className="cursor-pointer w-full bg-[#FFBF00] text-black font-bold py-3 rounded hover:bg-white transition-all mt-2">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Login = ({ setUser, showToast }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          const params = new URLSearchParams(location.search);
          showToast("Account created successfully!", "success");
          navigate(params.get('redirect') || '/dashboard');
        })
        .catch((error) => showToast(error.message, "error"));
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          showToast("Logged in successfully!", "success");
          const params = new URLSearchParams(location.search);
          if (userCredential.user.uid === ADMIN_UID) {
            navigate('/admin');
          } else {
            navigate(params.get('redirect') || '/dashboard');
          }
        })
        .catch(() => {
           showToast("Invalid email or password. Please try again.", "error");
        });
    }
  };

  return (
    <div className="w-full flex-1 flex justify-center items-center px-6 py-20 animate-fade-up relative">
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#FFBF00] opacity-5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="bg-[#121212] border border-white/10 p-10 rounded-2xl w-full max-w-md shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-gray-400 text-sm">
            {isRegistering ? 'Sign up to secure your bookings and purchases.' : 'Enter your credentials to access your account.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-white text-sm font-medium mb-1">Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-[#FFBF00] transition-colors" placeholder="jane@example.com" />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-[#FFBF00] transition-colors" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer p-1">
                <EyeIcon show={showPassword} />
              </button>
            </div>
          </div>
          
          <button type="submit" className="w-full cursor-pointer bg-[#FFBF00] text-black font-bold py-3.5 rounded hover:bg-white transition-all mt-2">
            {isRegistering ? 'Register' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <p className="text-gray-400 text-sm">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-[#FFBF00] font-bold ml-2 hover:text-white transition-colors cursor-pointer">
              {isRegistering ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const Admin = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [activeSubTab, setActiveSubTab] = useState('booking_transactions');
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); 

  const [adminSelectedService, setAdminSelectedService] = useState(services[0].id);
  const [adminSelectedDate, setAdminSelectedDate] = useState(null);
  const [adminSlots, setAdminSlots] = useState([]);
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: '', price: '', type: 'eBook', desc: '', imageFile: null, docFile: null });

  const [dbData, setDbData] = useState({ bookings: [], transactions: [], products: [] });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Added fallback `setIsLive(true)` in the error block so the component never gets stuck on a white screen spinner
    const unsubscribeBookings = onValue(ref(db, 'bookings'), (snapshot) => {
      const data = snapshot.val();
      setDbData(prev => ({ ...prev, bookings: data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [] }));
      setIsLive(true);
    }, (error) => {
      console.error("Firebase Bookings Error:", error);
      setIsLive(true);
    });

    const unsubscribeTrx = onValue(ref(db, 'transactions'), (snapshot) => {
      const data = snapshot.val();
      setDbData(prev => ({ ...prev, transactions: data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [] }));
    }, (error) => console.error("Firebase Transactions Error:", error));

    const unsubscribeProd = onValue(ref(db, 'products'), (snapshot) => {
      const data = snapshot.val();
      setDbData(prev => ({ ...prev, products: data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [] }));
    }, (error) => console.error("Firebase Products Error:", error));

    return () => {
      unsubscribeBookings();
      unsubscribeTrx();
      unsubscribeProd();
    };
  }, []);

  useEffect(() => {
    if (adminSelectedDate && adminSelectedService) {
      const slotsRef = ref(db, `availability/${adminSelectedService}/${currentYear}/${currentMonth}/${adminSelectedDate}`);
      onValue(slotsRef, (snapshot) => {
        const val = snapshot.val();
        setAdminSlots(val && Array.isArray(val) ? val : []);
      }, (error) => console.error(error));
    }
  }, [adminSelectedDate, adminSelectedService, currentMonth, currentYear]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setAdminSelectedDate(null);
    setAdminSlots([]);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setAdminSelectedDate(null);
    setAdminSlots([]);
  };

  const handleAdminDateClick = (day) => {
    setAdminSelectedDate(day);
  };

  const handleToggleTimeSlot = (time) => {
    if (adminSlots.includes(time)) {
      setAdminSlots(adminSlots.filter(t => t !== time));
    } else {
      setAdminSlots([...adminSlots, time].sort());
    }
  };

  const handleSaveSchedule = () => {
    const slotsRef = ref(db, `availability/${adminSelectedService}/${currentYear}/${currentMonth}/${adminSelectedDate}`);
    set(slotsRef, adminSlots).then(() => {
      showToast(`Schedule saved for ${services.find(s=>s.id === adminSelectedService)?.title}`, "success");
    }).catch(err => {
      showToast(err.message, "error");
    });
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let imageUrl = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop";
      let documentUrl = "";

      if (newProduct.imageFile) {
        if (newProduct.imageFile.size > 2000000) throw new Error("Image exceeds 2MB limit for Realtime Database Base64 conversion.");
        imageUrl = await toBase64(newProduct.imageFile);
      }

      if (newProduct.docFile) {
        if (newProduct.docFile.size > 5000000) throw new Error("Document exceeds 5MB limit for Realtime Database Base64 conversion.");
        documentUrl = await toBase64(newProduct.docFile);
      }

      const prodRef = ref(db, 'products');
      const productPayload = {
        title: newProduct.title,
        price: parseFloat(newProduct.price) || 0,
        type: newProduct.type,
        desc: newProduct.desc,
        image: imageUrl,
        documentUrl: documentUrl
      };
      
      await push(prodRef, productPayload);
      
      showToast("Product uploaded successfully to Database!", "success");
      setShowProductModal(false);
      setNewProduct({ title: '', price: '', type: 'eBook', desc: '', imageFile: null, docFile: null });
    } catch (error) {
      showToast(error.message || "Error uploading product.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSeedProducts = () => {
    defaultProducts.forEach(product => {
      push(ref(db, 'products'), {
        title: product.title,
        price: product.price || 0,
        type: product.type,
        desc: product.desc,
        image: product.image
      });
    });
    showToast("Demo products seeded!", "success");
  };

  const handleApproveBooking = (bookingId) => {
    set(ref(db, `bookings/${bookingId}/status`), "Confirmed").then(() => {
      setSelectedBooking(null);
      showToast("Booking Approved!", "success");
    }).catch(err => showToast(err.message, "error"));
  };

  const handleDeclineBooking = (bookingId) => {
    set(ref(db, `bookings/${bookingId}/status`), "Declined").then(() => {
      setSelectedBooking(null);
      showToast("Booking Declined.", "success");
    }).catch(err => showToast(err.message, "error"));
  };

  const displayBookings = dbData?.bookings?.length > 0 ? dbData.bookings : mockBookings;
  const displayTransactions = dbData?.transactions?.length > 0 ? dbData.transactions : mockTransactions;
  const displayProducts = dbData?.products?.length > 0 ? dbData.products : defaultProducts;

  return (
    <div className="w-full flex-1 flex flex-col md:flex-row animate-fade-up border-t border-white/5">
      <div className="w-full md:w-64 bg-[#0a0a0a] border-r border-white/5 p-6 flex flex-col gap-2 shrink-0">
        
        <div className="flex items-center justify-between mb-4 pl-3">
          <h3 className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">Admin Panel</h3>
          <div className="flex items-center gap-1.5" title="Database Connection Status">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-[9px] text-gray-500 font-mono uppercase">{isLive ? 'Live Sync' : 'Connecting'}</span>
          </div>
        </div>
        
        <button onClick={() => setActiveTab('bookings')} className={`cursor-pointer w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bookings' ? 'bg-[#FFBF00]/10 text-[#FFBF00]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
          Incoming Bookings
        </button>
        <button onClick={() => {setActiveTab('availability'); setAdminSelectedDate(null);}} className={`cursor-pointer w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'availability' ? 'bg-[#FFBF00]/10 text-[#FFBF00]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
          Manage Availability
        </button>
        <button onClick={() => setActiveTab('shop')} className={`cursor-pointer w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'shop' ? 'bg-[#FFBF00]/10 text-[#FFBF00]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
          Shop Inventory
        </button>

        <div className="mt-4 mb-2 border-t border-white/5 pt-4">
          <h3 className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2 pl-3">Payments</h3>
          <button onClick={() => { setActiveTab('payments'); setActiveSubTab('booking_transactions'); }} className={`cursor-pointer w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'payments' && activeSubTab === 'booking_transactions' ? 'bg-[#FFBF00]/10 text-[#FFBF00]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            Booking Transactions
          </button>
          <button onClick={() => { setActiveTab('payments'); setActiveSubTab('purchase_transactions'); }} className={`cursor-pointer w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'payments' && activeSubTab === 'purchase_transactions' ? 'bg-[#FFBF00]/10 text-[#FFBF00]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            Purchase Transactions
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-white/5">
          <Link to="/" className="cursor-pointer w-full flex items-center justify-between text-gray-500 text-sm hover:text-white transition-colors px-2">
            Return to Site
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </Link>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-12 bg-[#050505]">
        {!isLive ? (
          <div className="flex h-[50vh] items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#FFBF00]/30 border-t-[#FFBF00] rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === 'bookings' && (
              <div className="animate-fade-up max-w-4xl">
                <h2 className="text-2xl font-bold text-white mb-6">Recent Bookings</h2>
                <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
                  {displayBookings.map((b, idx) => (
                    <div key={b.id || idx} className={`p-6 flex justify-between items-center ${idx !== displayBookings.length - 1 ? 'border-b border-white/5' : ''}`}>
                      <div>
                        <h4 className="text-white font-bold">
                          {b.name || 'Unknown User'}
                          {typeof b.id === 'string' && String(b.id).includes('mock') && <span className="ml-2 bg-gray-800 text-gray-400 text-[10px] px-2 py-0.5 rounded border border-gray-700">DEMO</span>}
                        </h4>
                        <p className="text-gray-400 text-sm">{b.service || 'Service'}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                          <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${b.status === 'Confirmed' ? 'bg-green-500/20 text-green-500' : b.status === 'Declined' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{b.status || 'Pending'}</span>
                          <p className="text-white text-sm mt-1">{b.date} at {b.time}</p>
                        </div>
                        <button onClick={() => setSelectedBooking(b)} className="cursor-pointer bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2 px-4 rounded border border-white/10 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedBooking && (
              <div className="fixed inset-0 z-[100] flex justify-center items-center px-4 animate-fade-up">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedBooking(null)}></div>
                <div className="relative bg-[#121212] border border-white/10 rounded-xl w-full max-w-lg p-8 shadow-2xl z-10">
                  <button onClick={() => setSelectedBooking(null)} className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Booking Details</h3>
                  <div className="space-y-4 mb-8">
                    <div>
                      <span className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Student Name</span>
                      <span className="text-white">{selectedBooking.name}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Contact Email</span>
                      <span className="text-[#FFBF00]">{selectedBooking.email}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Service</span>
                        <span className="text-white text-sm">{selectedBooking.service}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Schedule</span>
                        <span className="text-white text-sm">{selectedBooking.date} • {selectedBooking.time}</span>
                      </div>
                    </div>
                    <div className="bg-[#1a1a1a] p-4 rounded border border-white/5">
                      <span className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Student Notes / Goals</span>
                      <p className="text-gray-300 text-sm leading-relaxed">{selectedBooking.notes || 'No notes provided.'}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    {selectedBooking.status === 'Pending' && !String(selectedBooking.id).includes('mock') && (
                      <>
                        <button onClick={() => handleDeclineBooking(selectedBooking.id)} className="flex-1 cursor-pointer bg-red-500/20 text-red-500 border border-red-500/30 font-bold py-2.5 rounded hover:bg-red-500 hover:text-white transition-all">
                          Decline
                        </button>
                        <button onClick={() => handleApproveBooking(selectedBooking.id)} className="flex-1 cursor-pointer bg-green-500/20 text-green-500 border border-green-500/30 font-bold py-2.5 rounded hover:bg-green-500 hover:text-white transition-all">
                          Approve
                        </button>
                      </>
                    )}
                    {selectedBooking.status !== 'Pending' && (
                      <button onClick={() => setSelectedBooking(null)} className="w-full cursor-pointer bg-white/5 text-white font-bold py-2.5 rounded border border-white/10 hover:bg-white/10 transition-all">
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="animate-fade-up max-w-4xl grid md:grid-cols-[300px_1fr] gap-12 items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Target Service</h2>
                  <p className="text-gray-400 text-sm mb-4">Select which service to modify availability for.</p>
                  
                  <select 
                    value={adminSelectedService} 
                    onChange={(e) => {setAdminSelectedService(Number(e.target.value)); setAdminSelectedDate(null);}} 
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFBF00] mb-8"
                  >
                    {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>

                  <h2 className="text-lg font-bold text-white mb-2">Select Date</h2>
                  <div className="bg-[#121212] rounded-lg border border-white/10 p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <span className="text-xs font-bold text-white">{monthsList[currentMonth]} {currentYear}</span>
                      <div className="flex gap-2">
                        <button onClick={handlePrevMonth} className="p-1 text-xs rounded bg-white/5 border border-white/10 text-gray-400 hover:text-white cursor-pointer">&larr;</button>
                        <button onClick={handleNextMonth} className="p-1 text-xs rounded bg-white/5 border border-white/10 text-gray-400 hover:text-white cursor-pointer">&rarr;</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-gray-500 font-medium text-[10px] py-1">{day}</div>
                      ))}
                      {Array.from({ length: firstDayIndex }).map((_, i) => (
                        <div key={`empty-${i}`} className="py-2"></div>
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isSelected = adminSelectedDate === day;
                        return (
                          <div 
                            key={day} 
                            onClick={() => handleAdminDateClick(day)}
                            className={`text-center py-2 rounded text-sm font-medium transition-colors cursor-pointer ${
                              isSelected ? 'bg-[#FFBF00] text-black font-bold shadow-[0_0_10px_rgba(255,191,0,0.4)]' : 'text-white hover:bg-white/10'
                            }`}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {adminSelectedDate ? (
                  <div className="animate-fade-up">
                    <h2 className="text-2xl font-bold text-white mb-2">Manage Time Slots</h2>
                    <p className="text-gray-400 text-sm mb-6">Toggle available times for {monthsList[currentMonth]} {adminSelectedDate}, {currentYear}.</p>
                    <div className="bg-[#121212] border border-white/5 rounded-xl p-6">
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {standardTimeSlots.map(time => (
                          <div 
                            key={time} 
                            onClick={() => handleToggleTimeSlot(time)}
                            className={`cursor-pointer flex items-center justify-between p-3 border rounded transition-colors ${adminSlots.includes(time) ? 'border-[#FFBF00] bg-[#FFBF00]/5 text-white' : 'border-white/10 text-gray-500 hover:border-white/30'}`}
                          >
                            <span className="text-sm font-medium">{time}</span>
                            {adminSlots.includes(time) && <div className="w-2 h-2 rounded-full bg-[#FFBF00]"></div>}
                          </div>
                        ))}
                      </div>
                      <button onClick={handleSaveSchedule} className="cursor-pointer bg-[#FFBF00] text-black font-bold py-2.5 px-8 rounded hover:bg-white transition-all mt-8 text-sm shadow-[0_0_15px_rgba(255,191,0,0.2)]">
                        Save Schedule Layout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] border border-dashed border-white/10 rounded-xl opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-gray-400 text-sm">Select a specific date on the real sync calendar context matrix.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shop' && (
              <div className="animate-fade-up max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Shop Inventory</h2>
                  <div className="flex gap-4">
                    {dbData?.products?.length === 0 && (
                      <button onClick={handleSeedProducts} className="cursor-pointer bg-[#1a1a1a] text-white text-sm font-bold py-2 px-4 rounded border border-white/10 hover:border-[#FFBF00] transition-colors">
                        Seed Demo Products
                      </button>
                    )}
                    <button onClick={() => setShowProductModal(true)} className="cursor-pointer bg-[#FFBF00] text-black text-sm font-bold py-2 px-4 rounded hover:bg-white transition-colors">
                      + Add Product
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {displayProducts.map(product => (
                    <div key={product.id} className="bg-[#121212] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={product.image} alt={product.title} className="w-12 h-12 rounded object-cover" />
                        <div>
                          <h4 className="text-white font-bold text-sm">
                            {product.title}
                            {typeof product.id === 'number' && <span className="ml-2 bg-gray-800 text-gray-400 text-[10px] px-2 py-0.5 rounded border border-gray-700">DEMO</span>}
                          </h4>
                          <p className="text-[#FFBF00] text-xs font-bold">${(parseFloat(product.price) || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {typeof product.id !== 'number' && (
                          <button onClick={() => {
                            remove(ref(db, `products/${product.id}`)).then(()=> showToast("Product node removed.", "success"));
                          }} className="cursor-pointer text-red-500 hover:bg-red-500 hover:text-white text-xs font-medium px-3 py-1.5 border border-red-500/30 rounded transition-colors">Delete</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showProductModal && (
              <div className="fixed inset-0 z-[100] flex justify-center items-center px-4 animate-fade-up">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => !isUploading && setShowProductModal(false)}></div>
                <div className="relative bg-[#121212] border border-white/10 rounded-xl w-full max-w-md p-8 shadow-2xl z-10">
                  {!isUploading && (
                    <button onClick={() => setShowProductModal(false)} className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Add New Product</h3>
                  <form onSubmit={handleAddProductSubmit} className="space-y-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-1">Product Title</label>
                      <input type="text" required value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} disabled={isUploading} className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-[#FFBF00] disabled:opacity-50" placeholder="e.g. Masterclass PDF" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-1">Price ($)</label>
                        <input type="number" step="0.01" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} disabled={isUploading} className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-[#FFBF00] disabled:opacity-50" placeholder="29.99" />
                      </div>
                      <div>
                        <label className="block text-white text-sm font-medium mb-1">Type</label>
                        <select value={newProduct.type} onChange={e => setNewProduct({...newProduct, type: e.target.value})} disabled={isUploading} className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-2.5 text-white focus:outline-none focus:border-[#FFBF00] disabled:opacity-50">
                          <option value="eBook">eBook</option>
                          <option value="Digital Guide">Digital Guide</option>
                          <option value="Physical Book">Physical Book</option>
                          <option value="Video Course">Video Course</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white text-sm font-medium mb-1">Cover Image</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        disabled={isUploading}
                        onChange={e => setNewProduct({...newProduct, imageFile: e.target.files[0]})} 
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-2 text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-[#FFBF00] file:text-black hover:file:bg-white transition-colors cursor-pointer disabled:opacity-50" 
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-1">Digital Resource (PDF/Doc)</label>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx" 
                        disabled={isUploading}
                        onChange={e => setNewProduct({...newProduct, docFile: e.target.files[0]})} 
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-2 text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-gray-700 file:text-white hover:file:bg-gray-600 transition-colors cursor-pointer disabled:opacity-50" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white text-sm font-medium mb-1">Description</label>
                      <textarea rows="3" required value={newProduct.desc} onChange={e => setNewProduct({...newProduct, desc: e.target.value})} disabled={isUploading} className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-[#FFBF00] resize-none disabled:opacity-50" placeholder="Provide a summary of the resource..."></textarea>
                    </div>
                    <button type="submit" disabled={isUploading} className="w-full cursor-pointer bg-[#FFBF00] text-black font-bold py-3 rounded hover:bg-white transition-all mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                      {isUploading && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>}
                      {isUploading ? 'Encoding to Base64...' : 'Upload Product'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="animate-fade-up max-w-4xl">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {activeSubTab === 'booking_transactions' ? 'Booking Transactions' : 'Purchase Transactions'}
                </h2>
                <p className="text-gray-400 text-sm mb-6">Overview of all successful and pending payments.</p>
                
                <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest">
                        <th className="p-4 font-bold">Transaction ID</th>
                        <th className="p-4 font-bold">Customer</th>
                        <th className="p-4 font-bold">Item</th>
                        <th className="p-4 font-bold">Date</th>
                        <th className="p-4 font-bold">Amount</th>
                        <th className="p-4 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-300">
                      {displayTransactions.filter(t => t?.type === (activeSubTab === 'booking_transactions' ? 'Booking' : 'Purchase')).map(trx => (
                        <tr key={trx.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono text-xs">{trx.id}</td>
                          <td className="p-4 text-white font-bold">{trx.user || 'Unknown'}</td>
                          <td className="p-4">{trx.item || 'Item'}</td>
                          <td className="p-4 text-gray-500">{trx.date}</td>
                          <td className="p-4 font-bold text-[#FFBF00]">${(parseFloat(trx.amount) || 0).toFixed(2)}</td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${trx.status === 'Completed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                              {trx.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Mobile Menu Logic in NavBar
const NavBar = ({ cartItems, user, setUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if(currentUser) {
        if(currentUser.uid === ADMIN_UID) {
          setUser({ uid: currentUser.uid, email: currentUser.email, role: 'admin' });
        } else {
          setUser({ uid: currentUser.uid, email: currentUser.email, role: 'customer' });
        }
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, [setUser]);

  const handleLogout = () => {
    signOut(auth).then(() => {
      setIsMobileMenuOpen(false);
      navigate('/');
    });
  };

  const NavLink = ({ to, children }) => (
    <Link 
      to={to} 
      onClick={() => setIsMobileMenuOpen(false)} // Auto-close menu on click
      className={`cursor-pointer relative pb-2 transition-colors duration-300 ${isActive(to) ? 'text-white' : 'text-gray-400 hover:text-white'}`}
    >
      {children}
      {isActive(to) && (
        <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-[#FFBF00] shadow-[0_0_10px_2px_rgba(255,191,0,0.6)] rounded-full"></span>
      )}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 flex justify-center px-6">
      <div className="max-w-6xl w-full flex justify-between items-center py-4">
        
        {/* Left Logo */}
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="cursor-pointer text-white font-extrabold text-2xl flex items-center gap-2 hover:opacity-80 transition-opacity z-50">
          <span className="w-2.5 h-2.5 bg-[#FFBF00] rounded-full inline-block shadow-[0_0_8px_rgba(255,191,0,0.8)]"></span>
          Client<span className="text-[#FFBF00]">Name</span>
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex gap-10 text-[11px] font-bold tracking-widest uppercase mt-1">
          <NavLink to="/">Profile</NavLink>
          <NavLink to="/booking">Services</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          {user && user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        </div>

        {/* Right Actions & Hamburger */}
        <div className="flex items-center gap-4 z-50">
          {/* Desktop Login/Logout */}
          <div className="hidden md:block">
            {!user ? (
              <Link to="/login" className="cursor-pointer text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Login
              </Link>
            ) : (
              <button onClick={handleLogout} className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                Logout
              </button>
            )}
          </div>

          {/* Cart Icon (Always Visible) */}
          <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="cursor-pointer group flex items-center gap-2 lg:gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full transition-all text-xs font-bold text-white relative">
            <span className="hidden sm:inline">CART</span>
            {isActive('/cart') && (
              <span className="absolute left-1/2 -translate-x-1/2 -bottom-[12px] w-3/4 h-[2px] bg-[#FFBF00] shadow-[0_0_10px_2px_rgba(255,191,0,0.6)] rounded-full hidden sm:block"></span>
            )}
            <span className={`w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center rounded-full text-[10px] transition-all ${cartItems.length > 0 ? 'bg-[#FFBF00] text-black shadow-[0_0_10px_rgba(255,191,0,0.5)] scale-110' : 'bg-gray-800 text-gray-400'}`}>
              {cartItems.length}
            </span>
          </Link>

          {/* Mobile Hamburger Icon */}
          <button 
            className="md:hidden text-white cursor-pointer ml-2 p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl z-40 transition-transform duration-300 flex flex-col pt-24 px-8 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
        <div className="flex flex-col gap-8 text-lg font-bold tracking-widest uppercase">
          <NavLink to="/">Profile</NavLink>
          <NavLink to="/booking">Services</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          {user && user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          
          <div className="w-full h-px bg-white/10 my-2"></div>
          
          {!user ? (
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-[#FFBF00] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Login
            </Link>
          ) : (
            <button onClick={handleLogout} className="text-left text-red-500 hover:text-red-400">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ message: null, type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
  };

  const removeFromCart = (indexToRemove) => {
    setCartItems(cartItems.filter((_, index) => index !== indexToRemove));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans selection:bg-[#FFBF00] selection:text-black flex flex-col overflow-x-hidden relative">
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: null, type: 'success' })} />
        <NavBar cartItems={cartItems} user={user} setUser={setUser} />

        <main className="flex-1 flex flex-col w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/booking" element={<Booking user={user} showToast={showToast} />} />
            <Route path="/shop" element={<Shop addToCart={addToCart} user={user} showToast={showToast} />} />
            <Route path="/cart" element={<Cart cartItems={cartItems} removeFromCart={removeFromCart} clearCart={clearCart} user={user} showToast={showToast} />} />
            <Route path="/login" element={<Login setUser={setUser} showToast={showToast} />} />
            <Route path="/admin" element={<Admin showToast={showToast} />} />
            <Route path="/dashboard" element={<UserDashboard user={user} showToast={showToast} />} />
          </Routes>
        </main>
        
        <footer className="w-full bg-[#121212] border-t border-white/5 py-8 flex justify-center px-6 mt-auto z-10 relative">
          <div className="max-w-6xl w-full text-center text-gray-500 text-[11px] uppercase tracking-widest font-bold flex flex-col items-center gap-2">
            <p>&copy; 2026 Client Name. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;