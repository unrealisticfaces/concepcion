import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, get, push, set, remove, update } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, updatePassword } from "firebase/auth";
import mcProfile from './assets/mcprofile.jpg';

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

const EyeIcon = ({ show }) => {
  return show ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
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
              <img 
                  src={mcProfile} 
                  alt="Client Profile" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-none">
                <h3 className="text-2xl font-bold text-white mb-1">Maricel C. Concepcion</h3>
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
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: auth.currentUser?.displayName || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  useEffect(() => {
    setDbServices(services);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (selectedService) {
      get(ref(db, `availability/${selectedService}/${currentYear}/${currentMonth}`)).then((snapshot) => {
        setServiceAvailability(snapshot.val() || {});
      }).catch((error) => console.error(error));
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
      status: "Pending", 
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
    setFormData({ name: user?.displayName || '', email: user?.email || '', notes: '' });
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
                    <div className="text-lg font-bold text-[#FFBF00]">₱{(service.price || 0).toFixed(2)}</div>
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
    Promise.all([
      get(ref(db, 'products')),
      get(ref(db, 'reviews'))
    ]).then(([prodSnap, revSnap]) => {
      const pData = prodSnap.val();
      if (pData) {
        setDbProducts(Object.keys(pData).map(key => ({ id: key, ...pData[key] })));
      }
      setAllReviews(revSnap.val() || {});
      setIsLoading(false);
    }).catch(error => {
      console.error(error);
      setIsLoading(false);
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

  const displayProducts = dbProducts;

  return (
    <>
      <div className="w-full py-12 px-6 flex justify-center animate-fade-up">
        <div className="max-w-6xl mx-auto w-full relative mt-4">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Digital Collection</h2>
            <p className="text-gray-400 text-base">Premium books, guides, and courses curated for your growth.</p>
          </div>
          
          {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
               {[1,2,3,4].map(i => <div key={i} className="w-full h-72 bg-[#121212] rounded-lg animate-pulse border border-white/5"></div>)}
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
                      
                      <div className="flex items-center gap-2 mb-2 mt-1">
                        <StarRating rating={Math.round(ratingInfo.avg)} size="w-4 h-4" />
                        <span className="text-xs text-gray-400 font-medium">({ratingInfo.count})</span>
                      </div>

                      <span className="text-lg font-bold text-[#FFBF00] mb-4">₱{(parseFloat(product.price) || 0).toFixed(2)}</span>
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
            
            <button onClick={() => setPreviewItem(null)} className="cursor-pointer absolute top-3 right-3 md:top-4 md:right-4 text-white z-[110] bg-black/70 hover:bg-black p-2.5 rounded-full backdrop-blur-sm transition-all border border-white/20 shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col border-r border-white/5 overflow-y-auto pt-16 md:pt-8">
               <div className="w-full max-w-[240px] mx-auto aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border border-white/10 mb-6 shrink-0">
                  <img src={previewItem.image} alt={previewItem.title} className="w-full h-full object-cover"/>
               </div>
               <span className="text-sm font-bold text-[#FFBF00] mb-2 tracking-widest uppercase">{previewItem.type}</span>
               <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{previewItem.title}</h3>
               <p className="text-gray-300 text-sm md:text-base mb-8 leading-relaxed">{previewItem.desc}</p>
               
               <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
                  <span className="text-3xl font-bold text-white">₱{(parseFloat(previewItem.price) || 0).toFixed(2)}</span>
                  <button onClick={() => { handleAddToCart(previewItem); setPreviewItem(null); }} className="cursor-pointer bg-[#FFBF00] text-black font-bold py-3 px-8 rounded hover:bg-white transition-all shadow-[0_0_15px_rgba(255,191,0,0.2)]">
                    Add to Cart
                  </button>
               </div>
            </div>

            <div className="w-full md:w-1/2 p-6 md:p-8 pt-16 md:pt-20 bg-black/40 overflow-y-auto">
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
      showToast("Test payment successful.", "success");
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
                  <div className="text-xl font-bold text-[#FFBF00]">₱{(parseFloat(item.price) || 0).toFixed(2)}</div>
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
                <span>₱{total.toFixed(2)}</span>
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
  const [activeTab, setActiveTab] = useState('downloads'); 
  
  const [myBookings, setMyBookings] = useState([]);
  const [myTransactions, setMyTransactions] = useState([]);
  const [myNotifications, setMyNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [displayName, setDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const [selectedNotification, setSelectedNotification] = useState(null);

  const loadData = async () => {
    try {
      const [bSnap, tSnap, nSnap] = await Promise.all([
        get(ref(db, 'bookings')),
        get(ref(db, 'transactions')),
        get(ref(db, 'notifications'))
      ]);

      const bData = bSnap.val();
      if (bData) {
        const list = Object.keys(bData).map(k => ({ id: k, ...bData[k] }));
        setMyBookings(list.filter(b => b.email === user.email).reverse());
      }

      const tData = tSnap.val();
      if (tData) {
        const list = Object.keys(tData).map(k => ({ id: k, ...tData[k] }));
        setMyTransactions(list.filter(t => t.user === user.email).reverse());
      }

      const nData = nSnap.val();
      if (nData) {
        const list = Object.keys(nData).map(k => ({ id: k, ...nData[k] }));
        setMyNotifications(list.filter(n => n.userEmail === user.email).sort((a,b) => b.timestamp - a.timestamp));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab')) setActiveTab(params.get('tab'));
    if (auth.currentUser?.displayName) setDisplayName(auth.currentUser.displayName);
    
    loadData();
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
      const currentUid = user?.uid || auth.currentUser?.uid;
      const currentName = auth.currentUser?.displayName || user?.email?.split('@')[0] || "Guest";

      if (!currentUid) throw new Error("Could not verify user ID. Please log in again.");

      const safeNodeId = reviewingItem.id || String(reviewingItem.title).replace(/[^a-zA-Z0-9]/g, '');

      await push(ref(db, `reviews/${safeNodeId}`), {
        userId: currentUid,
        name: currentName,
        rating: reviewRating,
        text: reviewText,
        date: new Date().toLocaleDateString()
      });
      showToast("Review submitted successfully!", "success");
      setReviewingItem(null);
      setReviewRating(5);
      setReviewText('');
    } catch (error) {
      showToast(error.message || "Failed to submit review.", "error");
    }
  };

  const handleMarkAsRead = (notifId) => {
    update(ref(db, `notifications/${notifId}`), { read: true }).then(() => {
      setMyNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    });
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    showToast("ID copied to clipboard!", "success");
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
          <h2 className="text-3xl font-bold text-white mb-2">Welcome, {auth.currentUser?.displayName || user?.email?.split('@')[0] || "User"}</h2>
          <p className="text-gray-400 text-base">Manage your active bookings, downloads, and account settings.</p>
        </div>

        <div className="flex overflow-x-auto border-b border-white/10 mb-8 gap-8 scrollbar-hide">
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
            onClick={() => setActiveTab('inbox')}
            className={`pb-3 text-sm font-bold tracking-widest uppercase transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'inbox' ? 'text-[#FFBF00] border-b-2 border-[#FFBF00]' : 'text-gray-500 hover:text-white'}`}
          >
            Inbox
            {myNotifications.filter(n => !n.read).length > 0 && (
              <span className="bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                {myNotifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-sm font-bold tracking-widest uppercase transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'text-[#FFBF00] border-b-2 border-[#FFBF00]' : 'text-gray-500 hover:text-white'}`}
          >
            Account Settings
          </button>
        </div>

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
                    <div className="text-xs text-gray-500 font-mono mb-4 border-b border-white/5 pb-2 flex justify-between">
                      <span onClick={() => handleCopyId(trx.id)} className="cursor-pointer hover:text-white flex items-center gap-1" title="Click to copy ID">
                        Order {trx.id}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </span>
                      <span>{trx.date}</span>
                    </div>
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
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${b.status === 'Confirmed' ? 'bg-green-500/20 text-green-500' : b.status === 'Declined' ? 'bg-red-500/20 text-red-500' : b.status === 'Deployed' ? 'bg-blue-500/20 text-blue-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {b.date} at {b.time}
                    </div>
                    {b.status === 'Confirmed' && (
                      <div className="bg-[#1a1a1a] p-3 rounded border border-white/5 text-sm text-gray-300">
                        Check your Inbox for updates and meeting links!
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

        {activeTab === 'inbox' && (
          <div className="animate-fade-up">
            {myNotifications.length === 0 ? (
              <div className="bg-[#121212] border border-white/5 rounded-xl p-10 text-center">
                <p className="text-gray-400">Your inbox is empty.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myNotifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => {
                      if (!n.read) handleMarkAsRead(n.id);
                      setSelectedNotification(n);
                    }} 
                    className={`p-5 rounded-xl border transition-colors ${n.read ? 'bg-[#121212] border-white/5 opacity-70 hover:opacity-100 cursor-pointer' : 'bg-[#1a1a1a] border-[#FFBF00]/50 shadow-[0_0_15px_rgba(255,191,0,0.15)] cursor-pointer hover:bg-[#222]'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-white font-bold flex items-center gap-3 text-lg">
                        {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-[#FFBF00] animate-pulse shrink-0"></span>}
                        {n.title}
                      </h4>
                      <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap ml-4">{n.date}</span>
                    </div>
                    <p className={`text-sm leading-relaxed line-clamp-2 ${n.read ? 'text-gray-400' : 'text-gray-200'}`}>{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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

      {selectedNotification && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center px-4 animate-fade-up">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedNotification(null)}></div>
          <div className="relative bg-[#121212] border border-white/10 rounded-xl w-full max-w-lg p-8 shadow-2xl z-10">
            <button onClick={() => setSelectedNotification(null)} className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <h3 className="text-2xl font-bold text-white mb-2 pr-6">{selectedNotification.title}</h3>
            <p className="text-xs text-gray-500 mb-6 border-b border-white/10 pb-4">{selectedNotification.date}</p>
            
            <div className="bg-[#1a1a1a] p-5 rounded-lg border border-white/5 mb-8">
              <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{selectedNotification.message}</p>
            </div>

            <button onClick={() => setSelectedNotification(null)} className="cursor-pointer w-full bg-white/10 text-white font-bold py-2.5 rounded hover:bg-white hover:text-black transition-all">
              Close Message
            </button>
          </div>
        </div>
      )}

      {reviewingItem && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center px-4 animate-fade-up">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => setReviewingItem(null)}></div>
          <div className="relative bg-[#121212] border border-white/10 rounded-xl w-full max-w-md p-8 shadow-2xl z-10">
            <button onClick={() => setReviewingItem(null)} className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <h3 className="text-xl font-bold text-white mb-2">Leave a Review</h3>
            <p className="text-sm text-gray-400 mb-6 border-b border-white/10 pb-4">Rate your experience with <span className="text-white font-bold">{reviewingItem?.title || "this product"}</span>.</p>
            
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
  const [bookingSubTab, setBookingSubTab] = useState('incoming');
  const [activeSubTab, setActiveSubTab] = useState('booking_transactions');
  const [paymentPage, setPaymentPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const [adminMessage, setAdminMessage] = useState('');

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

  const loadAdminData = async () => {
    try {
      const [bSnap, tSnap, pSnap] = await Promise.all([
        get(ref(db, 'bookings')),
        get(ref(db, 'transactions')),
        get(ref(db, 'products'))
      ]);

      const bData = bSnap.val();
      const tData = tSnap.val();
      const pData = pSnap.val();

      setDbData({
        bookings: bData ? Object.keys(bData).map(k => ({ id: k, ...bData[k] })) : [],
        transactions: tData ? Object.keys(tData).map(k => ({ id: k, ...tData[k] })) : [],
        products: pData ? Object.keys(pData).map(k => ({ id: k, ...pData[k] })) : []
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLive(true);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (adminSelectedDate && adminSelectedService) {
      get(ref(db, `availability/${adminSelectedService}/${currentYear}/${currentMonth}/${adminSelectedDate}`))
        .then((snapshot) => {
          const val = snapshot.val();
          setAdminSlots(val && Array.isArray(val) ? val : []);
        }).catch(err => console.error(err));
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
      showToast(`Schedule saved for ${services.find(s=>s.id === adminSelectedService)?.title || 'Service'}`, "success");
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
      await loadAdminData();
      
      showToast("Product uploaded successfully to Database!", "success");
      setShowProductModal(false);
      setNewProduct({ title: '', price: '', type: 'eBook', desc: '', imageFile: null, docFile: null });
    } catch (error) {
      showToast(error.message || "Error uploading product.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleApproveBooking = (booking) => {
    update(ref(db, `bookings/${booking.id}`), { status: "Confirmed" }).then(() => {
      push(ref(db, 'notifications'), {
        userEmail: booking.email,
        title: "Booking Confirmed!",
        message: `Your booking for ${booking.service} on ${booking.date} at ${booking.time} has been approved. Check your email for any specific meeting links or instructions.`,
        timestamp: Date.now(),
        read: false,
        date: new Date().toLocaleDateString()
      });
      setSelectedBooking(null);
      setAdminMessage('');
      loadAdminData();
      showToast("Booking Approved and user notified!", "success");
    }).catch(err => showToast(err.message, "error"));
  };

  const handleDeclineBooking = (booking) => {
    update(ref(db, `bookings/${booking.id}`), { status: "Declined" }).then(() => {
      push(ref(db, 'notifications'), {
        userEmail: booking.email,
        title: "Booking Declined",
        message: `Unfortunately, your requested slot for ${booking.service} on ${booking.date} at ${booking.time} could not be accommodated. Please try booking a different time.`,
        timestamp: Date.now(),
        read: false,
        date: new Date().toLocaleDateString()
      });
      setSelectedBooking(null);
      setAdminMessage('');
      loadAdminData();
      showToast("Booking Declined and user notified.", "success");
    }).catch(err => showToast(err.message, "error"));
  };

  const handleDeployBooking = (booking) => {
    update(ref(db, `bookings/${booking.id}`), { status: "Deployed" }).then(() => {
      push(ref(db, 'notifications'), {
        userEmail: booking.email,
        title: "Session Deployed",
        message: `Your session for ${booking.service} on ${booking.date} is now active and deployed. Please check your email for the meeting link!`,
        timestamp: Date.now(),
        read: false,
        date: new Date().toLocaleDateString()
      });
      setSelectedBooking(null);
      setAdminMessage('');
      loadAdminData();
      showToast("Booking Deployed and user notified.", "success");
    }).catch(err => showToast(err.message, "error"));
  };

  const handleSendCustomMessage = (booking) => {
    if (!adminMessage.trim()) return showToast("Message cannot be empty.", "error");
    
    push(ref(db, 'notifications'), {
      userEmail: booking.email,
      title: `Message regarding your booking: ${booking.service}`,
      message: adminMessage,
      timestamp: Date.now(),
      read: false,
      date: new Date().toLocaleDateString()
    }).then(() => {
      showToast("Message sent to user!", "success");
      setAdminMessage('');
    }).catch(err => showToast(err.message, "error"));
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    showToast("ID copied to clipboard!", "success");
  };

  const displayBookings = Array.isArray(dbData?.bookings) && dbData.bookings.length > 0 ? dbData.bookings : [];
  const displayTransactions = Array.isArray(dbData?.transactions) && dbData.transactions.length > 0 ? dbData.transactions : [];
  const displayProducts = Array.isArray(dbData?.products) && dbData.products.length > 0 ? dbData.products : [];

  const filteredBookings = displayBookings.filter(b => {
    if (bookingSubTab === 'incoming') return true;
    if (bookingSubTab === 'pending') return b?.status === 'Pending';
    if (bookingSubTab === 'approved') return b?.status === 'Confirmed';
    if (bookingSubTab === 'deployed') return b?.status === 'Deployed';
    return true;
  }).reverse();

  const indexOfLastBooking = bookingPage * 10;
  const indexOfFirstBooking = indexOfLastBooking - 10;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalBookingPages = Math.ceil(filteredBookings.length / 10);

  const filteredTransactions = (displayTransactions?.filter(t => t?.type === (activeSubTab === 'booking_transactions' ? 'Booking' : 'Purchase')) || []).reverse();
  const indexOfLastTrx = paymentPage * 10;
  const indexOfFirstTrx = indexOfLastTrx - 10;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTrx, indexOfLastTrx);
  const totalPages = Math.ceil(filteredTransactions.length / 10);

  return (
    <div className="w-full flex-1 flex flex-col md:flex-row animate-fade-up border-t border-white/5">
      <div className="w-full md:w-64 bg-[#0a0a0a] border-r border-white/5 p-6 flex flex-col gap-2 shrink-0">
        
        <div className="flex items-center justify-between mb-4 pl-3">
          <h3 className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">Admin Panel</h3>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-[9px] text-gray-500 font-mono uppercase">{isLive ? 'Fetched' : 'Loading'}</span>
          </div>
        </div>

        <div className="mb-2">
          <h3 className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2 pl-3">Bookings</h3>
          <button onClick={() => { setActiveTab('bookings'); setBookingSubTab('incoming'); setBookingPage(1); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bookings' && bookingSubTab === 'incoming' ? 'bg-[#FFBF00]/10 text-[#FFBF00]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>All Incoming</button>
          <button onClick={() => { setActiveTab('bookings'); setBookingSubTab('pending'); setBookingPage(1); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bookings' && bookingSubTab === 'pending' ? 'bg-[#FFBF00]/10 text-[#FFBF00]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>Pending</button>
          <button onClick={() => { setActiveTab('bookings'); setBookingSubTab('approved'); setBookingPage(1); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bookings' && bookingSubTab === 'approved' ? 'bg-[#FFBF00]/10 text-[#FFBF00]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>Approved</button>
          <button onClick={() => { setActiveTab('bookings'); setBookingSubTab('deployed'); setBookingPage(1); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bookings' && bookingSubTab === 'deployed' ? 'bg-[#FFBF00]/10 text-[#FFBF00]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>Deployed</button>
        </div>
        
        <button onClick={() => {setActiveTab('availability'); setAdminSelectedDate(null);}} className={`cursor-pointer w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'availability' ? 'bg-[#FFBF00]/10 text-[#FFBF00]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
          Manage Availability
        </button>
        <button onClick={() => setActiveTab('shop')} className={`cursor-pointer w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'shop' ? 'bg-[#FFBF00]/10 text-[#FFBF00]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
          Shop Inventory
        </button>

        <div className="mt-4 mb-2 border-t border-white/5 pt-4">
          <h3 className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2 pl-3">Payments</h3>
          <button onClick={() => { setActiveTab('payments'); setActiveSubTab('booking_transactions'); setPaymentPage(1); }} className={`cursor-pointer w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'payments' && activeSubTab === 'booking_transactions' ? 'bg-[#FFBF00]/10 text-[#FFBF00]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            Booking Transactions
          </button>
          <button onClick={() => { setActiveTab('payments'); setActiveSubTab('purchase_transactions'); setPaymentPage(1); }} className={`cursor-pointer w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'payments' && activeSubTab === 'purchase_transactions' ? 'bg-[#FFBF00]/10 text-[#FFBF00]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
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
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{bookingSubTab} Bookings</h2>
                   <button onClick={loadAdminData} className="cursor-pointer text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/5">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                     Refresh Data
                   </button>
                </div>

                {currentBookings.length === 0 ? (
                  <div className="text-gray-500 text-sm py-8 px-4 text-center border border-dashed border-white/10 rounded-xl">No {bookingSubTab} bookings found.</div>
                ) : (
                  <>
                    <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
                      {currentBookings.map((b, idx) => (
                        <div key={b?.id || idx} className={`p-6 flex justify-between items-center ${idx !== currentBookings.length - 1 ? 'border-b border-white/5' : ''}`}>
                          <div>
                            <h4 className="text-white font-bold">
                              {b?.name || 'Unknown User'}
                            </h4>
                            <p className="text-gray-400 text-sm">{b?.service || 'Service'}</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right hidden md:block">
                              <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${b?.status === 'Confirmed' ? 'bg-green-500/20 text-green-500' : b?.status === 'Declined' ? 'bg-red-500/20 text-red-500' : b?.status === 'Deployed' ? 'bg-blue-500/20 text-blue-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{b?.status || 'Pending'}</span>
                              <p className="text-white text-sm mt-1">{b?.date} {b?.time && `at ${b.time}`}</p>
                            </div>
                            <button onClick={() => { setSelectedBooking(b); setAdminMessage(''); }} className="cursor-pointer bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2 px-4 rounded border border-white/10 transition-colors">
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {totalBookingPages > 1 && (
                      <div className="flex justify-between items-center mt-4 px-4 py-3 bg-[#121212] border border-white/5 rounded-xl">
                        <button 
                          onClick={() => setBookingPage(prev => Math.max(prev - 1, 1))}
                          disabled={bookingPage === 1}
                          className="cursor-pointer text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          &larr; Previous
                        </button>
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Page {bookingPage} of {totalBookingPages}</span>
                        <button 
                          onClick={() => setBookingPage(prev => Math.min(prev + 1, totalBookingPages))}
                          disabled={bookingPage === totalBookingPages}
                          className="cursor-pointer text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          Next &rarr;
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {selectedBooking && (
              <div className="fixed inset-0 z-[100] flex justify-center items-center px-4 animate-fade-up">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedBooking(null)}></div>
                <div className="relative bg-[#121212] border border-white/10 rounded-xl w-full max-w-lg p-8 shadow-2xl z-10 max-h-[95vh] overflow-y-auto">
                  <button onClick={() => setSelectedBooking(null)} className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Booking Details</h3>
                  <div className="space-y-4 mb-6">
                    <div>
                      <span className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Student Name</span>
                      <span className="text-white">{selectedBooking?.name || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Contact Email</span>
                      <span className="text-[#FFBF00]">{selectedBooking?.email || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Service</span>
                        <span className="text-white text-sm">{selectedBooking?.service || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Schedule</span>
                        <span className="text-white text-sm">{selectedBooking?.date || 'Date'} • {selectedBooking?.time || 'Time'}</span>
                      </div>
                    </div>
                    <div className="bg-[#1a1a1a] p-4 rounded border border-white/5">
                      <span className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Student Notes / Goals</span>
                      <p className="text-gray-300 text-sm leading-relaxed">{selectedBooking?.notes || 'No notes provided.'}</p>
                    </div>
                  </div>

                  <div className="bg-black/30 p-4 rounded-lg border border-white/5 mb-6">
                    <span className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Message User</span>
                    <textarea 
                      rows="2" 
                      value={adminMessage} 
                      onChange={e => setAdminMessage(e.target.value)} 
                      className="w-full bg-[#121212] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#FFBF00] resize-none text-sm mb-2" 
                      placeholder="Need more details? Send them a message..."
                    ></textarea>
                    <div className="flex justify-end">
                      <button 
                        onClick={() => handleSendCustomMessage(selectedBooking)} 
                        className="cursor-pointer bg-white/10 text-white text-xs font-bold py-1.5 px-4 rounded hover:bg-[#FFBF00] hover:text-black transition-colors"
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    {selectedBooking?.status === 'Pending' && (
                      <>
                        <button onClick={() => handleDeclineBooking(selectedBooking)} className="flex-1 cursor-pointer bg-red-500/20 text-red-500 border border-red-500/30 font-bold py-2.5 rounded hover:bg-red-500 hover:text-white transition-all">
                          Decline
                        </button>
                        <button onClick={() => handleApproveBooking(selectedBooking)} className="flex-1 cursor-pointer bg-green-500/20 text-green-500 border border-green-500/30 font-bold py-2.5 rounded hover:bg-green-500 hover:text-white transition-all">
                          Approve
                        </button>
                      </>
                    )}
                    {selectedBooking?.status === 'Confirmed' && (
                      <button onClick={() => handleDeployBooking(selectedBooking)} className="w-full cursor-pointer bg-blue-500/20 text-blue-500 font-bold py-2.5 rounded border border-blue-500/30 hover:bg-blue-500 hover:text-white transition-all">
                        Mark as Deployed
                      </button>
                    )}
                    {(selectedBooking?.status === 'Deployed' || selectedBooking?.status === 'Declined') && (
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
                    <button onClick={() => setShowProductModal(true)} className="cursor-pointer bg-[#FFBF00] text-black text-sm font-bold py-2 px-4 rounded hover:bg-white transition-colors">
                      + Add Product
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {displayProducts.length === 0 ? (
                     <div className="text-gray-500 text-sm py-8 px-4 text-center border border-dashed border-white/10 rounded-xl">No products available. Add one above.</div>
                  ) : (
                     displayProducts.map(product => (
                      <div key={product?.id} className="bg-[#121212] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img src={product?.image} alt={product?.title || 'Product'} className="w-12 h-12 rounded object-cover" />
                          <div>
                            <h4 className="text-white font-bold text-sm">
                              {product?.title || 'Untitled Product'}
                            </h4>
                            <p className="text-[#FFBF00] text-xs font-bold">${(parseFloat(product?.price) || 0).toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => {
                            remove(ref(db, `products/${product.id}`)).then(()=> {
                              showToast("Product node removed.", "success");
                              loadAdminData();
                            });
                          }} className="cursor-pointer text-red-500 hover:bg-red-500 hover:text-white text-xs font-medium px-3 py-1.5 border border-red-500/30 rounded transition-colors">Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="animate-fade-up max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                     {activeSubTab === 'booking_transactions' ? 'Booking Transactions' : 'Purchase Transactions'}
                   </h2>
                   <button onClick={loadAdminData} className="cursor-pointer text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/5">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                     Refresh Data
                   </button>
                </div>
                
                {currentTransactions.length === 0 ? (
                  <div className="text-gray-500 text-sm py-8 px-4 text-center border border-dashed border-white/10 rounded-xl">No transactions found.</div>
                ) : (
                  <>
                    <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest">
                            <th className="p-4 font-bold">Transaction ID</th>
                            <th className="p-4 font-bold">Customer</th>
                            <th className="p-4 font-bold">Item Details</th>
                            <th className="p-4 font-bold">Date</th>
                            <th className="p-4 font-bold">Amount</th>
                            <th className="p-4 font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm text-gray-300">
                          {currentTransactions.map(trx => (
                            <tr key={trx?.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-4 font-mono text-xs">
                                <span onClick={() => handleCopyId(trx?.id)} className="cursor-pointer hover:text-white flex items-center gap-1" title="Click to copy ID">
                                  {trx?.id || 'N/A'}
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </span>
                              </td>
                              <td className="p-4 text-white font-bold">{trx?.user || 'Unknown'}</td>
                              <td className="p-4">
                                <div className="flex flex-col gap-1">
                                  {trx?.items && trx.items.length > 0 
                                    ? trx.items.map((cartItem, i) => (
                                        <span key={i} className="text-xs bg-white/5 px-2 py-1 rounded inline-block w-fit text-gray-300 border border-white/5">
                                          {cartItem.title}
                                        </span>
                                      ))
                                    : <span>{trx?.item || 'Item'}</span>
                                  }
                                </div>
                              </td>
                              <td className="p-4 text-gray-500">{trx?.date || ''}</td>
                              <td className="p-4 font-bold text-[#FFBF00]">${(parseFloat(trx?.amount) || 0).toFixed(2)}</td>
                              <td className="p-4">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${trx?.status === 'Completed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                  {trx?.status || 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center mt-4 px-4 py-3 bg-[#121212] border border-white/5 rounded-xl">
                        <button 
                          onClick={() => setPaymentPage(prev => Math.max(prev - 1, 1))}
                          disabled={paymentPage === 1}
                          className="cursor-pointer text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          &larr; Previous
                        </button>
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Page {paymentPage} of {totalPages}</span>
                        <button 
                          onClick={() => setPaymentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={paymentPage === totalPages}
                          className="cursor-pointer text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          Next &rarr;
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const NavBar = ({ cartItems, user, setUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  useEffect(() => {
    if (!user || user.role === 'admin') { 
      setUnreadCount(0); 
      return; 
    }
    get(ref(db, 'notifications')).then(snap => {
       const val = snap.val();
       if(val) {
          const list = Object.values(val);
          setUnreadCount(list.filter(n => n.userEmail === user.email && !n.read).length);
       } else setUnreadCount(0);
    });
  }, [user]);

  const handleLogout = () => {
    signOut(auth).then(() => {
      setIsMobileMenuOpen(false);
      navigate('/');
    });
  };

  const NavLink = ({ to, children }) => (
    <Link 
      to={to} 
      onClick={() => setIsMobileMenuOpen(false)}
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
        
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="cursor-pointer text-white font-extrabold text-2xl flex items-center gap-2 hover:opacity-80 transition-opacity z-50">
          <span className="w-2.5 h-2.5 bg-[#FFBF00] rounded-full inline-block shadow-[0_0_8px_rgba(255,191,0,0.8)]"></span>
          Maricel<span className="text-[#FFBF00]">Concepcion</span>
        </Link>
        
        <div className="hidden md:flex gap-10 text-[11px] font-bold tracking-widest uppercase mt-1">
          <NavLink to="/">Profile</NavLink>
          <NavLink to="/booking">Services</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          {user && user.role !== 'admin' && <NavLink to="/dashboard">Dashboard</NavLink>}
          {user && user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        </div>

        <div className="flex items-center gap-4 z-50">
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

          <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="cursor-pointer group flex items-center gap-2 lg:gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full transition-all text-xs font-bold text-white relative">
            <span className="hidden sm:inline">CART</span>
            {isActive('/cart') && (
              <span className="absolute left-1/2 -translate-x-1/2 -bottom-[12px] w-3/4 h-[2px] bg-[#FFBF00] shadow-[0_0_10px_2px_rgba(255,191,0,0.6)] rounded-full hidden sm:block"></span>
            )}
            <span className={`w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center rounded-full text-[10px] transition-all ${cartItems.length > 0 ? 'bg-[#FFBF00] text-black shadow-[0_0_10px_rgba(255,191,0,0.5)] scale-110' : 'bg-gray-800 text-gray-400'}`}>
              {cartItems.length}
            </span>
          </Link>

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

      <div className={`fixed inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl z-40 transition-transform duration-300 flex flex-col pt-24 px-8 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
        <div className="flex flex-col gap-8 text-lg font-bold tracking-widest uppercase">
          <NavLink to="/">Profile</NavLink>
          <NavLink to="/booking">Services</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          {user && user.role !== 'admin' && <NavLink to="/dashboard">Dashboard</NavLink>}
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
        
        <footer className="w-full bg-[#121212] border-t border-white/5 py-6 flex justify-center px-6 mt-auto z-10 relative">
          <div className="max-w-6xl w-full flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#FFBF00] rounded-full inline-block"></span>
              <span className="text-white font-extrabold text-lg">M<span className="text-[#FFBF00]">C</span></span>
              <span className="text-gray-600 mx-2 hidden sm:inline">|</span>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold hidden sm:block">
                &copy; 2026 All Rights Reserved
              </p>
              </div>

            <div className="flex items-center gap-6">
              <a href="https://www.facebook.com/GodsFEIvor" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#FFBF00] transition-transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
              <a href="https://m.me/YOUR_FACEBOOK_PAGE_NAME" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#FFBF00] transition-transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.906 1.488 5.485 3.82 7.159v3.456l3.52-1.94c1.558.428 3.195.666 4.66.666 5.523 0 10-4.145 10-9.259S17.523 2 12 2zm1.096 12.228l-2.825-3.018-5.508 3.018 6.046-6.425 2.898 3.018 5.434-3.018-6.045 6.425z"/></svg>
              </a>
              <a href="https://www.instagram.com/breakthroughs_with_mc" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#FFBF00] transition-transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.173.055 1.81.252 2.234.417.564.217.966.477 1.386.897.42.42.68.822.897 1.386.165.424.362 1.06.417 2.234.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.055 1.173-.252 1.81-.417 2.234-.217.564-.477.966-.897 1.386-.42-.42-.822.68-1.386.897-.424.165-1.06.362-2.234.417-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.173-.055-1.81-.252-2.234-.417-.564-.217-.966-.477-1.386-.897-.42-.42-.68-.822-.897-1.386-.165-.424-.362-1.06-.417-2.234-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.055-1.173.252-1.81.417-2.234.217-.564.477-.966.897-1.386.42-.42.822-.68 1.386-.897.424-.165 1.06-.362 2.234-.417.265-.125.617-.184 1.092-.206.57-.026.757-.03 2.257-.03zm0-2.163c-3.258 0-3.667.014-4.947.072-1.275.058-2.146.26-2.906.557-.785.303-1.448.71-2.112 1.374-.664.664-1.071 1.327-1.374 2.112-.297.76-.5 1.631-.557 2.906-.058 1.28-.072 1.689-.072 4.947s.014 3.667.072 4.947c.058 1.275.26 2.146.557 2.906.303.785.71 1.448 1.374 2.112.664.664 1.327 1.071 2.112 1.374.76.297 1.631.5 2.906.557 1.28.058 1.689.072 4.947.072s3.667-.014 4.947-.072c1.275-.058 2.146-.26 2.906-.557.785-.303 1.448-.71 2.112-1.374.664-.664-1.071-1.327 1.374-2.112.297-.76.5-1.631.557-2.906.058-1.28.072-1.689.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;