"use client";

import React from "react";
import HelpCenterClient from "../../help/components/HelpCenterClient";

export default function DashboardHelpPage() {
  return (
    <div className="space-y-4">
      <HelpCenterClient isStandalone={false} />
    </div>
  );
}
