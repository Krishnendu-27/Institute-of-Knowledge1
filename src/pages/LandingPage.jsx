import { motion } from "framer-motion";
import { GraduationCap, Search, Clock } from "lucide-react";
import { Image } from "../assets/Image";

import { Navbar } from "../components/Landing/Navbar";
import { Testimonial } from "../components/Landing/Testimonial";
import { FeatureCard } from "../components/Landing/FeatureCard";
import { Footer } from "../components/Landing/Footer";

import useUiStateStore from "../stores/useUiStateStore";
import LoginOverlay from "../components/Login/LoginModal";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import { useLoginStore } from "../stores/useLoginStore";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeatureCardContent = [
  {
    icon: GraduationCap,
    title: "Student Portal",
    desc: "Provides your team-mates, and facilitate transparent student and parent communication.",
  },
  {
    icon: Search,
    title: "Academic Records",
    desc: "Academic assessments, records, and view management film via multidimensional reports.",
  },
  {
    icon: Clock,
    title: "Faculty Management",
    desc: "Manage management, faculty-wise monitoring, recommendations, faculty and posts.",
  },
];

const TestimonialContent = [
  {
    text: "Student management system, I team and teach easily and utilize our time and efforts for students.",
    author: "Haran Webber",
    isRight: false,
  },
  {
    text: "The student management team works effortlessly with reporting and various environment foundations.",
    author: "Mana Smith",
    isRight: true,
  },
];

export default function LandingPage() {
  const isLoginButtonclicked = useUiStateStore(
    (state) => state.isLoginButtonclicked,
  );
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openModal = useLoginStore((state) => state.openModal);

  return (
    <>
      {isLoginButtonclicked && <LoginOverlay />}
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary font-sans transition-colors duration-300">
        <Navbar />

        {/* ----- Hero Section -----  */}
        <section className="pt-16 pb-24 px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight uppercase">
              Modernize Your Academy <br className="hidden md:block" />{" "}
              Effortlessly
            </h1>
            <p className="mt-6 text-muted-foreground max-w-2xl mx-auto text-sm md:text-base font-medium">
              A comprehensive, cloud-based management system for{" "}
              <br className="hidden md:block" />
              modern institute of forward thinking academes.
            </p>
          </motion.div>

          {/* Hero Illustration */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-6 md:gap-12">
            <img
              src={Image.HeroPic}
              className="md:w-5/6 w-full drop-shadow-xl"
              alt="hero_image"
            />
          </div>

          
        </section>

        {/*------- Features Section -------  */}
        <section className="bg-card py-24 px-6 border-y border-border transition-colors duration-300">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-center mb-16 uppercase tracking-[0.2em]">
              Features
            </h2>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid md:grid-cols-3 gap-8"
            >
              {FeatureCardContent.map((data, i) => (
                <FeatureCard
                  key={i}
                  icon={data.icon}
                  title={data.title}
                  desc={data.desc}
                />
              ))}
            </motion.div>
          </div>
        </section>

        {/* ------Testimonials-------- */}
        <section className="py-24 px-6 max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-16 uppercase tracking-[0.2em]">
            Testimonials
          </h2>
          <div className="space-y-4">
            {TestimonialContent.map((data, i) => (
              <Testimonial
                key={i}
                text={data.text}
                author={data.author}
                isRight={data.isRight}
              />
            ))}
          </div>

          <div className="flex justify-center mt-16">
            {!isAuthenticated ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openModal}
                className="bg-primary hover:opacity-90 text-primary-foreground px-12 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/30 transition-opacity"
              >
                Join Us
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
                className="bg-primary hover:opacity-90 text-primary-foreground px-12 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/30 transition-opacity"
              >
                Back to system
              </motion.button>
            )}
          </div>
        </section>

        {/* -------Footer--------- */}
        <Footer />
      </div>
    </>
  );
}
