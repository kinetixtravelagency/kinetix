import React from "react";
import vodafoneImg from "@/assets/pics/vodafone.jpg";
import instapayImg from "@/assets/pics/instapay.png";
import orangeImg from "@/assets/pics/orange.jpg";
import wepayImg from "@/assets/pics/wepay.jpg";
import etisalatImg from "@/assets/pics/etisalat.png";

/**
 * Authentic brand logo components using the exact official company image assets:
 * - Vodafone Cash: src/assets/pics/vodafone.jpg
 * - InstaPay: src/assets/pics/instapay.png
 * - Orange Cash: src/assets/pics/orange.jpg
 * - WE Pay: src/assets/pics/wepay.jpg
 * - Etisalat Cash: src/assets/pics/etisalat.png
 */

export function VodafoneLogo({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 overflow-hidden rounded-2xl bg-[#E60000] border border-red-500/30 shadow-sm ${className}`}>
      <img src={vodafoneImg} alt="Vodafone Cash / فودافون كاش" className="h-full w-full object-cover" />
    </div>
  );
}

export function InstaPayLogo({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 overflow-hidden rounded-2xl bg-white border border-border/80 shadow-sm p-1 ${className}`}>
      <img src={instapayImg} alt="InstaPay / انستاباي" className="h-full w-full object-contain" />
    </div>
  );
}

export function OrangeLogo({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 overflow-hidden rounded-2xl bg-[#FF7900] border border-orange-500/30 shadow-sm ${className}`}>
      <img src={orangeImg} alt="Orange Cash / أورنج كاش" className="h-full w-full object-cover" />
    </div>
  );
}

export function WePayLogo({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 overflow-hidden rounded-2xl bg-white border border-border/80 shadow-sm p-1 ${className}`}>
      <img src={wepayImg} alt="WE Pay / وي باي" className="h-full w-full object-contain" />
    </div>
  );
}

export function EtisalatLogo({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 overflow-hidden rounded-2xl bg-[#E10600] border border-red-500/30 shadow-sm ${className}`}>
      <img src={etisalatImg} alt="Etisalat Cash / e& كاش" className="h-full w-full object-cover" />
    </div>
  );
}

export function PaymentBrandLogos() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <InstaPayLogo className="h-9 w-9" />
      <VodafoneLogo className="h-9 w-9" />
      <OrangeLogo className="h-9 w-9" />
      <EtisalatLogo className="h-9 w-9" />
      <WePayLogo className="h-9 w-9" />
    </div>
  );
}

