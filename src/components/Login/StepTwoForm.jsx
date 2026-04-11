import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/useAuthStore";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import CountdownTimer from "./CountdownTimer";
import { Button } from "../UI/Button";

export const StepTwoForm = ({ email, onBack, onSuccess }) => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [showOtp, setShowOtp] = useState(false);
  const inputRefs = useRef([]);

  const [canResend, setCanResend] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { error, clearError, sendOtp, verifyOtp } = useAuthStore();

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pasteData.some(isNaN)) return;

    const newOtp = [...otp];
    pasteData.forEach((char, index) => {
      newOtp[index] = char;
    });
    setOtp(newOtp);

    const focusIndex = pasteData.length < 6 ? pasteData.length : 5;
    inputRefs.current[focusIndex].focus();
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();

    const otpString = otp.join("");
    const payLoad = {
      email: email,
      otp: otpString,
    };

    if (isOtpComplete) {
      setIsLoading(true);

      try {
        await verifyOtp(payLoad);
        const currentAuthError = useAuthStore.getState().error;
        if (currentAuthError) {
          throw new Error(currentAuthError);
        }
        toast.success("Login successful");
        navigate("/");
        if (onSuccess) onSuccess();
      } catch (err) {
        toast.error(err?.response?.message || "Invalid OTP");
        setOtp(new Array(6).fill(""));
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      const remaining = otp.filter((digit) => digit === "").length;
      toast.error(`${remaining} digit${remaining > 1 ? "s" : ""} remaining !!`);
    }
  };

  const handleResendOTP = async (e) => {
    clearError();
    try {
      const { isValidEmail, error: authError } = useAuthStore.getState();
      if (isValidEmail) {
        await sendOtp(email);
        toast.success("OTP resent successfully!");
        setOtp(new Array(6).fill(""));
        setCanResend(false);
        setTimerKey((prev) => prev + 1);
        inputRefs.current[0].focus();
      } else {
        toast.error(authError || "Failed to re-sent OTP.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <motion.div
      key="step2"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="space-y-6 mt-4 md:mt-0"
    >
      <div className="text-center md:text-left mb-6 md:mb-8">
        <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">
          Verify OTP
        </h3>
        <p className="text-foreground/60 text-sm">
          We've sent a code to
          <span className="font-semibold text-foreground"> {email}</span>
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-3">
          <div className="mb-2">
            <span className="text-xs text-foreground/60 font-medium flex items-center gap-1">
              <Lock className="w-3 h-3" /> Secure Code
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex justify-between gap-1.5 sm:gap-2 w-full md:w-max">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type={showOtp ? "text" : "password"}
                  maxLength={1}
                  value={digit}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={canResend}
                  className={`w-9 h-11 sm:w-10 sm:h-12 md:w-12 md:h-14 text-center text-lg md:text-xl font-bold rounded-xl border bg-card transition-all duration-300 outline-none disabled:opacity-50 disabled:cursor-not-allowed shrink-0
                    ${
                      isOtpComplete
                        ? "border-green-500 text-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                        : digit !== ""
                          ? "border-primary/20 text-foreground focus:border-primary focus:ring-2 focus:ring-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]"
                          : "border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary"
                    }
                  `}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowOtp(!showOtp)}
              className="text-xs text-foreground/60 hover:text-foreground transition-colors flex items-center gap-1.5 font-medium self-end md:self-auto shrink-0 mt-1 md:mt-0"
            >
              {showOtp ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" /> Hide
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" /> Show
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center px-1">
          <span className="text-xs text-foreground/60 font-medium">
            {canResend ? "Didn't receive the code?" : "Time remaining:"}
          </span>
          <div className="text-sm font-bold text-primary">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOTP}
                className="hover:underline hover:text-primary/80 transition-colors cursor-pointer capitalize tracking-wider text-xs"
              >
                Resend OTP ?
              </button>
            ) : (
              <CountdownTimer
                key={timerKey}
                onExpire={() => setCanResend(true)}
              />
            )}
          </div>
        </div>

        <Button
          buttonName={"Confirm Login"}
          buttonType={"submit"}
          disabledCondition={!isOtpComplete || canResend || isLoading}
          isLoading={isLoading}
        />
      </form>

      <button
        onClick={onBack}
        type="button"
        className="w-full text-xs text-foreground/40 hover:text-foreground/80 uppercase font-bold transition"
      >
        Go Back
      </button>
    </motion.div>
  );
};
