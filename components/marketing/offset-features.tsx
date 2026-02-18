"use client";

import { UploadCloud, Layers, FileText, Youtube, Sparkles, ArrowRight, PlayCircle, Users, MousePointer2 } from "lucide-react";

export function OffsetFeatures() {
    return (
        <section className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

                {/* Feature 1: Ingestion */}
                <div className="group h-full">
                    <div className="bg-white border border-black overflow-hidden shadow-sm hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 h-full flex flex-col hover:-translate-y-1">
                        <div className="p-6 pb-0 flex-grow">
                            <div className="flex justify-between items-start mb-4 border-b border-neutral-100 pb-4">
                                <h3 className="uppercase text-xs text-neutral-500 tracking-wide font-mono">01. Ingestion</h3>
                                <UploadCloud className="w-5 h-5 text-black" strokeWidth={1.5} />
                            </div>
                            <h4 className="text-xl font-medium tracking-tight mb-3 font-serif">Universal Format Recognition</h4>
                            <p className="font-mono text-xs md:text-sm leading-relaxed text-neutral-700 mb-6">
                                Upload PDFs, websites, YouTube videos, and audio. Offset generates comprehensive summaries automatically.
                            </p>
                        </div>

                        {/* Illustration: Ingestion Hub */}
                        <div className="bg-neutral-50 border-t border-black h-40 relative overflow-hidden flex items-center justify-center mt-auto" style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
                            {/* Orbit Rings */}
                            <div className="absolute w-40 h-40 border border-neutral-300 rounded-full opacity-50"></div>

                            {/* Center Hub */}
                            <div className="relative z-10 w-12 h-12 bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                                <Layers className="w-5 h-5 text-black" strokeWidth={1.5} />
                            </div>

                            {/* Floating Files */}
                            <div className="absolute top-6 left-8 bg-white border border-black p-1 shadow-sm transform -rotate-6">
                                <FileText className="w-3 h-3 text-neutral-500" strokeWidth={1.5} />
                            </div>
                            <div className="absolute bottom-8 right-8 bg-white border border-black p-1 shadow-sm transform rotate-12">
                                <Youtube className="w-3 h-3 text-neutral-500" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature 2: Transformation */}
                <div className="group h-full">
                    <div className="bg-white border border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 h-full flex flex-col hover:-translate-y-1">
                        <div className="p-6 pb-0 flex-grow relative z-10">
                            <div className="flex justify-between items-start mb-4 border-b border-neutral-200 pb-4">
                                <h3 className="uppercase text-xs text-neutral-500 tracking-wide font-mono">02. Synthesis</h3>
                                <Sparkles className="w-5 h-5 text-black" strokeWidth={1.5} />
                            </div>
                            <h4 className="text-xl font-medium tracking-tight mb-3 font-serif">Generative Workflow Output</h4>
                            <p className="font-mono text-xs md:text-sm leading-relaxed text-neutral-800 mb-6">
                                Transform content into anything: audio summaries, video presentations, or detailed mind maps instantly.
                            </p>
                        </div>

                        {/* Illustration: Transformation Pipeline */}
                        <div className="bg-neutral-50 border-t border-black h-40 relative overflow-hidden flex flex-col items-center justify-center p-4 mt-auto">
                            <div className="flex items-center gap-2 w-full justify-center">
                                {/* Input */}
                                <div className="w-16 h-14 bg-white border border-black flex flex-col p-1.5 shadow-sm gap-1">
                                    <div className="w-8 h-1.5 bg-neutral-200"></div>
                                    <div className="w-full h-0.5 bg-neutral-100"></div>
                                    <div className="w-full h-0.5 bg-neutral-100"></div>
                                </div>

                                {/* Process Arrow */}
                                <div className="w-8 h-px bg-black relative flex items-center justify-center">
                                    <div className="bg-black text-white p-0.5 rounded-full">
                                        <ArrowRight className="w-2.5 h-2.5" strokeWidth={1.5} />
                                    </div>
                                </div>

                                {/* Output Options */}
                                <div className="relative">
                                    <div className="absolute top-1 left-1 w-16 h-14 bg-white border border-black z-0"></div>
                                    <div className="relative w-16 h-14 bg-white border border-black z-10 flex flex-col items-center justify-center shadow-sm">
                                        <PlayCircle className="w-4 h-4 text-black mb-1" strokeWidth={1.5} />
                                        <span className="font-mono text-[6px] uppercase tracking-wider">Video</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature 3: Collaboration */}
                <div className="group h-full">
                    <div className="bg-white border border-black overflow-hidden shadow-sm hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 h-full flex flex-col hover:-translate-y-1">
                        <div className="p-6 pb-0 flex-grow">
                            <div className="flex justify-between items-start mb-4 border-b border-neutral-100 pb-4">
                                <h3 className="font-mono text-xs uppercase tracking-wide text-neutral-500">03. Cooperation</h3>
                                <Users className="w-5 h-5 text-black" strokeWidth={1.5} />
                            </div>
                            <h4 className="text-xl font-medium tracking-tight mb-3 font-serif">Collective Knowledge</h4>
                            <p className="font-mono text-xs md:text-sm leading-relaxed text-neutral-700 mb-6">
                                Collaborate seamlessly on your canvas. Share with teammates and enable real-time cooperation.
                            </p>
                        </div>

                        {/* Illustration: Multi-cursor Canvas */}
                        <div className="bg-neutral-50 border-t border-black h-40 relative overflow-hidden group-hover:bg-neutral-100 transition-colors mt-auto">
                            {/* Abstract Document Interface */}
                            <div className="absolute top-6 left-6 right-6 bottom-0 bg-white border-x border-t border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] p-3">
                                <div className="space-y-1.5">
                                    <div className="w-3/4 h-1.5 bg-neutral-100"></div>
                                    <div className="w-1/2 h-1.5 bg-neutral-100"></div>
                                    <div className="w-full h-1.5 bg-neutral-100"></div>
                                </div>
                            </div>

                            {/* Cursor 1 (User) */}
                            <div className="absolute top-16 left-10 transition-transform duration-700 ease-in-out group-hover:translate-x-2 group-hover:translate-y-1">
                                <MousePointer2 className="w-4 h-4 fill-black text-black" strokeWidth={1.5} />
                            </div>

                            {/* Cursor 2 (Collaborator) */}
                            <div className="absolute top-20 right-10 transition-transform duration-500 ease-in-out group-hover:-translate-x-4 group-hover:-translate-y-2">
                                <MousePointer2 className="w-4 h-4 fill-neutral-400 text-neutral-400" strokeWidth={1.5} />
                                <div className="bg-neutral-400 text-white text-[8px] font-mono px-1 py-0 ml-2 rounded-sm shadow-sm">Sarah</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
