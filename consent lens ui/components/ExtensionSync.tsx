"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ExtensionSync() {
    useEffect(() => {
        supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                // Send a message that the extension content script can hear
                window.postMessage({
                    type: "CONSENTLENS_SYNC_ID",
                    userId: session.user.id
                }, "*");
            }
        });

        // Also check current session immediately
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                window.postMessage({
                    type: "CONSENTLENS_SYNC_ID",
                    userId: session.user.id
                }, "*");
            }
        });
    }, []);

    return null;
}
