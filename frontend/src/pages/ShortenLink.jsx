// src/pages/ShortenLink.jsx
import React, { useState } from "react";
import { FaLink, FaClipboard, FaQrcode } from "react-icons/fa";
import Input from "../components/Input";
import Button from "../components/Button";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";

// QR Placeholder
const QRCodePlaceholder = ({ shortUrl }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
    <FaQrcode className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-2" />
    <p className="text-sm text-gray-500 dark:text-gray-400 break-words">
      QR for: {shortUrl}
    </p>
    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
      [QR Code Placeholder]
    </p>
  </div>
);

const ShortenLink = () => {
  const [longUrl, setLongUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [shortenedLink, setShortenedLink] = useState(null);
  const [loading, setLoading] = useState(false);

  // Backend base URL for redirect links
  const backendBase =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShortenedLink(null);

    try {
      const payload = {
        originalUrl: longUrl.trim(),   // ✅ MUST MATCH BACKEND
        customAlias: alias ? alias.trim() : undefined,
        adType: "pop"                  // ✅ VALID ENUM
      };

      const res = await axiosInstance.post("/links/create", payload);

      const code =
        res?.data?.link?.customAlias || res?.data?.link?.shortCode;

      if (!code) {
        toast.error("Short code missing from response");
        return;
      }

      const finalShortUrl = `${backendBase}/r/${code}`;
      setShortenedLink(finalShortUrl);

      toast.success("Link successfully shortened!");
    } catch (error) {
      console.error("Shortening failed:", error);
      toast.error(
        error?.response?.data?.message || "Failed to shorten link"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shortenedLink) {
      navigator.clipboard.writeText(shortenedLink);
      toast.info("Short link copied!");
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl">
        <h2 className="text-center text-3xl font-bold text-purple-700 mb-8">
          Shorten A New Link
        </h2>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Long URL"
              type="url"
              placeholder="https://example.com"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              required
            />

            <Input
              label="Optional Custom Alias"
              placeholder="my-custom-link"
              value={alias}
              onChange={(e) =>
                setAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))
              }
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              <FaLink className="mr-2" /> Shorten Link
            </Button>
          </form>

          {shortenedLink && (
            <div className="mt-10 pt-6 border-t border-gray-300 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Your Shortened Link:
              </h3>

              <div className="flex flex-col md:flex-row gap-4 items-stretch">
                <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-between">
                  <a
                    href={shortenedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-mono text-purple-700 dark:text-purple-300 truncate hover:underline"
                  >
                    {shortenedLink}
                  </a>
                </div>

                <Button
                  onClick={handleCopy}
                  variant="secondary"
                  className="flex-shrink-0 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300"
                >
                  <FaClipboard className="mr-2" /> Copy
                </Button>
              </div>

              <div className="mt-6 max-w-xs mx-auto">
                <QRCodePlaceholder shortUrl={shortenedLink} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShortenLink;
