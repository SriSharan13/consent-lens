"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Chrome, Download, MousePointer2, Settings2, FolderOpen } from "lucide-react";

interface InstallExtensionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function InstallExtensionModal({
    open,
    onOpenChange,
}: InstallExtensionModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md border-white/[0.08] bg-[#0c0c12]/95 backdrop-blur-xl">
                <DialogHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Chrome className="h-6 w-6" />
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                        How to Install ConsentLens
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Follow these simple steps to add the extension to your Chrome browser.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-6">
                    <div className="space-y-4">
                        <Step
                            icon={<Download className="h-4 w-4" />}
                            title="1. Locate Extension Folder"
                            description="Find the 'consent lens' folder in your project directory."
                        />
                        <Step
                            icon={<Settings2 className="h-4 w-4" />}
                            title="2. Open Extensions Page"
                            description={
                                <>
                                    Type <code className="rounded bg-white/5 px-1.5 py-0.5 text-primary">chrome://extensions</code> in your address bar and press Enter.
                                </>
                            }
                        />
                        <Step
                            icon={<MousePointer2 className="h-4 w-4" />}
                            title="3. Enable Developer Mode"
                            description="Toggle the 'Developer mode' switch in the top right corner of the extension page."
                        />
                        <Step
                            icon={<FolderOpen className="h-4 w-4" />}
                            title="4. Load Unpacked"
                            description="Click the 'Load unpacked' button and select the 'consent lens' folder."
                        />
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                        <p className="text-[13px] leading-relaxed text-muted-foreground">
                            <span className="font-medium text-foreground text-accent">Note:</span> Real-time analysis requires the backend to be running. Make sure your FastAPI server is active at 127.0.0.1:8000.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function Step({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
}) {
    return (
        <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-primary">
                {icon}
            </div>
            <div className="space-y-1">
                <h4 className="text-[14px] font-semibold text-foreground">
                    {title}
                </h4>
                <div className="text-[13px] leading-relaxed text-muted-foreground">
                    {description}
                </div>
            </div>
        </div>
    );
}
