"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoMdArrowBack,
} from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { usePathname, useRouter } from "next/navigation";
import Pusher from "pusher-js";
import { useNotifications } from "@/app/SimpleProvider";
import { Toaster } from "react-hot-toast";
import { API_BASE } from "@/lib/apiConfig";

const PAGE_SIZE = 10;

export default function NotificationsPage() {
  const { unreadCount, notifications, setNotifications, markAllNotificationsAsRead } = useNotifications();

  const pathname = usePathname();
  const pathParts = (pathname || "/").split("/").filter(Boolean);
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || "";
  const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "";

  // Total items
  const totalItems = notifications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const startIdx = (currentPage - 1) * PAGE_SIZE;

  // Slice current page items
  const pageItems = useMemo(() => {
    return notifications.slice(startIdx, startIdx + PAGE_SIZE).map((n, i) => ({
      ...n,
      __localIdx: startIdx + i, // fallback id
    }));
  }, [startIdx, notifications]);

  // Page number list
  const pageList = useMemo(() => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const out = [];
    const left = Math.max(2, currentPage - 2);
    const right = Math.min(totalPages - 1, currentPage + 2);
    out.push(1);
    if (left > 2) out.push("…");
    for (let i = left; i <= right; i++) out.push(i);
    if (right < totalPages - 1) out.push("…");
    out.push(totalPages);
    return out;
  }, [currentPage, totalPages]);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // Normalize notification payload
  function normalizePayload(data) {
    const id =
      data.id ||
      data._id ||
      data.notificationId ||
      data.notification_id ||
      `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
      id,
      title: data.title || data.message || "Notification",
      details: data.details || data.body || "",
      time: data.time || data.createdAt || new Date().toISOString(),
      status: data.status || "unread",
    };
  }

  // // Fetch notifications initially
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) return;

  //   async function fetchNotifications() {
  //     try {
  //       const res = await fetch(
  //         `${API_BASE}/api/notifications`,
  //         {
  //           method: "GET",
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       // if (!res.ok) throw new Error("Failed to fetch notifications");
  //       console.log("#### RES", res);
  //       const data = await res.json();

  //       setNotifications(data?.notifications || []);
  //     } catch (err) {
  //       console.error("Notification fetch failed:", err);
  //     }
  //   }

  // //   fetchNotifications();
  // // }, [notifications]);

  // ✅ Mark all as read when page mounts
  useEffect(() => {
    markAllNotificationsAsRead();
  }, []);

  // Pusher setup
  useEffect(() => {
    if (!PUSHER_KEY || !PUSHER_CLUSTER) return;

    const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
    const channel = pusher.subscribe("notifications");

    channel.bind("new-notification", (rawData) => {
      try {
        const item = normalizePayload(rawData);
        setNotifications((prev) => [item, ...prev]);
        setCurrentPage(1);
      } catch (e) {
        console.error("Failed to handle notification payload:", e);
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("notifications");
      pusher.disconnect();
    };
  }, [PUSHER_KEY, PUSHER_CLUSTER, setNotifications]);

  // ✅ Fixed Delete Function (backend + UI sync)
  async function handleDelete() {
    if (!confirmId) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User not authenticated. Please login again.");
        return;
      }

      const id = confirmId;

      const response = await fetch(
        `${API_BASE}/admin/notification/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      console.log("Delete response:", result);

      if (!response.ok) {
        console.error("Delete failed:", result);
        alert("Failed to delete notification!");
        return;
      }

      // Remove from UI
      setNotifications((prev) =>
        prev.filter(
          (n) =>
            n.id !== id &&
            n._id !== id &&
            n.notification_id !== id &&
            n.__localIdx !== id
        )
      );

      console.log(`Notification ${id} deleted successfully`);
      setConfirmId(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Something went wrong while deleting!");
    } finally {
      setDeleting(false);
    }
  }

  // Time converter
  function timeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 1000 / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHour < 24) return `${diffHour} hours ago`;
    return `${diffDay} days ago`;
  }

  return (
    <div className="w-full p-7 bg-white overflow-x-auto rounded-[10px]">
      <Toaster position="top-center" />
      {/* Header */}
      <div className="flex items-center gap-[14px]">
        <IoMdArrowBack
          onClick={() => router.back()}
          className="w-6 h-6 text-[#015093]"
        />
        <h3 className="text-[#333333] text-[20px] font-inter font-semibold capitalize">
          {pathParts[0] || "Notifications"}
        </h3>
      </div>

      {/* Total and Mark as Read */}
      <div className="flex items-center justify-between mt-[21px]">
        <p className="text-[#333333] text-[16px] font-inter font-semibold">
          Total {unreadCount} Unread Notifications ({totalItems} Total)
        </p>
        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="text-[#015093] text-[16px] font-inter font-semibold hover:underline cursor-pointer"
          >
            Mark all as Read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="mt-6">
        {pageItems.map((item) => (
          <div
            key={item.id || item.__localIdx}
            className="w-full hover:bg-[#CCDCE9] transition-all duration-300 py-3 px-[25px]"
          >
            <div className="w-full flex items-center gap-4">
              <p className="w-[80%] text-[#333333] text-[16px] font-inter font-semibold">
                {item.message || item.title}{" "}
                <span className="font-normal">{item.details}</span>
              </p>

              <p className="w-[10%] flex justify-end text-[#5C5C5C] text-[16px] font-inter whitespace-nowrap">
                {timeAgo(item.time || item.createdAt)}
              </p>

              <div className="w-[10%] flex justify-end">
                <RiDeleteBin6Line
                  className="w-6 h-6 text-[#DC4600] cursor-pointer"
                  title="Delete"
                  onClick={() =>
                    setConfirmId(item._id || item.id || item.__localIdx)
                  }
                />
              </div>
            </div>
          </div>
        ))}

        {pageItems.length === 0 && (
          <div className="py-6 text-center text-gray-500">No notifications</div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-20 flex justify-center">
        <nav className="inline-flex items-center gap-4">
          <button
            onClick={goPrev}
            disabled={currentPage === 1}
            className="text-[#333333] flex items-center gap-4 font-inter text-[16px] disabled:opacity-40"
          >
            <IoIosArrowBack /> Previous
          </button>

          {pageList.map((p, i) =>
            p === "…" ? (
              <span key={`dots-${i}`} className="px-2 text-slate-500">
                …
              </span>
            ) : (
              <button
                key={`page-${p}`}
                onClick={() => setCurrentPage(p)}
                className={`w-[30px] h-[30px] rounded-full font-inter text-[16px] flex items-center justify-center ${
                  p === currentPage
                    ? "bg-[#015093] text-white"
                    : "text-[#333333] hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={goNext}
            disabled={currentPage === totalPages}
            className="text-[#333333] flex items-center gap-4 font-inter text-[16px] disabled:opacity-40"
          >
            Next <IoIosArrowForward />
          </button>
        </nav>
      </div>

      {/* Confirm Delete Modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-[#333333] mb-2 font-inter">
              Are you sure you want to delete this notification?
            </h2>
            <p className="text-sm text-slate-600 mb-4 font-inter">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 font-inter cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-md bg-[#DC4600] text-white hover:bg-[#DC4600]/90 disabled:opacity-50 font-inter cursor-pointer"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
