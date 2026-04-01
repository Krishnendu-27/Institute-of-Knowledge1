import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/useAuthStore";
import { Button } from "../UI/Button";

export const StepOneForm = ({ email, setEmail, onVerify }) => {
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const { error, clearError, sendOtp } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

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

  // Run captcha generation on mount
  useEffect(() => {
    const timer = setTimeout(() => generateCaptcha(), 50);
    inputRef.current.focus();
    return () => clearTimeout(timer);
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    clearError();
    if (!email) {
      toast.error("Email required !!");
      return;
    } else if (!captchaInput) {
      toast.error("CAPTCHA required !!");
      return;
    } else if (captchaInput !== captchaText) {
      toast.error("Incorrect CAPTCHA. Please try again.");
      setCaptchaInput("");
      generateCaptcha();
      return;
    } else {
      setIsLoading(true);
      try {
        await sendOtp(email);
        const { isValidEmail, error: authError } = useAuthStore.getState();
        if (isValidEmail) {
          toast.success("OTP sent to your email");
          onVerify();
        } else {
          toast.error(authError || "Failed to send OTP.");
          setCaptchaInput("");
          generateCaptcha();
        }
      } catch (err) {
        toast.error("Network error. Please try again.");
        setCaptchaInput("");
        generateCaptcha();
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <motion.form
      key="step1"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      onSubmit={handleSendOtp}
      className="space-y-6 mt-4 md:mt-0"
    >
      <div className="text-center md:text-left mb-6 md:mb-8">
        <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">
          Login
        </h3>
        <p className="text-foreground/60 text-sm">
          Enter your credentials to continue
        </p>
      </div>

      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
        <input
          type="email"
          required
          placeholder="Email Address"
          ref={inputRef}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${email ? "focus:ring-green-400 border-green-400" : "focus:ring-primary border-border"} w-full pl-12 pr-4 py-3 bg-card border border-border text-foreground rounded-xl focus:ring-2 outline-none transition`}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex items-center justify-center bg-card rounded-xl border border-dashed border-border overflow-hidden h-[50px] w-full sm:w-[140px] shrink-0">
          <canvas
            ref={canvasRef}
            width="140"
            height="50"
            className="cursor-pointer"
            onClick={generateCaptcha}
            onContextMenu={(e) => e.preventDefault()}
          />
          <button
            type="button"
            onClick={generateCaptcha}
            className="absolute right-1 top-1 p-1 bg-background/80 rounded shadow-sm hover:bg-background text-foreground/50 hover:text-primary transition"
            title="Reload Captcha"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
        <div className="flex-1 relative w-full">
          <input
            type="text"
            // required
            placeholder="Enter Captcha"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            className={`${captchaInput === captchaText ? "focus:ring-green-400 border-green-400" : "focus:ring-primary border-border"} w-full px-4 py-3 bg-card border text-foreground rounded-xl focus:ring-2 outline-none transition`}
          />
        </div>
      </div>
      <Button
        buttonType={"submit"}
        buttonName={"Verify Details"}
        disabledCondition={!email || isLoading}
        isLoading={isLoading}
      />
    </motion.form>
  );
};
