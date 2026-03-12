import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Mail, Lock, RefreshCw } from "lucide-react";
import { useLoginStore } from "../../stores/useLoginStore";
import { Image } from "../../assets/Image";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/useAuthStore";
import { Navigate, useNavigate } from "react-router-dom";

const LoginModal = () => {
  const { isOpen, closeModal, step, nextStep } = useLoginStore();
  const [email, setEmail] = useState("");

  // Captcha State
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const canvasRef = useRef(null);

  const originalTitleRef = useRef("");

  useEffect(() => {
    if (isOpen) {
      originalTitleRef.current = document.title;
      document.title = "Login";
    } else {
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    }

    return () => {
      if (isOpen && originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    };
  }, [isOpen]);

  const generateCaptcha = () => {
    if (!canvasRef.current) return;
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    drawCaptcha(text);
  };

  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "22px Arial";
    ctx.fillStyle = "#333";
    ctx.setTransform(1, Math.random() * 0.2, Math.random() * 0.2, 1, 0, 0);
    ctx.fillText(text, 15, 32);

    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = "#888";
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  useEffect(() => {
    if (isOpen && step === 1) {
      const timer = setTimeout(() => generateCaptcha(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, step]);

  const handleVerifyStep1 = (e) => {
    e.preventDefault();
    if (email && captchaInput === captchaText) {
      nextStep();
    } else {
      toast.error("Incorrect CAPTCHA. Please try again.");
      setCaptchaInput("");
      generateCaptcha();
    }
  };

  const handleClose = () => {
    closeModal();
    setTimeout(() => {
      setEmail("");
      setCaptchaInput("");
      useLoginStore.setState({ step: 1 });
    }, 500);
  };

  const navigate = useNavigate();

  const handelLogin = (e) => {
    e.preventDefault();
    useAuthStore.setState({ isAuthenticated: true });
    toast.success("Login successfull");
    navigate("/");
    closeModal();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleClose}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            key="modal-box"
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            // Made the minimum height slightly smaller for mobile
            className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-w-4xl w-full min-h-[400px] md:min-h-[500px] relative"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-50 p-2 bg-gray-100 hover:bg-gray-200 md:bg-white/50 md:hover:bg-gray-200 backdrop-blur-sm rounded-full transition"
            >
              <X className="w-5 h-5 text-gray-800" />
            </button>

            {/* LEFT SIDE: Student Image (HIDDEN ON MOBILE: hidden md:flex) */}
            <div className="hidden md:flex relative md:w-1/2 flex-col justify-center items-center text-white text-center overflow-hidden">
              <img
                src={Image.StudentPic}
                alt="Academy Student"
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/60 to-orange-500/60 z-10" />
              <div className="relative z-20 p-12 flex flex-col items-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="mb-8"
                >
                  <ShieldCheck
                    className="w-32 h-32 text-white drop-shadow-lg"
                    strokeWidth={1}
                  />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2 uppercase tracking-wide drop-shadow-md">
                  Secure Access
                </h2>
                <p className="text-white/90 text-sm drop-shadow-sm">
                  Experience the next generation of academy management.
                </p>
              </div>
            </div>

            {/* RIGHT SIDE: Form with Slide Animation (FULL WIDTH ON MOBILE: w-full md:w-1/2) */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 bg-white flex flex-col justify-center overflow-hidden relative">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.form
                    key="step1"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    onSubmit={handleVerifyStep1}
                    className="space-y-6 mt-4 md:mt-0"
                  >
                    <div className="text-center md:text-left mb-6 md:mb-8">
                      <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
                        Login
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Enter your credentials to continue
                      </p>
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="relative flex items-center justify-center bg-gray-100 rounded-xl border border-dashed border-gray-300 overflow-hidden h-[50px] w-full sm:w-[140px] shrink-0">
                        <canvas
                          ref={canvasRef}
                          width="140"
                          height="50"
                          className="cursor-pointer"
                          onClick={generateCaptcha}
                        />
                        <button
                          type="button"
                          onClick={generateCaptcha}
                          className="absolute right-1 top-1 p-1 bg-white/80 rounded shadow-sm hover:bg-white text-gray-500 hover:text-orange-500 transition"
                          title="Reload Captcha"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex-1 relative w-full">
                        <input
                          type="text"
                          required
                          placeholder="Enter Captcha"
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg hover:bg-orange-600 transition"
                    >
                      Verify Details
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="space-y-6 mt-4 md:mt-0"
                  >
                    <div className="text-center md:text-left mb-6 md:mb-8">
                      <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
                        Verify OTP
                      </h3>
                      <p className="text-gray-500 text-sm">
                        We've sent a code to{" "}
                        <span className="font-semibold text-gray-700">
                          {email}
                        </span>
                      </p>
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none tracking-[1em] font-bold text-center"
                      />
                    </div>

                    <button
                      onClick={(e) => handelLogin(e)}
                      type="submit"
                      className="w-full bg-green-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg hover:bg-green-700 transition"
                    >
                      Confirm Login
                    </button>
                    <button
                      onClick={() => useLoginStore.setState({ step: 1 })}
                      className="w-full text-xs text-gray-400 hover:text-gray-600 uppercase font-bold transition"
                    >
                      Go Back
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
