"use client";

import { useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";

export default function HomePage() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY); // Public Key aus der .env-Datei

  // Funktion, um den Anruf zu starten und zu stoppen
  const handleCall = async () => {
    if (isCallActive) {
      vapi.stop();
      setIsCallActive(false);
      setLoading(false);
    } else {
      try {
        setLoading(true); // Ladeanimation anzeigen

        // Überprüfen, ob das Mikrofon stummgeschaltet ist
        if (vapi.isMuted()) {
          console.log("Mikrofon ist stummgeschaltet. Schalte Mikrofon ein.");
          vapi.setMuted(false); // Mikrofon aktivieren
        }

        // Assistenten starten (ohne manuelle Transkriptor-Konfiguration, da das Dashboard verwendet wird)
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID);

        setIsCallActive(true);
        setLoading(false);
      } catch (error) {
        console.error("Failed to start Vapi call:", error);
        alert("Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const handleMessage = (message) => {
      // Nachrichten debuggen
      console.log("Empfangene Nachricht:", message);

      if (message && message.content) {
        setText((prev) => prev + "\n" + message.content); // Nachrichten anzeigen
      } else {
        console.warn("Received undefined or empty message:", message);
      }
    };

    const handleCallStart = () => {
      console.log("Call started.");
    };

    const handleCallEnd = () => {
      console.log("Call ended.");
      setIsCallActive(false);
    };

    vapi.on("message", handleMessage);
    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);

    return () => {
      vapi.off("message", handleMessage);
      vapi.off("call-start", handleCallStart);
      vapi.off("call-end", handleCallEnd);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-[#44474c]">
      {/* Mikrofon-Button */}
      <button
        onClick={handleCall}
        className={`w-20 h-20 ${isCallActive ? "bg-[#e3dafe]" : "bg-[#3d0089]"} rounded-full flex items-center justify-center`}
      >
        <img src="/microphone-solid.svg" alt="Microphone" className="w-10 h-10" />
      </button>

      {/* Ladeanimation */}
      {loading && <div className="spinner mt-4"></div>}

      {/* Call-Status-Anzeige */}
      <p className="mt-4 text-[#44474c]">
        {isCallActive
          ? "Anruf läuft... zum Stoppen klicken."
          : "Klicken Sie hier, um einen Anruf zu starten."}
      </p>

      {/* Chat-Verlauf */}
      <div className="mt-6 p-4 w-80 h-40 border border-gray-300 rounded overflow-y-auto bg-gray-100">
        {text
          ? text.split("\n").map((line, index) => (
              <p key={index} className="text-[#44474c]">
                {line}
              </p>
            ))
          : <p className="text-[#44474c]">Keine Nachrichten verfügbar</p>}
      </div>
    </div>
  );
}
