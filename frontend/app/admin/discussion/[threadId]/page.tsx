"use client";
import React from "react";
import ThreadDetailPage from "../../../student/discussion/[threadId]/page";

export default function AdminThreadDetailPage(props) {
  // Optionally, you can add admin-specific props or wrappers here
  return <ThreadDetailPage userType="Admin" {...props} />;
} 