"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { web3 } from "@coral-xyz/anchor";
import { truncateAddress } from "@/web3";

type HolderNode = {
  id: string;
  address: string;
  role: string;
  percentage: number;
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
};

type BubbleMapModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tokenName: string;
  holders: Array<{
    address: web3.PublicKey;
    uiAmount: number | null;
    isDev: boolean;
    isBoundingCurve: boolean;
    isBoundingCurveReserve: boolean;
  }>;
  totalSupply: number;
};

export default function BubbleMapModal({
  isOpen,
  onClose,
  tokenName,
  holders,
  totalSupply,
}: BubbleMapModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<HolderNode | null>(null);

  useEffect(() => {
    if (!isOpen || !canvasRef.current || !holders.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize nodes
    const width = canvas.width;
    const height = canvas.height;
    
    const nodes: HolderNode[] = holders.map((h, i) => {
      const percentage = (h.uiAmount! / totalSupply) * 100;
      // Scale radius: min 20, max 80 based on log percentage
      const radius = Math.max(15, Math.min(70, Math.sqrt(percentage) * 15));
      
      const role = h.isDev ? "Developer" : h.isBoundingCurve || h.isBoundingCurveReserve ? "Bonding Curve" : "Holder";
      const color = h.isDev ? "#FACC15" : h.isBoundingCurve || h.isBoundingCurveReserve ? "#38BDF8" : "#94A3B8";

      return {
        id: h.address.toBase58(),
        address: truncateAddress(h.address.toBase58()),
        role,
        percentage,
        radius,
        x: width / 2 + (Math.random() - 0.5) * 100,
        y: height / 2 + (Math.random() - 0.5) * 100,
        vx: 0,
        vy: 0,
        color,
      };
    });

    let animationId: number;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Physics: Center gravity & collision
      nodes.forEach((node) => {
        // Gravity to center
        node.vx += (width / 2 - node.x) * 0.001;
        node.vy += (height / 2 - node.y) * 0.001;

        // Friction
        node.vx *= 0.95;
        node.vy *= 0.95;

        // Apply velocity
        node.x += node.vx;
        node.y += node.vy;

        // Collision detection against other nodes
        nodes.forEach((other) => {
          if (node === other) return;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = node.radius + other.radius + 5;

          if (distance < minDistance) {
            const angle = Math.atan2(dy, dx);
            const targetX = node.x + Math.cos(angle) * minDistance;
            const targetY = node.y + Math.sin(angle) * minDistance;
            const ax = (targetX - other.x) * 0.05;
            const ay = (targetY - other.y) * 0.05;
            node.vx -= ax;
            node.vy -= ay;
            other.vx += ax;
            other.vy += ay;
          }
        });
      });

      // Draw connections (subtle)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      nodes.forEach((node, i) => {
        if (i < 5) { // Only top 5 connect to center slightly
           ctx.beginPath();
           ctx.moveTo(node.x, node.y);
           ctx.lineTo(width/2, height/2);
           ctx.stroke();
        }
      });

      // Draw bubbles
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = node.color + "44";
        
        ctx.fillStyle = node.color + "22"; // Translucent body
        ctx.fill();
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = node.color;
        ctx.stroke();

        // Label (shortened)
        if (node.radius > 25) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 10px Inter";
          ctx.textAlign = "center";
          ctx.fillText(node.percentage.toFixed(1) + "%", node.x, node.y + 4);
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        let found = false;
        nodes.forEach(node => {
            const dx = mouseX - node.x;
            const dy = mouseY - node.y;
            if (Math.sqrt(dx*dx + dy*dy) < node.radius) {
                setHoveredNode(node);
                found = true;
            }
        });
        if (!found) setHoveredNode(null);
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isOpen, holders, totalSupply]);

  return (
    <Transition
      show={isOpen}
      as="div"
    >
      <Dialog
        as="div"
        className="relative z-50 focus:outline-none text-white font-sans"
        onClose={onClose}
      >
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-8 shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">
                        {tokenName} Holder Map
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                        Visual audit of Top 20 distribution (Beta)
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="relative aspect-video rounded-2xl bg-zinc-900/50 border border-white/5 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={450}
                    className="w-full h-full cursor-crosshair"
                  />
                  
                  {hoveredNode && (
                    <div 
                        className="absolute z-60 pointer-events-none bg-zinc-950/90 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md"
                        style={{ 
                            left: `${(hoveredNode.x / 800) * 100}%`,
                            top: `${(hoveredNode.y / 450) * 100}%`,
                            transform: 'translate(-50%, -120%)'
                        }}
                    >
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{hoveredNode.role}</p>
                        <p className="font-mono text-sm">{hoveredNode.id}</p>
                        <p className="text-xl font-bold text-primary mt-1">{hoveredNode.percentage.toFixed(2)}%</p>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#FACC15]" />
                        <span className="text-zinc-400">Developer</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                        <span className="text-zinc-400">Bonding Curve</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                        <span className="text-zinc-400">Holders</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="btn bg-white text-black px-8"
                    >
                        Close Map
                    </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
