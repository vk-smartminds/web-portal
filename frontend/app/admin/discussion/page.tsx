"use client";
import React from "react";
import DiscussionPanel from "../../student/discussion/page";

export default function AdminDiscussionPanel() {
  // Optionally, you can add admin-specific props or wrappers here
  return <DiscussionPanel userType="Admin" />;
} 