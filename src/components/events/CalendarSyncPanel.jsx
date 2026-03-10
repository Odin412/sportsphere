import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Copy, CheckCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function CalendarSyncPanel({ open, onClose, webcalUrl, calendarName }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(webcalUrl);
    setCopied(true);
    toast.success("Calendar URL copied!");
    setTimeout(() => setCopied(false), 3000);
  };

  // Convert https:// to webcal:// for subscription
  const webcalSchemeUrl = webcalUrl.replace(/^https?:\/\//, "webcal://");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-black flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-600" /> Calendar Sync
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <p className="text-sm text-gray-600">
            Subscribe to <strong>{calendarName || "this schedule"}</strong> and it will auto-update in your calendar app.
          </p>

          {/* URL field + copy */}
          <div className="flex gap-2">
            <Input
              readOnly
              value={webcalUrl}
              className="rounded-xl text-xs bg-gray-50 font-mono"
              onClick={e => e.target.select()}
            />
            <Button
              onClick={handleCopy}
              variant="outline"
              className="rounded-xl flex-shrink-0 gap-1.5"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          {/* Quick subscribe button */}
          <a href={webcalSchemeUrl} className="block">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold gap-2">
              <Calendar className="w-4 h-4" /> Subscribe in Calendar App
            </Button>
          </a>

          {/* Platform instructions */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">How to add manually</h4>

            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              <p className="text-sm font-bold text-gray-900">Google Calendar</p>
              <ol className="text-xs text-gray-600 space-y-0.5 list-decimal list-inside">
                <li>Open Google Calendar on desktop</li>
                <li>Click "+" next to "Other calendars"</li>
                <li>Select "From URL"</li>
                <li>Paste the URL above and click "Add calendar"</li>
              </ol>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              <p className="text-sm font-bold text-gray-900">Apple Calendar</p>
              <ol className="text-xs text-gray-600 space-y-0.5 list-decimal list-inside">
                <li>Open Calendar app</li>
                <li>File → New Calendar Subscription</li>
                <li>Paste the URL above</li>
                <li>Click Subscribe</li>
              </ol>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              <p className="text-sm font-bold text-gray-900">Outlook</p>
              <ol className="text-xs text-gray-600 space-y-0.5 list-decimal list-inside">
                <li>Open Outlook Calendar</li>
                <li>Add Calendar → Subscribe from web</li>
                <li>Paste the URL above</li>
              </ol>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 text-center">
            This calendar auto-updates. Changes to the schedule will appear within a few hours.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
