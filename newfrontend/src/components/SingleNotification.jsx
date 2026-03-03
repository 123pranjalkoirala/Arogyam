// Single Notification Component - Shows only one notification at a time
import React from 'react';
import { Bell, X } from 'lucide-react';

export default function SingleNotification({ notifications, setNotifications }) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-20">
        <Bell className="w-24 h-24 text-gray-300 mx-auto mb-8" />
        <p className="text-2xl text-gray-500">No notifications yet</p>
        <p className="text-gray-400 mt-4">You'll be notified about appointments, reports, and updates here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Show only one notification at a time */}
      {notifications.slice(0, 1).map((notif) => (
        <div
          key={notif._id}
          className={`p-6 rounded-2xl border-2 transition-all ${
            notif.read
              ? "bg-gray-50 border-gray-200"
              : "bg-[#1E88E5]/10 border-[#1E88E5] shadow-lg"
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <h4 className="text-xl font-bold">{notif.title}</h4>
                {!notif.read && (
                  <span className="bg-[#1E88E5] text-white px-3 py-1 rounded-full text-sm font-bold">
                    NEW
                  </span>
                )}
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">{notif.message}</p>
              <p className="text-gray-500 mt-4">
                {new Date(notif.createdAt).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {!notif.read && (
              <button
                onClick={() => {
                  setNotifications(notifications.map(n => 
                    n._id === notif._id ? { ...n, read: true } : n
                  ));
                }}
                className="ml-4 text-red-500 hover:text-red-600 text-sm"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      ))}
      
      {/* Show remaining count and mark all as read button */}
      {notifications.length > 1 && (
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl mt-4">
          <p className="text-gray-600">
            {notifications.length - 1} more notification{notifications.length - 1 > 1 ? 's' : ''}
          </p>
          <button
            onClick={() => {
              const readNotifications = notifications.map(n => ({ ...n, read: true }));
              setNotifications(readNotifications);
            }}
            className="px-4 py-2 bg-[#0F9D76] text-white rounded-lg hover:bg-[#0d8a66] font-medium"
          >
            Mark All as Read
          </button>
        </div>
      )}
    </div>
  );
}
