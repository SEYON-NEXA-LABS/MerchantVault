"use client";

import React from "react";
import HelpCenterClient from "./components/HelpCenterClient";

export default function StandaloneHelpPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <HelpCenterClient isStandalone={true} />
    </div>
  );
}
