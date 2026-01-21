"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Bell, 
  CheckCircle, 
  ShieldAlert, 
  CreditCard, 
  Info, 
  Settings,
  Mail,
  ChevronLeft
} from 'lucide-react';

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: 'Security Alert: New Login Detected',
      description: 'A new login was detected from San Francisco, CA. If this wasn\'t you, please review your security settings.',
      time: '2 mins ago',
      type: 'security',
      read: false
    },
    {
      id: 2,
      title: 'Payment Successful',
      description: 'Your monthly subscription for the Pro Plan has been successfully processed.',
      time: '1 hour ago',
      type: 'billing',
      read: false
    },
    {
      id: 3,
      title: 'System Update Completed',
      description: 'Inverx has been updated to version 2.4.0. Check out the new features in the changelog.',
      time: '1 day ago',
      type: 'system',
      read: true
    },
    {
      id: 4,
      title: 'Domain Verification Failed',
      description: 'We were unable to verify the domain "blog-network.net". Please check your DNS settings.',
      time: '2 days ago',
      type: 'alert',
      read: true
    },
    {
      id: 5,
      title: 'Welcome to Inverx!',
      description: 'Thanks for getting started with Inverx. Explore our documentation to get the most out of your account.',
      time: '1 week ago',
      type: 'info',
      read: true
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'security': return <ShieldAlert className="text-red-500" size={20} />;
      case 'billing': return <CreditCard className="text-emerald-500" size={20} />;
      case 'alert': return <Info className="text-amber-500" size={20} />;
      case 'system': return <Settings className="text-blue-500" size={20} />;
      default: return <Mail className="text-text-secondary" size={20} />;
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-white min-h-screen text-base">
      <div className="max-w-4xl mx-auto px-6 py-10">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 -ml-2 text-text-secondary hover:text-white hover:bg-surface-hover rounded-lg transition-colors">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              <p className="text-text-secondary text-base">Stay updated with your account activity.</p>
            </div>
          </div>
          <button className="text-sm font-medium text-primary hover:text-blue-400 transition-colors">
            Mark all as read
          </button>
        </header>

        {/* List */}
        <div className="flex flex-col gap-3">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-5 rounded-xl border transition-colors ${
                notification.read 
                  ? 'bg-transparent border-surface-border' 
                  : 'bg-surface-dark border-surface-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`shrink-0 p-2.5 rounded-lg ${notification.read ? 'bg-white/5' : 'bg-surface-light border border-surface-border'}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className={`font-semibold ${notification.read ? 'text-text-secondary' : 'text-white'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-text-secondary w-fit shrink-0">{notification.time}</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                    {notification.description}
                  </p>
                </div>
                {!notification.read && (
                  <div className="shrink-0 self-center">
                    <div className="size-2.5 bg-primary rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-surface-dark mb-4">
              <Bell className="text-text-secondary" size={32} />
            </div>
            <h3 className="text-lg font-medium text-white">No notifications</h3>
            <p className="text-text-secondary mt-1">You're all caught up!</p>
          </div>
        )}

      </div>
    </div>
  );
}
