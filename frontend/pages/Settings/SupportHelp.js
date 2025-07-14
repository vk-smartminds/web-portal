import React from "react";
import { FaEnvelope, FaInstagram, FaTwitter, FaFacebook, FaYoutube } from "react-icons/fa";

export default function SupportHelp() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, minWidth: 350, maxWidth: 540, width: '100%' }}>
        <h3 style={{ fontWeight: 700, fontSize: 24, marginBottom: 24, color: "#1e3c72" }}>Support & Help</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <a href="mailto:smart-minds@vkpublications.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f7f8fa', borderRadius: 8, padding: '16px 18px', textDecoration: 'none', color: '#1e3c72', fontWeight: 600, fontSize: 17, border: '1.5px solid #e0e0e0', transition: 'background 0.15s' }}>
            <FaEnvelope style={{ fontSize: 22, color: '#c97a2b' }} />
            Email: smart-minds@vkpublications.com
          </a>
          <a href="https://www.instagram.com/vkglobalgroup/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f7f8fa', borderRadius: 8, padding: '16px 18px', textDecoration: 'none', color: '#1e3c72', fontWeight: 600, fontSize: 17, border: '1.5px solid #e0e0e0', transition: 'background 0.15s' }}>
            <FaInstagram style={{ fontSize: 22, color: '#e1306c' }} />
            Instagram
          </a>
          <a href="https://twitter.com/vkglobalgroup" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f7f8fa', borderRadius: 8, padding: '16px 18px', textDecoration: 'none', color: '#1e3c72', fontWeight: 600, fontSize: 17, border: '1.5px solid #e0e0e0', transition: 'background 0.15s' }}>
            <FaTwitter style={{ fontSize: 22, color: '#1da1f2' }} />
            Twitter
          </a>
          <a href="https://www.facebook.com/vkglobalgroup" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f7f8fa', borderRadius: 8, padding: '16px 18px', textDecoration: 'none', color: '#1e3c72', fontWeight: 600, fontSize: 17, border: '1.5px solid #e0e0e0', transition: 'background 0.15s' }}>
            <FaFacebook style={{ fontSize: 22, color: '#1877f3' }} />
            Facebook
          </a>
          <a href="https://www.youtube.com/@VKGlobalGroup" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f7f8fa', borderRadius: 8, padding: '16px 18px', textDecoration: 'none', color: '#1e3c72', fontWeight: 600, fontSize: 17, border: '1.5px solid #e0e0e0', transition: 'background 0.15s' }}>
            <FaYoutube style={{ fontSize: 22, color: '#ff0000' }} />
            YouTube
          </a>
        </div>
      </div>
    </div>
  );
} 