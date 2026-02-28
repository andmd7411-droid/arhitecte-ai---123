import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Code2, Layout, Type, Square, MousePointer2, Copy, Check, Download,
    Trash2, RotateCcw, Sparkles, Zap, Box, ArrowUp, ArrowDown, ChevronDown,
    Play, Upload, Undo2, Redo2, Image, ToggleLeft, AlignLeft, AlignCenter,
    AlignRight, Palette, Columns, Wand2, Sun, Moon, RefreshCw, Globe,
    Search, FolderOpen, Save, ZoomIn, ZoomOut, X, MessageSquare, Activity,
    CheckCircle2, AlertTriangle, Send, ShoppingBag, User, Calendar,
    LayoutList, Terminal, Waves, PenTool, Layers, Settings2, Smartphone, Monitor, Tablet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Types ────────────────────────────────────────────────────────────────────

type ElementType = 'button' | 'input' | 'card' | 'text' | 'navbar' | 'hero' | 'image' | 'badge' | 'toggle' | 'select' | 'textarea' | 'divider';

interface ElementProps {
    bg?: string; color?: string; borderColor?: string;
    fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
    align?: 'left' | 'center' | 'right';
    radius?: number; padding?: number;
    width?: 'auto' | 'full' | 'half';
    imageUrl?: string; badgeColor?: string;
    columns?: 1 | 2 | 3;
    // Professional Tokens
    blur?: number;
    opacity?: number;
    shadow?: 'none' | 'soft' | 'medium' | 'deep' | 'glow';
    gradient?: string;
    animation?: 'none' | 'fadeIn' | 'slideUp' | 'scalePop' | 'rotateIn';
    animationDuration?: number;
}

interface CanvasElement {
    id: string;
    type: ElementType;
    label: string;
    props: ElementProps;
}

type Theme = 'dark' | 'light' | 'purple' | 'ocean' | 'sunset' | 'glass';

interface BrandKit {
    primary: string;
    secondary: string;
    accent: string;
    radius: number;
    font: 'sans' | 'mono' | 'serif' | 'display';
    glass: boolean;
}

interface AppState {
    elements: CanvasElement[];
    theme: Theme;
    columns: 1 | 2 | 3;
    brand: BrandKit;
}

interface Project {
    id: string;
    name: string;
    icon: any;
    state: AppState;
    savedAt: string;
}

// ─── Themes ───────────────────────────────────────────────────────────────────

const THEMES: Record<Theme, { bg: string; surface: string; border: string; accent: string; text: string; label: string }> = {
    dark: { bg: '#0A0A0B', surface: '#0D0D0F', border: 'rgba(255,255,255,0.05)', accent: '#a855f7', text: '#ffffff', label: 'Dark' },
    light: { bg: '#f4f4f5', surface: '#ffffff', border: 'rgba(0,0,0,0.08)', accent: '#6366f1', text: '#09090b', label: 'Light' },
    purple: { bg: '#120820', surface: '#1a0d2e', border: 'rgba(168,85,247,0.15)', accent: '#e879f9', text: '#ffffff', label: 'Purple' },
    ocean: { bg: '#071520', surface: '#0c1f30', border: 'rgba(56,189,248,0.12)', accent: '#38bdf8', text: '#ffffff', label: 'Ocean' },
    sunset: { bg: '#180c08', surface: '#221209', border: 'rgba(251,146,60,0.15)', accent: '#fb923c', text: '#ffffff', label: 'Sunset' },
    glass: { bg: 'rgba(10,10,11,0.9)', surface: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', accent: '#06b6d4', text: '#ffffff', label: 'Glass' },
};

const THEME_ICONS: Record<Theme, typeof Moon> = { dark: Moon, light: Sun, purple: Sparkles, ocean: Globe, sunset: Palette, glass: Wand2 };

// ─── Component registry ───────────────────────────────────────────────────────

const COMPONENT_REGISTRY: { type: ElementType; icon: typeof Box; label: string; group: string }[] = [
    { type: 'button', icon: Square, label: 'Button', group: 'Basic' },
    { type: 'input', icon: Type, label: 'Input', group: 'Basic' },
    { type: 'textarea', icon: AlignLeft, label: 'Textarea', group: 'Basic' },
    { type: 'text', icon: Type, label: 'Text', group: 'Basic' },
    { type: 'select', icon: ChevronDown, label: 'Select', group: 'Basic' },
    { type: 'toggle', icon: ToggleLeft, label: 'Toggle', group: 'Basic' },
    { type: 'badge', icon: Zap, label: 'Badge', group: 'Basic' },
    { type: 'divider', icon: AlignCenter, label: 'Divider', group: 'Basic' },
    { type: 'card', icon: Layout, label: 'Card', group: 'Layout' },
    { type: 'navbar', icon: Layers, label: 'Navbar', group: 'Layout' },
    { type: 'hero', icon: Monitor, label: 'Hero', group: 'Layout' },
    { type: 'image', icon: Image, label: 'Image', group: 'Media' },
];

const defaultProps: ElementProps = { bg: '', color: '', borderColor: '', fontSize: 'base', align: 'left', radius: 16, padding: 4, width: 'full', blur: 0, opacity: 100, shadow: 'none', animation: 'none', animationDuration: 0.5 };

const TEMPLATE_REGISTRY: { label: string; icon: typeof Layout; elements: CanvasElement[] }[] = [
    {
        label: 'Pricing Table', icon: Layout,
        elements: [
            { id: 'T1-1', type: 'hero', label: 'Choose Your Plan', props: { ...defaultProps, align: 'center', shadow: 'soft' } },
            { id: 'T1-2', type: 'card', label: 'Starter - $9', props: { ...defaultProps, shadow: 'medium', blur: 5, bg: 'rgba(255,255,255,0.05)' } },
            { id: 'T1-3', type: 'button', label: 'Get Started', props: { ...defaultProps, radius: 30 } },
        ]
    },
    {
        label: 'Glass Navbar', icon: Layers,
        elements: [
            { id: 'T2-1', type: 'navbar', label: 'ARCHITECT AI', props: { ...defaultProps, blur: 15, bg: 'rgba(255,255,255,0.03)', shadow: 'glow', radius: 0 } },
        ]
    },
    {
        label: 'Pro Hero', icon: Monitor,
        elements: [
            { id: 'T3-1', type: 'hero', label: 'Design the Future', props: { ...defaultProps, gradient: 'from-purple-600 to-blue-600', color: '#fff', animation: 'slideUp' } },
        ]
    }
];

const defaultLabel: Record<ElementType, string> = {
    button: 'Click Me', input: 'Enter value...', textarea: 'Write something...', text: 'Sample Text',
    select: 'Choose option', toggle: 'Enable feature', badge: 'New', divider: '',
    card: 'Card Title', navbar: 'My App', hero: 'Welcome to My App', image: 'https://picsum.photos/600/300',
};

const PREMADE_PROJECTS: Project[] = [
    {
        id: 'P1', name: 'SaaS Power-Up', icon: Zap,
        state: {
            theme: 'dark', columns: 1,
            brand: { primary: '#a855f7', secondary: '#6366f1', accent: '#f472b6', radius: 16, font: 'sans', glass: true },
            elements: [
                { id: 'S1-1', type: 'navbar', label: 'NEURAL-LINK', props: { ...defaultProps, blur: 12, shadow: 'glow' } },
                { id: 'S1-2', type: 'hero', label: 'Scale Beyond Limits', props: { ...defaultProps, fontSize: '2xl', align: 'center' } },
                { id: 'S1-3', type: 'card', label: 'Ready to sync?', props: { ...defaultProps, shadow: 'soft' } },
                { id: 'S1-4', type: 'button', label: 'Get Started', props: { ...defaultProps, bg: '#a855f7' } }
            ]
        },
        savedAt: new Date().toISOString()
    },
    {
        id: 'P2', name: 'Glass Storefront', icon: ShoppingBag,
        state: {
            theme: 'glass', columns: 1,
            brand: { primary: '#0ea5e9', secondary: '#0284c7', accent: '#f472b6', radius: 24, font: 'sans', glass: true },
            elements: [
                { id: 'S2-1', type: 'navbar', label: 'MODERN-MINT', props: { ...defaultProps, blur: 20 } },
                { id: 'S2-2', type: 'card', label: 'Premium Watch', props: { ...defaultProps, shadow: 'deep' } },
                { id: 'S2-3', type: 'badge', label: 'Limited Edition', props: { ...defaultProps } },
                { id: 'S2-4', type: 'button', label: 'Buy Now', props: { ...defaultProps, bg: '#0ea5e9' } }
            ]
        },
        savedAt: new Date().toISOString()
    },
    {
        id: 'P3', name: 'Pro Portfolio', icon: User,
        state: {
            theme: 'dark', columns: 1,
            brand: { primary: '#fbbf24', secondary: '#f59e0b', accent: '#fff', radius: 12, font: 'display', glass: true },
            elements: [
                { id: 'S3-1', type: 'hero', label: 'Creative Architect', props: { ...defaultProps, align: 'center', fontSize: '2xl' } },
                { id: 'S3-2', type: 'card', label: 'Project Alpha', props: { ...defaultProps, shadow: 'medium' } },
                { id: 'S3-3', type: 'card', label: 'Project Beta', props: { ...defaultProps, shadow: 'medium' } },
                { id: 'S3-4', type: 'button', label: 'Contact Me', props: { ...defaultProps, bg: '#fbbf24', borderColor: '#fff' } }
            ]
        },
        savedAt: new Date().toISOString()
    },
    {
        id: 'P4', name: 'Event Landing', icon: Calendar,
        state: {
            theme: 'dark', columns: 1,
            brand: { primary: '#f43f5e', secondary: '#e11d48', accent: '#fff', radius: 20, font: 'display', glass: true },
            elements: [
                { id: 'S4-1', type: 'navbar', label: 'GEN-Z CON', props: { ...defaultProps, bg: '#f43f5e', shadow: 'soft' } },
                { id: 'S4-2', type: 'hero', label: 'The Future is Here', props: { ...defaultProps, align: 'center' } },
                { id: 'S4-3', type: 'button', label: 'Register Now', props: { ...defaultProps, bg: '#f43f5e' } }
            ]
        },
        savedAt: new Date().toISOString()
    },
    {
        id: 'P5', name: 'Crypto Dashboard', icon: LayoutList,
        state: {
            theme: 'sunset', columns: 1,
            brand: { primary: '#f97316', secondary: '#ea580c', accent: '#fff', radius: 10, font: 'mono', glass: true },
            elements: [
                { id: 'S5-1', type: 'hero', label: 'Yield Master', props: { ...defaultProps, gradient: 'from-orange-500 to-rose-500' } },
                { id: 'S5-2', type: 'card', label: 'Staking Pool', props: { ...defaultProps, shadow: 'deep' } },
                { id: 'S5-3', type: 'button', label: 'Connect Wallet', props: { ...defaultProps, bg: '#f97316' } }
            ]
        },
        savedAt: new Date().toISOString()
    },
    {
        id: 'P6', name: 'News Terminal', icon: Terminal,
        state: {
            theme: 'dark', columns: 1,
            brand: { primary: '#ef4444', secondary: '#333', accent: '#fff', radius: 4, font: 'mono', glass: false },
            elements: [
                { id: 'S6-1', type: 'navbar', label: 'DEV CHRONICLE', props: { ...defaultProps, bg: '#000', borderColor: '#333' } },
                { id: 'S6-2', type: 'badge', label: 'Breaking News', props: { ...defaultProps, bg: '#ef4444' } },
                { id: 'S6-3', type: 'card', label: 'AI becomes sentient', props: { ...defaultProps, shadow: 'medium' } }
            ]
        },
        savedAt: new Date().toISOString()
    },
    {
        id: 'P7', name: 'Oceanic Spa', icon: Waves,
        state: {
            theme: 'ocean', columns: 1,
            brand: { primary: '#0891b2', secondary: '#0e7490', accent: '#fff', radius: 40, font: 'serif', glass: true },
            elements: [
                { id: 'S7-1', type: 'hero', label: 'Breathe Deeply', props: { ...defaultProps, fontSize: '2xl', align: 'center' } },
                { id: 'S7-2', type: 'card', label: 'Detox Treatment', props: { ...defaultProps, padding: 24 } },
                { id: 'S7-3', type: 'button', label: 'Book Now', props: { ...defaultProps, bg: '#06b6d4' } }
            ]
        },
        savedAt: new Date().toISOString()
    },
    {
        id: 'P8', name: 'Minimalist Blog', icon: PenTool,
        state: {
            theme: 'light', columns: 1,
            brand: { primary: '#111', secondary: '#444', accent: '#000', radius: 0, font: 'serif', glass: false },
            elements: [
                { id: 'S8-1', type: 'navbar', label: 'THOUGHTS', props: { ...defaultProps, color: '#000' } },
                { id: 'S8-2', type: 'text', label: 'A collection of stories.', props: { ...defaultProps, fontSize: 'xl', align: 'left' } },
                { id: 'S8-3', type: 'divider', label: '', props: { ...defaultProps } }
            ]
        },
        savedAt: new Date().toISOString()
    },
    {
        id: 'P9', name: 'Purple Night', icon: Moon,
        state: {
            theme: 'purple', columns: 1,
            brand: { primary: '#a855f7', secondary: '#7e22ce', accent: '#fff', radius: 32, font: 'display', glass: true },
            elements: [
                { id: 'S9-1', type: 'navbar', label: 'NEON', props: { ...defaultProps, bg: '#581c87' } },
                { id: 'S9-2', type: 'card', label: 'Cyber Deck', props: { ...defaultProps, shadow: 'glow' } },
                { id: 'S9-3', type: 'button', label: 'Enter Matrix', props: { ...defaultProps, bg: '#a855f7', shadow: 'glow' } }
            ]
        },
        savedAt: new Date().toISOString()
    },
    {
        id: 'P10', name: 'Glass Admin', icon: Layout,
        state: {
            theme: 'dark', columns: 1,
            brand: { primary: '#3b82f6', secondary: '#1e40af', accent: '#60a5fa', radius: 12, font: 'sans', glass: true },
            elements: [
                { id: 'S10-1', type: 'navbar', label: 'OS-LINK', props: { ...defaultProps, blur: 16 } },
                { id: 'S10-2', type: 'card', label: 'System Health', props: { ...defaultProps, shadow: 'soft' } },
                { id: 'S10-3', type: 'badge', label: 'Online', props: { ...defaultProps, bg: '#10b981' } }
            ]
        },
        savedAt: new Date().toISOString()
    }
];

// ─── Code generators ──────────────────────────────────────────────────────────

function renderElementCode(el: CanvasElement, brand?: BrandKit): string {
    const p = el.props;
    const br = brand?.radius ?? p.radius ?? 16;
    const r = `rounded - [${br}px]`;
    const pa = `p - ${p.padding || 4} `;
    const fontClass = brand?.font === 'mono' ? 'font-mono' : brand?.font === 'serif' ? 'font-serif' : brand?.font === 'display' ? 'font-display' : '';

    switch (el.type) {
        case 'button': return `<button class="${pa} ${r} ${fontClass} ${getProfessionalStyles(p, brand)} bg-[${brand?.primary || '#4f46e5'}] hover:opacity-90 text-white font-bold transition-all">${el.label}</button>`;
        case 'input': return `<input class="w-full ${pa} ${r} ${fontClass} ${getProfessionalStyles(p, brand)} border border-white/10 bg-white/5 outline-none" placeholder="${el.label}" />`;
        case 'textarea': return `<textarea class="w-full ${pa} ${r} ${fontClass} ${getProfessionalStyles(p, brand)} border border-white/10 bg-white/5 outline-none" placeholder="${el.label}"></textarea>`;
        case 'text': return `<p class="${fontClass} ${getProfessionalStyles(p, brand)} text-[${p.fontSize || 'base'}] text-${p.align || 'left'}">${el.label}</p>`;
        case 'select': return `<select class="w-full ${pa} ${r} ${fontClass} ${getProfessionalStyles(p, brand)} border border-white/10 bg-white/5 outline-none"><option>${el.label}</option></select>`;
        case 'toggle': return `<div class="flex items-center gap-2 ${fontClass}"><div class="w-10 h-6 bg-white/20 rounded-full"></div><span>${el.label}</span></div>`;
        case 'badge': return `<span class="px-2 py-1 text-xs font-medium ${r} bg-[${p.bg || brand?.secondary || '#6366f1'}]/20 text-[${p.bg || brand?.secondary || '#6366f1'}] border border-[${p.bg || brand?.secondary || '#6366f1'}]/30">${el.label}</span>`;
        case 'divider': return `<hr class="border-white/10 my-4" />`;
        case 'card': return `<div class="p-6 ${r} ${fontClass} ${getProfessionalStyles(p, brand)} border border-white/10 bg-white/5"><h3 class="text-lg font-bold mb-2">${el.label}</h3><p class="text-white/60 text-sm">Sample content for this card component.</p></div>`;
        case 'navbar': return `<nav class="w-full ${pa} ${fontClass} ${getProfessionalStyles(p, brand)} border-b border-white/10 bg-white/5 flex items-center justify-between"><span class="font-bold text-xl">${el.label}</span><div class="flex gap-4"><span class="text-sm opacity-60">Home</span><span class="text-sm opacity-60">About</span></div></nav>`;
        case 'hero': return `<section class="w-full py-20 px-6 ${r} ${fontClass} ${getProfessionalStyles(p, brand)} text-${p.align || 'center'} bg-gradient-to-br ${p.gradient || 'from-white/5 to-white/0'} border border-white/10"><h1 class="text-4xl font-black mb-4">${el.label}</h1><p class="text-xl opacity-70 max-w-2xl mx-auto">Experience the next generation of digital architecture with our neural-driven design system.</p></section>`;
        case 'image': return `<img src="${p.imageUrl || 'https://picsum.photos/800/400'}" class="w-full h-auto ${r} border border-white/10 shadow-lg" alt="${el.label}" />`;
        default: return '';
    }
}

function getProfessionalStyles(p: ElementProps, brand?: BrandKit): string {
    const shadowMap = { none: '', soft: 'shadow-md', medium: 'shadow-lg', deep: 'shadow-2xl', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]' };
    let styles = '';

    // Core brand integration
    if (brand?.glass) styles += 'backdrop-blur-md bg-white/5 border-white/10 ';

    if (p.blur) styles += `backdrop - blur - [${p.blur}px]`;
    if (p.opacity !== undefined) styles += `opacity - [${p.opacity / 100}]`;
    if (p.shadow && p.shadow !== 'none') styles += `${shadowMap[p.shadow]} `;
    if (p.gradient) styles += `bg - gradient - to - r ${p.gradient} `;
    return styles;
}

function generateHTMLExport(elements: CanvasElement[], brand?: BrandKit): string {
    const body = elements.map(el => `  ${renderElementCode(el, brand)} `).join('\n\n');
    return `< !DOCTYPE html >\n < html lang = "en" >\n<head>\n < meta charset = "UTF-8" >\n < meta name = "viewport" content = "width=device-width, initial-scale=1.0" >\n < title > IA Architecte Export</title >\n < script src = "https://cdn.tailwindcss.com" ></script >\n < style > body{ background:#0a0a0b; color: #fff; font - family: sans - serif; padding: 2rem }</style >\n</head >\n < body class="space-y-6 p-8" >\n${body} \n</body >\n</html > `;
}

function generateTSX(elements: CanvasElement[], brand?: BrandKit): string {
    const body = elements.map(el => `    ${renderElementCode(el, brand)} `).join('\n\n');
    return `// Generated by IA ARHITECTE\nimport React from 'react';\n\nexport default function App() {\n  return (\n    <div className="p-8 space-y-6 bg-[#0a0a0b] min-h-screen text-white">\n${body}\n    </div>\n  );\n}`;
}

function generateCSS(elements: CanvasElement[]): string {
    const sizeMap: Record<string, string> = { xs: '11px', sm: '13px', base: '15px', lg: '18px', xl: '22px', '2xl': '28px' };
    const rules = elements.map(el => {
        const p = el.props;
        const sid = el.id.replace(/[^a-zA-Z0-9]/g, '-');
        const shadowMap = { none: 'none', soft: '0 4px 12px rgba(0,0,0,0.1)', medium: '0 12px 24px rgba(0,0,0,0.2)', deep: '0 24px 48px rgba(0,0,0,0.4)', glow: '0 0 20px rgba(168,85,247,0.4)' };

        return `.el-${sid} {
  border-radius: ${p.radius ?? 16}px;
  padding: ${(p.padding ?? 4) * 4}px;
  ${p.bg ? `background: ${p.bg};` : ''}
  ${p.gradient ? `background-image: ${p.gradient};` : ''}
  ${p.color ? `color: ${p.color};` : ''}
  ${p.borderColor ? `border: 1px solid ${p.borderColor};` : ''}
  text-align: ${p.align || 'left'};
  font-size: ${sizeMap[p.fontSize || 'base']};
  width: ${p.width === 'half' ? '50%' : '100%'};
  ${p.blur ? `backdrop-filter: blur(${p.blur}px);` : ''}
  ${p.opacity !== undefined ? `opacity: ${p.opacity / 100};` : ''}
  box-shadow: ${shadowMap[p.shadow || 'none']};
}`;
    }).join('\n\n');
    return `/* Generated by IA ARHITECTE */\n\n${rules || '/* No elements yet */'}`;
}

// ─── AI prompt → elements ─────────────────────────────────────────────────────

function aiGenerateElements(prompt: string, counter: React.MutableRefObject<number>): CanvasElement[] {
    const p = prompt.toLowerCase();
    const mk = (type: ElementType, label: string, extraProps: Partial<ElementProps> = {}): CanvasElement => {
        counter.current += 1;
        return {
            id: `AI-${Date.now()}-${counter.current}`,
            type,
            label,
            props: { ...defaultProps, ...extraProps }
        };
    };

    // ─── SaaS / Dashboard ───
    if (p.includes('saas') || p.includes('dashboard') || p.includes('panou') || p.includes('panel')) {
        return [
            mk('navbar', 'Neural SaaS Platform', { blur: 15, shadow: 'glow' }),
            mk('hero', 'Accelerate Your Protocol', { align: 'center', animation: 'slideUp', gradient: 'linear-gradient(to right, #a855f7, #6366f1)' }),
            mk('badge', 'Live Performance: 99.9%', { align: 'center', bg: 'rgba(168,85,247,0.1)' }),
            mk('divider', ''),
            mk('card', 'Total Revenue', { bg: 'rgba(255,255,255,0.03)', shadow: 'soft' }),
            mk('card', 'Active Nodes', { bg: 'rgba(255,255,255,0.03)', shadow: 'soft' }),
            mk('text', 'Neural Sync Progress', { fontSize: 'sm', align: 'center' }),
            mk('button', 'Enter Console', { radius: 30, shadow: 'glow' })
        ];
    }

    // ─── E-commerce / Shop ───
    if (p.includes('magazin') || p.includes('shop') || p.includes('ecommerce') || p.includes('store')) {
        return [
            mk('navbar', 'GLITCH STORE', { shadow: 'soft' }),
            mk('hero', 'Future Wear 2026', { align: 'center', animation: 'scalePop' }),
            mk('image', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', { radius: 24, shadow: 'medium' }),
            mk('card', 'Quantum Watch - $299', { align: 'center', blur: 5 }),
            mk('button', 'Add to Cart', { bg: '#6366f1', radius: 12 }),
            mk('card', 'Neural Glasses - $550', { align: 'center', blur: 5 }),
            mk('button', 'Buy Now', { bg: '#a855f7', radius: 12 }),
            mk('divider', ''),
            mk('text', 'Free shipping across the Metaverse', { align: 'center', fontSize: 'xs' })
        ];
    }

    // ─── Social Media / Profiles ───
    if (p.includes('social') || p.includes('network') || p.includes('profil') || p.includes('profile')) {
        return [
            mk('navbar', 'Connect.AI', { blur: 10 }),
            mk('image', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200', { radius: 100, width: 'auto', align: 'center', shadow: 'glow' }),
            mk('text', 'Agent Anderson', { align: 'center', fontSize: 'xl', color: '#fff' }),
            mk('badge', 'Verified AI', { align: 'center', bg: 'rgba(6,182,212,0.2)' }),
            mk('divider', ''),
            mk('text', 'Interests: Neural Webs, 4D Art, Byte-shifting', { align: 'center', fontSize: 'sm' }),
            mk('button', 'Follow Protocol', { radius: 24, gradient: 'linear-gradient(to right, #0ea5e9, #22d3ee)' }),
            mk('card', 'Recent Broadcast', { bg: 'rgba(255,255,255,0.02)' }),
            mk('text', 'Synthesizing new dimensions today. Stay tuned.', { fontSize: 'sm', padding: 4 })
        ];
    }

    // ─── Portfolio ───
    if (p.includes('portfolio') || p.includes('portofoliu') || p.includes('creativ')) {
        return [
            mk('navbar', 'STUDIO.ARCH', { shadow: 'glow' }),
            mk('hero', 'Creative Synthesis', { animation: 'fadeIn', align: 'left' }),
            mk('divider', ''),
            mk('image', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', { radius: 32 }),
            mk('text', 'PROJECT ALPHA', { fontSize: 'lg', align: 'left' }),
            mk('image', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800', { radius: 32 }),
            mk('text', 'PROJECT BETA', { fontSize: 'lg', align: 'left' }),
            mk('button', 'Collaborate', { radius: 0, borderColor: '#fff', bg: 'transparent' })
        ];
    }

    // ─── Login / Auth ───
    if (p.includes('login') || p.includes('conexiune') || p.includes('sign in')) {
        return [
            mk('hero', 'Welcome Back', { animation: 'scalePop' }),
            mk('text', 'Access the Neural Hub', { align: 'center', fontSize: 'sm', opacity: 60 }),
            mk('input', 'Email address'),
            mk('input', 'Password'),
            mk('toggle', 'Remember my Signature'),
            mk('button', 'Enter Protocol', { shadow: 'glow' }),
            mk('text', 'Forgot sequence?', { align: 'center', fontSize: 'xs', opacity: 50 })
        ];
    }

    // ─── Register ───
    if (p.includes('register') || p.includes('signup') || p.includes('înregistr')) {
        return [
            mk('hero', 'Create Identity', { gradient: 'linear-gradient(to right, #f97316, #facc15)' }),
            mk('input', 'Full Name'), mk('input', 'Email'), mk('input', 'Password'),
            mk('toggle', 'Agree to Meta-Terms'),
            mk('button', 'Manifest Account', { radius: 12 })
        ];
    }

    // ─── Contact ───
    if (p.includes('contact') || p.includes('mesaj')) {
        return [
            mk('hero', 'Open Frequencies', { align: 'center' }),
            mk('input', 'Your name'), mk('input', 'Email'), mk('textarea', 'Your message...'),
            mk('button', 'Transmit', { shadow: 'soft' })
        ];
    }

    // ─── Landing Page ───
    if (p.includes('landing') || p.includes('homepage') || p.includes('acasa')) {
        return [
            mk('navbar', 'Aether UI', { blur: 15 }),
            mk('hero', 'Design the Future', { animation: 'slideUp', gradient: 'linear-gradient(to right, #06b6d4, #3b82f6)' }),
            mk('badge', 'v2.0 Beta Live', { align: 'center' }),
            mk('card', 'Quantum Speed', { blur: 5 }),
            mk('card', 'Neural Security', { blur: 5 }),
            mk('button', 'Get Started', { radius: 32, shadow: 'glow' })
        ];
    }

    // ─── Form / Survey ───
    if (p.includes('form') || p.includes('formular') || p.includes('survey')) {
        return [
            mk('text', 'Survey Protocol', { fontSize: 'xl', align: 'center' }),
            mk('input', 'Your Name'),
            mk('select', 'Experience Level'),
            mk('textarea', 'Feedback / Notes'),
            mk('toggle', 'Receive Updates'),
            mk('button', 'Submit Data', { radius: 8 })
        ];
    }

    // fallback generic
    return [
        mk('hero', prompt, { animation: 'fadeIn' }),
        mk('button', 'Initialize', { shadow: 'soft' }),
        mk('text', 'Contextual components synthesized based on your prompt.', { align: 'center', opacity: 50 })
    ];
}

// ─── Render element preview ───────────────────────────────────────────────────

function ElementPreview({ el, theme }: { el: CanvasElement; theme: Theme }) {
    const th = THEMES[theme];
    const p = el.props;

    const shadowStyles = {
        none: 'none',
        soft: '0 4px 12px rgba(0,0,0,0.1)',
        medium: '0 12px 24px rgba(0,0,0,0.2)',
        deep: '0 24px 48px rgba(0,0,0,0.4)',
        glow: `0 0 20px ${th.accent}44`,
    };

    const animationVariants = {
        none: { opacity: 1 },
        fadeIn: { opacity: [0, 1] },
        slideUp: { opacity: [0, 1], y: [20, 0] },
        scalePop: { opacity: [0, 1], scale: [0.8, 1] },
        rotateIn: { opacity: [0, 1], rotate: [-10, 0], scale: [0.9, 1] },
    };

    const style: React.CSSProperties = {
        backgroundColor: p.bg || undefined,
        backgroundImage: p.gradient || undefined,
        color: p.color || th.text,
        borderColor: p.borderColor || undefined,
        borderRadius: `${p.radius ?? 16}px`,
        padding: `${(p.padding ?? 4) * 4}px`,
        textAlign: p.align || 'left',
        fontSize: { xs: '11px', sm: '13px', base: '15px', lg: '18px', xl: '22px', '2xl': '28px' }[p.fontSize || 'base'],
        width: p.width === 'half' ? '50%' : '100%',
        backdropFilter: p.blur ? `blur(${p.blur}px)` : undefined,
        opacity: p.opacity !== undefined ? p.opacity / 100 : 1,
        boxShadow: shadowStyles[p.shadow || 'none'],
        borderWidth: p.borderColor ? 1 : 0,
        borderStyle: 'solid',
        overflow: 'hidden',
    };

    const content = () => {
        switch (el.type) {
            case 'button': return (
                <button style={{ ...style, backgroundColor: p.bg || th.accent, color: p.color || '#fff', cursor: 'default', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', border: 'none', width: '100%' }}>
                    {el.label}
                </button>
            );
            case 'input': return (
                <input disabled placeholder={el.label}
                    style={{ ...style, background: p.bg || `${th.border}`, color: p.color || th.text, outline: 'none', display: 'block' }} />
            );
            case 'textarea': return (
                <textarea disabled placeholder={el.label} rows={3}
                    style={{ ...style, background: p.bg || `${th.border}`, color: p.color || th.text, outline: 'none', resize: 'none', display: 'block' }} />
            );
            case 'text': return <p style={style}>{el.label}</p>;
            case 'select': return (
                <select disabled title="Element Preview Select" style={{ ...style, background: p.bg || th.surface, color: p.color || th.text, display: 'block' }}>
                    <option>{el.label}</option>
                </select>
            );
            case 'toggle': return (
                <label style={{ ...style, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'default' }}>
                    <div style={{ width: 44, height: 24, background: th.accent, borderRadius: 12, flexShrink: 0 }} />
                    <span style={{ color: p.color || th.text }}>{el.label}</span>
                </label>
            );
            case 'badge': return (
                <span style={{ ...style, display: 'inline-block', background: p.bg || `${th.accent}22`, color: p.color || th.accent, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', width: 'auto' }}>
                    {el.label}
                </span>
            );
            case 'divider': return <hr style={{ border: 'none', borderTop: `1px solid ${th.border}`, margin: '8px 0', width: '100%' }} />;
            case 'card': return (
                <div style={{ ...style, background: p.bg || th.surface }}>
                    <div style={{ width: 40, height: 4, background: th.accent, borderRadius: 2, marginBottom: 12 }} />
                    <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, color: p.color || th.text }}>{el.label}</h3>
                    <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>Professional card component.</p>
                </div>
            );
            case 'navbar': return (
                <nav style={{ ...style, background: p.bg || th.surface, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', color: p.color || th.text }}>{el.label}</span>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#888' }}>
                        <span>Home</span><span>Features</span><span>Solutions</span>
                    </div>
                </nav>
            );
            case 'hero': return (
                <div style={{ ...style, background: p.bg || th.surface, textAlign: 'center' }}>
                    <h2 style={{ fontWeight: 900, fontSize: 32, fontStyle: 'italic', textTransform: 'uppercase', marginBottom: 12, color: p.color || th.text }}>{el.label}</h2>
                    <p style={{ fontSize: 15, color: '#888', marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>Build next-gen interfaces with our AI-powered architect tools.</p>
                    <button style={{ background: th.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '12px 32px', fontWeight: 700, cursor: 'default' }}>Launch Experience</button>
                </div>
            );
            case 'image': return (
                <img src={el.label} alt="preview" style={{ ...style, display: 'block', objectFit: 'cover', height: 220 }}
                    onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/800/400?random=${el.id}`; }} />
            );
            default: return null;
        }
    };

    return (
        <motion.div
            animate={animationVariants[p.animation || 'none']}
            transition={{ duration: p.animationDuration || 0.5, ease: 'easeOut' }}
        >
            {content()}
        </motion.div>
    );
}

function SortableCanvasItem({ el, theme, selectedId, onSelect }: {
    el: CanvasElement; theme: Theme; selectedId: string | null; onSelect: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: el.id });
    const th = THEMES[theme];
    const dragStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
        cursor: 'grab',
        outline: selectedId === el.id ? `2px solid ${th.accent}` : '2px solid transparent',
        borderRadius: 16,
        padding: 4,
        position: 'relative' as const,
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={dragStyle}
            {...attributes}
            {...listeners}
            onClick={(e) => { e.stopPropagation(); onSelect(el.id); }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99, cursor: 'grabbing' }}
        >
            <ElementPreview el={el} theme={theme} />
        </motion.div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SESSION_ID = Math.floor(Math.random() * 9999);
const STORAGE_KEY = 'ia_arh_canvas';
const PROJECTS_KEY = 'ia_arh_projects';

function SortableLayerItem({ el, idx, selectedId, onSelect, onMove, onDuplicate, onDelete, th }: {
    el: CanvasElement; idx: number; selectedId: string | null;
    onSelect: (id: string) => void; onMove: (id: string, dir: 'up' | 'down') => void;
    onDuplicate: (id: string) => void; onDelete: (id: string) => void;
    th: { bg: string; border: string; accent: string; surface: string; text: string; label: string };
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: el.id });
    const dragStyle = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, marginBottom: 4 };
    return (
        <div ref={setNodeRef} style={dragStyle}>
            <div className={`el-chip ${selectedId === el.id ? 'active' : ''}`}
                style={{ justifyContent: 'space-between' }} onClick={() => onSelect(el.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span {...attributes} {...listeners} style={{ cursor: 'grab', opacity: .35, fontSize: 16, userSelect: 'none', lineHeight: 1, touchAction: 'none' }}>⠿</span>
                    <span style={{ opacity: .4, fontSize: 9 }}>#{idx + 1}</span>
                    <span>{el.type}</span>
                </div>
                <div style={{ display: 'flex', gap: 2, opacity: selectedId === el.id ? 1 : 0 }} onClick={e => e.stopPropagation()}>
                    <button title="Move Up" aria-label="Move Up" className="ia-btn" style={{ padding: '2px 4px', borderRadius: 6, background: th.bg, border: `1px solid ${th.border}`, cursor: 'pointer' }} onClick={() => onMove(el.id, 'up')}><ArrowUp size={10} /></button>
                    <button title="Move Down" aria-label="Move Down" className="ia-btn" style={{ padding: '2px 4px', borderRadius: 6, background: th.bg, border: `1px solid ${th.border}`, cursor: 'pointer' }} onClick={() => onMove(el.id, 'down')}><ArrowDown size={10} /></button>
                    <button title="Duplicate" aria-label="Duplicate" className="ia-btn" style={{ padding: '2px 4px', borderRadius: 6, background: th.bg, border: `1px solid ${th.border}`, cursor: 'pointer' }} onClick={() => onDuplicate(el.id)}><Copy size={10} /></button>
                    <button title="Delete" aria-label="Delete" className="ia-btn" style={{ padding: '2px 4px', borderRadius: 6, background: '#ef444422', border: '1px solid #ef444433', cursor: 'pointer', color: '#ef4444' }} onClick={() => onDelete(el.id)}><Trash2 size={10} /></button>
                </div>
            </div>
        </div>
    );
}

export default function BuilderApp() {
    const idCounter = useRef(0);

    const [state, _setStateRaw] = useState<AppState>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (!parsed.brand) {
                parsed.brand = { primary: '#a855f7', secondary: '#6366f1', accent: '#f472b6', radius: 16, font: 'sans', glass: true };
            }
            return parsed;
        }
        return {
            elements: [],
            theme: 'dark',
            columns: 1,
            brand: { primary: '#a855f7', secondary: '#6366f1', accent: '#f472b6', radius: 16, font: 'sans', glass: true }
        };
    });

    const [history, setHistory] = useState<AppState[]>([]);
    const [future, setFuture] = useState<AppState[]>([]);

    // Update state with history tracking
    const setState = useCallback((updater: AppState | ((prev: AppState) => AppState)) => {
        _setStateRaw(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            setHistory(h => [...h.slice(-49), prev]); // Keep history limited
            setFuture([]);
            return next;
        });
    }, []);

    const undo = useCallback(() => {
        if (history.length === 0) return;
        const prev = history[history.length - 1];
        setFuture(f => [state, ...f]);
        setHistory(h => h.slice(0, -1));
        _setStateRaw(prev);
    }, [history, state]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const next = future[0];
        setHistory(h => [...h, state]);
        setFuture(f => f.slice(1));
        _setStateRaw(next);
    }, [future, state]);


    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [rightActiveTab, setRightActiveTab] = useState<'props' | 'ai' | 'auditor'>('props');
    const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; text: string }[]>([
        { id: '1', role: 'assistant', text: "Hello! I am your AI Design Assistant. I can help you align elements, change styles across your project, or add new components. What's on your mind?" }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [copied, setCopied] = useState(false);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [activeTab, setActiveTab] = useState<'canvas' | 'code' | 'preview'>('canvas');
    const [codeFormat, setCodeFormat] = useState<'tsx' | 'html' | 'json' | 'css'>('tsx');
    const [aiPrompt, setAiPrompt] = useState('');
    const [showAI, setShowAI] = useState(false);
    const [showThemes, setShowThemes] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [brand, setBrand] = useState<BrandKit>({
        primary: '#a855f7', secondary: '#6366f1', accent: '#f472b6',
        radius: 16, font: 'sans', glass: true
    });

    const [leftActiveTab, setLeftActiveTab] = useState<'elements' | 'templates' | 'layers' | 'brand'>('elements');

    const [search, setSearch] = useState('');
    const [showProjects, setShowProjects] = useState(false);
    const [projectName, setProjectName] = useState('My Project');
    const [projects, setProjects] = useState<Project[]>(() => {
        try { const s = localStorage.getItem(PROJECTS_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
    });

    const { elements, theme, columns } = state;
    const th = THEMES[theme];

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);




    // Element operations
    const addElement = (type: ElementType) => {
        idCounter.current += 1;
        const id = `NODE-${SESSION_ID}-${idCounter.current}`;
        setState(prev => ({ ...prev, elements: [...prev.elements, { id, type, label: defaultLabel[type], props: { ...defaultProps } }] }));
        setSelectedId(id);
    };

    const deleteElement = useCallback((id: string) => {
        setState(prev => ({ ...prev, elements: prev.elements.filter(e => e.id !== id) }));
        setSelectedId(null);
    }, [setState]);

    const duplicateElement = useCallback((id: string) => {
        setState(prev => {
            const el = prev.elements.find(e => e.id === id);
            if (!el) return prev;
            idCounter.current += 1;
            const newEl = { ...el, id: `NODE-${SESSION_ID}-${idCounter.current}`, props: { ...el.props } };
            const idx = prev.elements.findIndex(e => e.id === id);
            const arr = [...prev.elements];
            arr.splice(idx + 1, 0, newEl);
            return { ...prev, elements: arr };
        });
    }, [setState]);

    const addTemplate = (template: typeof TEMPLATE_REGISTRY[0]) => {
        setState(prev => {
            const baseId = Date.now();
            const newEls = template.elements.map((el, i) => ({
                ...el,
                id: `T-${baseId}-${i}`
            }));
            return { ...prev, elements: [...prev.elements, ...newEls] };
        });
    };

    const moveElement = (id: string, dir: 'up' | 'down') => {
        const idx = elements.findIndex(e => e.id === id);
        if (dir === 'up' && idx === 0) return;
        if (dir === 'down' && idx === elements.length - 1) return;
        setState(prev => {
            const arr = [...prev.elements];
            const swap = dir === 'up' ? idx - 1 : idx + 1;
            [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
            return { ...prev, elements: arr };
        });
    };

    const updateLabel = (id: string, label: string) => {
        setState(prev => ({ ...prev, elements: prev.elements.map(e => e.id === id ? { ...e, label } : e) }));
    };

    const updateProps = (id: string, patch: Partial<ElementProps>) => {
        setState(prev => ({ ...prev, elements: prev.elements.map(e => e.id === id ? { ...e, props: { ...e.props, ...patch } } : e) }));
    };

    const clearCanvas = () => { setState(prev => ({ ...prev, elements: [] })); setSelectedId(null); };

    const setTheme = (t: Theme) => { setState(prev => ({ ...prev, theme: t })); setShowThemes(false); };
    const setColumns = (c: 1 | 2 | 3) => setState(prev => ({ ...prev, columns: c }));

    const saveProjectFn = useCallback(() => {
        setProjects(prev => {
            const proj: Project = { id: Date.now().toString(), name: projectName, icon: Layout, savedAt: new Date().toLocaleString(), state };
            const updated = [...prev.filter(p => p.name !== proj.name), proj];
            localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
            return updated;
        });
    }, [projectName, state]);

    const loadProject = (proj: Project) => { _setStateRaw(proj.state); setProjectName(proj.name); setSelectedId(null); setShowProjects(false); };
    const deleteProject = (id: string) => {
        setProjects(prev => { const u = prev.filter(p => p.id !== id); localStorage.setItem(PROJECTS_KEY, JSON.stringify(u)); return u; });
    };

    const loadPremadeProject = (p: typeof PREMADE_PROJECTS[0]) => {
        setState(prev => ({
            ...prev,
            elements: p.state.elements,
            theme: p.state.theme,
            columns: p.state.columns,
        }));
        setProjectName(p.name);
        setSelectedId(null);
        setLeftActiveTab('layers'); // Switch to layers tab after loading
    };

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setState(prev => {
                const oi = prev.elements.findIndex(e => e.id === active.id);
                const ni = prev.elements.findIndex(e => e.id === over.id);
                return { ...prev, elements: arrayMove(prev.elements, oi, ni) };
            });
        }
    }, [setState]);

    // AI Generate
    const runAIGenerate = () => {
        if (!aiPrompt.trim()) return;
        const generated = aiGenerateElements(aiPrompt, idCounter);
        setState(prev => ({ ...prev, elements: [...prev.elements, ...generated] }));
        setAiPrompt('');
        setShowAI(false);
        setActiveTab('canvas');
    };

    // Code generation
    const getCode = () => {
        if (codeFormat === 'html') return generateHTMLExport(elements);
        if (codeFormat === 'json') return JSON.stringify({ elements, theme, columns }, null, 2);
        if (codeFormat === 'css') return generateCSS(elements);
        return generateTSX(elements);
    };

    const copyCode = () => {
        navigator.clipboard.writeText(getCode());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadCode = () => {
        const ext = codeFormat === 'html' ? 'html' : codeFormat === 'json' ? 'json' : codeFormat === 'css' ? 'css' : 'tsx';
        const blob = new Blob([getCode()], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `ia-arh-export.${ext}`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    const sendMessage = () => {
        if (!chatInput.trim()) return;
        const botId = (Date.now() + 1).toString();
        const userInput = chatInput;
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userInput }]);
        setChatInput('');

        setTimeout(() => {
            let botResponse = "I'm not sure how to do that yet. Try 'make everything red' or 'center all'.";
            const cmd = userInput.toLowerCase();

            if (cmd.includes('red') || cmd.includes('roșu')) {
                setState(prev => ({ ...prev, elements: prev.elements.map(e => ({ ...e, props: { ...e.props, bg: '#ef4444' } })) }));
                botResponse = "Done! Everything is now Red.";
            } else if (cmd.includes('blue') || cmd.includes('albastru')) {
                setState(prev => ({ ...prev, elements: prev.elements.map(e => ({ ...e, props: { ...e.props, bg: '#3b82f6' } })) }));
                botResponse = "Changed all backgrounds to Blue.";
            } else if (cmd.includes('center') || cmd.includes('centru')) {
                setState(prev => ({ ...prev, elements: prev.elements.map(e => ({ ...e, props: { ...e.props, align: 'center' } })) }));
                botResponse = "All elements are now centered.";
            } else if (cmd.includes('clear') || cmd.includes('goleste')) {
                clearCanvas();
                botResponse = "Canvas cleared.";
            } else if (cmd.includes('theme') || cmd.includes('tema')) {
                if (cmd.includes('light')) { setTheme('light'); botResponse = "Switched to Light theme."; }
                else if (cmd.includes('dark')) { setTheme('dark'); botResponse = "Back to Dark theme."; }
                else if (cmd.includes('glass')) { setTheme('glass'); botResponse = "Glassmorphism mode on."; }
            }

            setMessages(prev => [...prev, { id: botId, role: 'assistant', text: botResponse }]);
        }, 600);
    };

    const importJSON = () => {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const parsed = JSON.parse(ev.target?.result as string) as AppState;
                    if (parsed.elements) { setStateRaw(parsed); setSelectedId(null); }
                } catch { alert('Invalid JSON file'); }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    // Keyboard shortcuts - moved down to avoid ReferenceError
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const inInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); if (selectedId) duplicateElement(selectedId); }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveProjectFn(); }
            if (e.key === 'Delete' && selectedId && !inInput) { deleteElement(selectedId); }
            if (e.key === 'Escape') { setSelectedId(null); setShowAI(false); setShowThemes(false); setShowProjects(false); }
            if ((e.ctrlKey || e.metaKey) && e.key === '=') { e.preventDefault(); setZoom(z => Math.min(parseFloat((z + 0.1).toFixed(1)), 2.5)); }
            if ((e.ctrlKey || e.metaKey) && e.key === '-') { e.preventDefault(); setZoom(z => Math.max(parseFloat((z - 0.1).toFixed(1)), 0.3)); }
            if ((e.ctrlKey || e.metaKey) && e.key === '0') { e.preventDefault(); setZoom(1); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [undo, redo, selectedId, duplicateElement, deleteElement, saveProjectFn]);

    const selectedEl = elements.find(e => e.id === selectedId);

    const previewWidth = previewMode === 'desktop' ? '100%' : previewMode === 'tablet' ? '768px' : '390px';

    // ─── Styles ──────────────────────────────────────────────────────────────────
    const css = `
    .ia-builder { background:${th.bg}; color:${th.text}; height:100vh; display:flex; flex-direction:column; font-family:'Outfit','Inter',sans-serif; overflow:hidden; }
    .ia-header { display:flex; align-items:center; justify-content:space-between; padding:12px 24px; background:${th.surface}; border-bottom:1px solid ${th.border}; gap:12px; flex-wrap:wrap; min-height:64px; }
    .ia-sidebar { width:260px; flex-shrink:0; background:${th.surface}; border-right:1px solid ${th.border}; display:flex; flex-direction:column; overflow:hidden; }
    .ia-sidebar-right { width:300px; flex-shrink:0; background:${th.surface}; border-left:1px solid ${th.border}; display:flex; flex-direction:column; overflow:hidden; }
    .ia-canvas { flex:1; overflow:auto; padding:32px; display:flex; flex-direction:column; align-items:center; background:${th.bg}; background-image:radial-gradient(circle at 2px 2px, ${th.border} 1px, transparent 0); background-size:40px 40px; }
    .ia-btn { cursor:pointer; border:none; outline:none; transition:all .15s; }
    .ia-btn-accent { background:${th.accent}; color:#fff; padding:8px 18px; border-radius:12px; font-weight:700; font-size:12px; letter-spacing:.05em; }
    .ia-btn-ghost { background:transparent; color:${th.text}; padding:8px 14px; border-radius:10px; font-size:12px; }
    .ia-btn-ghost:hover { background:${th.border}; }
    .ia-input { background:${th.bg}; border:1px solid ${th.border}; border-radius:10px; padding:8px 12px; color:${th.text}; outline:none; font-family:inherit; font-size:13px; width:100%; }
    .ia-input:focus { border-color:${th.accent}; }
    .ia-scroll { overflow-y:auto; }
    .ia-scroll::-webkit-scrollbar { width:4px; }
    .ia-scroll::-webkit-scrollbar-track { background:transparent; }
    .ia-scroll::-webkit-scrollbar-thumb { background:${th.border}; border-radius:4px; }
    .ia-label { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.15em; color:#888; }
    .ia-section { padding:16px; border-bottom:1px solid ${th.border}; }
    .el-chip { display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:10px; cursor:pointer; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; transition:all .15s; border:1px solid transparent; }
    .el-chip.active { background:${th.accent}22; color:${th.accent}; border-color:${th.accent}44; }
    .el-chip:hover:not(.active) { background:${th.border}; }
    .comp-btn { display:flex; flex-direction:column; align-items:center; gap:6px; padding:14px 8px; border-radius:14px; border:1px solid ${th.border}; background:transparent; cursor:pointer; transition:all .15s; font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.1em; color:#666; }
    .comp-btn:hover { border-color:${th.accent}66; color:${th.accent}; background:${th.accent}11; }
    .tab-btn { padding:8px 16px; border-radius:10px; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.1em; cursor:pointer; border:none; transition:all .15s; }
    .tab-btn.active { background:${th.accent}; color:#fff; }
    .tab-btn:not(.active) { background:transparent; color:#666; }
    .tab-btn:not(.active):hover { background:${th.border}; color:${th.text}; }

    /* Utility Classes to replace inline styles */
    .flex-row { display:flex; align-items:center; }
    .flex-center { display:flex; align-items:center; justify-content:center; }
    .flex-between { display:flex; align-items:center; justify-content:space-between; }
    .flex-col { display:flex; flex-direction:column; }
    .gap-4 { gap: 4px; } .gap-6 { gap: 6px; } .gap-8 { gap: 8px; } .gap-12 { gap: 12px; } .gap-16 { gap: 16px; }
    .ia-panel { position:absolute; background:${th.surface}; border:1px solid ${th.border}; border-radius:20px; padding:16px; z-index:999; boxShadow:0 20px 60px rgba(0,0,0,0.5); }
    .ia-title { font-weight:900; font-size:15px; font-style:italic; text-transform:uppercase; letter-spacing:-0.02em; }
    .ia-subtitle { font-size:9px; font-weight:800; color:#666; text-transform:uppercase; letter-spacing:.2em; }
    .ia-card-preview { background:${th.surface}; padding:16px; border-radius:16px; border:1px solid ${th.border}; }
    .ia-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
    .ia-grid-3 { display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; }
    .text-accent { color:${th.accent}; }
    .w-full { width:100%; }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="ia-builder">
                {/* ── Header ── */}
                <header className="ia-header">
                    {/* Left: Logo + Undo/Redo */}
                    <div className="flex-row gap-12">
                        <div className="flex-center" style={{ padding: '8px', background: `${th.accent}22`, borderRadius: 12, border: `1px solid ${th.accent}33` }}>
                            <Code2 size={20} className="text-accent" />
                        </div>
                        <div>
                            <div className="ia-title">IA ARHITECTE</div>
                            <div className="ia-subtitle">App Builder</div>
                        </div>
                        <div className="flex-row gap-4" style={{ marginLeft: 8 }}>
                            <button title="Undo (Ctrl+Z)" onClick={undo} disabled={!history.length} className="ia-btn ia-btn-ghost" style={{ opacity: history.length ? 1 : 0.3, padding: '6px 10px' }}><Undo2 size={15} /></button>
                            <button title="Redo (Ctrl+Y)" onClick={redo} disabled={!future.length} className="ia-btn ia-btn-ghost" style={{ opacity: future.length ? 1 : 0.3, padding: '6px 10px' }}><Redo2 size={15} /></button>
                        </div>
                        <div className="flex-row gap-6" style={{ marginLeft: 8, borderLeft: `1px solid ${th.border}`, paddingLeft: 12 }}>
                            <input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Project name" className="ia-input" style={{ width: 130, padding: '5px 10px', fontSize: 11, fontWeight: 700 }} />
                            <button title="Save Project (Ctrl+S)" onClick={saveProjectFn} className="ia-btn flex-row gap-4" style={{ padding: '6px 10px', borderRadius: 10, background: `${th.accent}22`, border: `1px solid ${th.accent}44`, color: th.accent, cursor: 'pointer' }}><Save size={13} /><span style={{ fontSize: 10, fontWeight: 800 }}>Save</span></button>
                            <div style={{ position: 'relative' }}>
                                <button title="Projects" onClick={() => setShowProjects(p => !p)} className="ia-btn flex-row gap-4" style={{ padding: '6px 10px', borderRadius: 10, background: showProjects ? `${th.accent}22` : 'transparent', border: `1px solid ${th.border}`, color: th.text, cursor: 'pointer' }}><FolderOpen size={13} /><span style={{ fontSize: 10, fontWeight: 800 }}>{projects.length}</span></button>
                                {showProjects && (
                                    <div style={{ position: 'absolute', top: 40, left: 0, width: 280, background: th.surface, border: `1px solid ${th.border}`, borderRadius: 16, padding: 12, zIndex: 999, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                                        <div className="ia-label" style={{ marginBottom: 8 }}>Saved Projects ({projects.length})</div>
                                        {projects.length === 0 && <div style={{ fontSize: 11, color: '#555', textAlign: 'center', padding: '12px 0' }}>No saved projects yet.<br />Press Ctrl+S to save.</div>}
                                        {projects.map(p => (
                                            <div key={p.id} className="flex-row gap-6" style={{ padding: '6px 8px', borderRadius: 8, marginBottom: 4, background: th.bg, border: `1px solid ${th.border}` }}>
                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <div style={{ fontSize: 11, fontWeight: 700, color: th.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                                    <div style={{ fontSize: 9, color: '#666' }}>{p.savedAt}</div>
                                                </div>
                                                <button onClick={() => loadProject(p)} className="ia-btn" style={{ padding: '4px 8px', borderRadius: 6, background: `${th.accent}22`, color: th.accent, border: `1px solid ${th.accent}33`, cursor: 'pointer', fontSize: 9, fontWeight: 800 }}>Load</button>
                                                <button onClick={() => deleteProject(p.id)} title="Delete Project" className="ia-btn" style={{ padding: '4px 6px', borderRadius: 6, background: '#ef444411', color: '#ef4444', border: '1px solid #ef444422', cursor: 'pointer' }}><X size={10} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Center: tabs + preview mode */}
                    <div className="flex-row gap-8">
                        <div className="flex-row gap-2" style={{ background: th.bg, borderRadius: 12, padding: 3, border: `1px solid ${th.border}` }}>
                            {(['canvas', 'code', 'preview'] as const).map(tab => (
                                <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                                    {tab === 'canvas' ? <><Layout size={12} style={{ display: 'inline', marginRight: 4 }} /> Canvas</> : tab === 'code' ? <><Terminal size={12} style={{ display: 'inline', marginRight: 4 }} /> Code</> : <><Play size={12} style={{ display: 'inline', marginRight: 4 }} /> Preview</>}
                                </button>
                            ))}
                        </div>
                        {activeTab === 'canvas' && (
                            <div className="flex-row gap-2" style={{ background: th.bg, borderRadius: 12, padding: 3, border: `1px solid ${th.border}` }}>
                                {([{ id: 'desktop', I: Monitor }, { id: 'tablet', I: Tablet }, { id: 'mobile', I: Smartphone }] as const).map(({ id, I }) => (
                                    <button key={id} title={id} className={`tab-btn ${previewMode === id ? 'active' : ''}`} style={{ padding: '6px 10px' }} onClick={() => setPreviewMode(id as any)}><I size={14} /></button>
                                ))}
                            </div>
                        )}
                        <div className="flex-row gap-2" style={{ background: th.bg, borderRadius: 12, padding: 3, border: `1px solid ${th.border}` }}>
                            <button title="Zoom Out (Ctrl+-)" onClick={() => setZoom(z => Math.max(z - 0.1, 0.3))} className="ia-btn ia-btn-ghost" style={{ padding: '6px 8px' }} aria-label="Zoom Out"><ZoomOut size={14} /></button>
                            <div className="flex-row gap-4" style={{ padding: '0 8px' }}>
                                <span className="text-accent" style={{ fontSize: 10, fontWeight: 800, minWidth: 35, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
                                <button title="Reset Zoom (Ctrl+0)" onClick={() => setZoom(1)} className="ia-btn ia-btn-ghost" style={{ padding: '4px' }} aria-label="Reset Zoom"><RotateCcw size={12} /></button>
                            </div>
                            <button title="Zoom In (Ctrl+=)" onClick={() => setZoom(z => Math.min(z + 0.1, 2.5))} className="ia-btn ia-btn-ghost" style={{ padding: '6px 8px' }} aria-label="Zoom In"><ZoomIn size={14} /></button>
                        </div>
                    </div>

                    {/* Right: AI + Themes + Import + Download */}
                    <div className="flex-row gap-8">
                        <div style={{ position: 'relative' }}>
                            <button title="AI Generation" className="ia-btn ia-btn-ghost flex-row gap-6" aria-label="Toggle AI Generation" style={{ border: `1px solid ${th.border}`, borderRadius: 12 }}
                                onClick={() => setShowAI(p => !p)}>
                                <Wand2 size={14} style={{ color: th.accent }} />
                                <span style={{ fontSize: 11, fontWeight: 800 }}>AI Generate</span>
                            </button>
                            {showAI && (
                                <div style={{ position: 'absolute', top: 44, right: 0, width: 320, background: th.surface, border: `1px solid ${th.border}`, borderRadius: 20, padding: 16, zIndex: 999, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                                    <div className="ia-label" style={{ marginBottom: 10 }}>Describe your app in French or English</div>
                                    <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                                        placeholder='Ex: "formulaire de login" ou "landing page"...'
                                        style={{ width: '100%', background: th.bg, border: `1px solid ${th.border}`, borderRadius: 10, padding: '10px 12px', color: th.text, outline: 'none', fontFamily: 'inherit', fontSize: 13, resize: 'none', marginBottom: 10 }} rows={3} />
                                    <button className="ia-btn ia-btn-accent" style={{ width: '100%' }} onClick={runAIGenerate}><Wand2 size={13} style={{ display: 'inline', marginRight: 6 }} />Generate Components</button>
                                </div>
                            )}
                        </div>

                        <div style={{ position: 'relative' }}>
                            <button title="Themes" className="ia-btn ia-btn-ghost flex-row gap-6" aria-label="Toggle Themes" style={{ border: `1px solid ${th.border}`, borderRadius: 12 }}
                                onClick={() => setShowThemes(p => !p)}>
                                <Palette size={14} style={{ color: th.accent }} />
                                <span style={{ fontSize: 11, fontWeight: 800 }}>Theme</span>
                            </button>
                            {showThemes && (
                                <div style={{ position: 'absolute', top: 44, right: 0, width: 180, background: th.surface, border: `1px solid ${th.border}`, borderRadius: 16, padding: 8, zIndex: 999, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                                    {(Object.keys(THEMES) as Theme[]).map(t => {
                                        const TI = THEME_ICONS[t];
                                        return (
                                            <button key={t} onClick={() => setTheme(t)} className="ia-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: theme === t ? `${th.accent}22` : 'transparent', color: theme === t ? th.accent : th.text, fontWeight: 700, fontSize: 12 }}>
                                                <TI size={14} /> {THEMES[t].label}
                                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: THEMES[t].accent, marginLeft: 'auto' }} />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <button title="Import JSON" onClick={importJSON} className="ia-btn ia-btn-ghost" style={{ border: `1px solid ${th.border}`, borderRadius: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Upload size={14} /> <span style={{ fontSize: 11, fontWeight: 800 }}>Import</span>
                        </button>
                        <button title="Download" onClick={downloadCode} className="ia-btn ia-btn-accent" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Download size={14} /> {codeFormat.toUpperCase()}
                        </button>
                    </div>
                </header>

                {/* ── Code Tab ── */}
                {activeTab === 'code' && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderBottom: `1px solid ${th.border}`, background: th.surface }}>
                            {(['tsx', 'html', 'json', 'css'] as const).map(f => (
                                <button key={f} className={`tab-btn ${codeFormat === f ? 'active' : ''}`} onClick={() => setCodeFormat(f)}>{f.toUpperCase()}</button>
                            ))}
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                <button onClick={copyCode} className="ia-btn ia-btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${th.border}`, borderRadius: 10 }}>
                                    {copied ? <Check size={14} /> : <Copy size={14} />} <span style={{ fontSize: 11, fontWeight: 800 }}>{copied ? 'Copied!' : 'Copy'}</span>
                                </button>
                                <button title="Download Code" onClick={downloadCode} className="ia-btn ia-btn-accent">
                                    <Download size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="ia-scroll" style={{ flex: 1, background: '#050505', padding: 24 }}>
                            <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: '#a3e635', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                <code>{getCode()}</code>
                            </pre>
                        </div>
                    </div>
                )}

                {/* ── Preview Tab ── */}
                {activeTab === 'preview' && (
                    <div style={{ flex: 1, overflow: 'auto', background: th.bg, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 32 }}>
                        <div style={{ width: '100%', maxWidth: 1100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '.2em', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Globe size={13} /> Live HTML Preview
                            </div>
                            <iframe
                                srcDoc={generateHTMLExport(elements)}
                                style={{ width: previewWidth, minHeight: 600, border: `1px solid ${th.border}`, borderRadius: 24, background: '#fff', boxShadow: '0 40px 120px rgba(0,0,0,0.6)' }}
                                title="Live Preview"
                            />
                        </div>
                    </div>
                )}

                {/* ── Canvas Tab ── */}
                {activeTab === 'canvas' && (
                    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                        {/* Left sidebar: components */}
                        <aside className="ia-sidebar ia-scroll">
                            {/* Tabs Header */}
                            <div className="flex-row" style={{ borderBottom: `1px solid ${th.border}` }}>
                                {(['elements', 'templates', 'brand', 'layers'] as const).map(tab => (
                                    <button key={tab}
                                        onClick={() => setLeftActiveTab(tab)}
                                        className="flex-center"
                                        style={{ flex: 1, padding: '12px', background: leftActiveTab === tab ? 'transparent' : `${th.bg}44`, border: 'none', borderBottom: leftActiveTab === tab ? `2px solid ${th.accent}` : '2px solid transparent', color: leftActiveTab === tab ? th.accent : '#666', cursor: 'pointer', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
                                        {tab === 'brand' ? <Zap size={14} /> : tab}
                                    </button>
                                ))}
                            </div>

                            {leftActiveTab === 'brand' && (
                                <div className="ia-section ia-scroll">
                                    <div className="ia-label" style={{ marginBottom: 12 }}>Neural Brand DNA</div>
                                    <div className="ia-card" style={{ padding: 16, marginBottom: 16, background: `${th.accent}05` }}>
                                        <div className="flex-row gap-8" style={{ marginBottom: 12 }}>
                                            <Sparkles size={14} className="text-accent" />
                                            <div style={{ fontSize: 11, fontWeight: 700 }}>Global Tokens</div>
                                        </div>

                                        <div className="flex-col gap-12">
                                            <div>
                                                <div className="ia-subtitle" style={{ marginBottom: 6 }}>Drive Aesthetics</div>
                                                <div className="flex-row gap-6">
                                                    {(['sans', 'display', 'mono'] as const).map(f => (
                                                        <button key={f} onClick={() => setBrand(b => ({ ...b, font: f }))}
                                                            style={{ flex: 1, padding: '8px', borderRadius: 8, fontSize: 10, fontWeight: 800, background: brand.font === f ? th.accent : th.bg, color: brand.font === f ? '#fff' : '#666', border: `1px solid ${brand.font === f ? th.accent : th.border}`, cursor: 'pointer', textTransform: 'capitalize' }}>
                                                            {f}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="ia-subtitle" style={{ marginBottom: 6 }}>Global Radius ({brand.radius}px)</div>
                                                <input type="range" min="0" max="64" value={brand.radius} onChange={e => setBrand(b => ({ ...b, radius: parseInt(e.target.value) }))} className="w-full h-4 bg-white/5 rounded-lg appearance-none cursor-pointer" />
                                            </div>

                                            <div className="ia-grid-2">
                                                <div>
                                                    <div className="ia-subtitle" style={{ marginBottom: 4 }}>Primary</div>
                                                    <div className="flex-row gap-4">
                                                        <input type="color" value={brand.primary} onChange={e => setBrand(b => ({ ...b, primary: e.target.value }))} style={{ width: 24, height: 24, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                                                        <span style={{ fontSize: 9, opacity: 0.5, fontFamily: 'monospace' }}>{brand.primary}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="ia-subtitle" style={{ marginBottom: 4 }}>Accent</div>
                                                    <div className="flex-row gap-4">
                                                        <input type="color" value={brand.accent} onChange={e => setBrand(b => ({ ...b, accent: e.target.value }))} style={{ width: 24, height: 24, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                                                        <span style={{ fontSize: 9, opacity: 0.5, fontFamily: 'monospace' }}>{brand.accent}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button className="ia-btn" onClick={() => setBrand(b => ({ ...b, glass: !b.glass }))}
                                                style={{ width: '100%', padding: '12px', background: brand.glass ? `${th.accent}22` : th.bg, color: brand.glass ? th.accent : '#666', border: `1px solid ${brand.glass ? th.accent : th.border}` }}>
                                                {brand.glass ? 'Glassmorphism: ACTIVE' : 'Glassmorphism: OFF'}
                                            </button>
                                        </div>
                                    </div>

                                    <button className="ia-btn flex-center gap-8" onClick={() => {
                                        setState(prev => ({
                                            ...prev,
                                            brand: { ...prev.brand, radius: brand.radius },
                                            elements: prev.elements.map(el => ({
                                                ...el,
                                                props: { ...el.props, radius: brand.radius }
                                            }))
                                        }));
                                    }} style={{ width: '100%', padding: '14px', background: th.accent, color: '#fff', borderRadius: 12, fontWeight: 800 }}>
                                        <RefreshCw size={14} /> Neural Sync Global
                                    </button>
                                    <div style={{ marginTop: 12, fontSize: 9, color: '#555', textAlign: 'center', fontStyle: 'italic' }}>
                                        Applies BrandKit to all existing elements instantly.
                                    </div>
                                </div>
                            )}

                            {leftActiveTab === 'elements' && (
                                <div className="ia-section">
                                    <div className="ia-label" style={{ marginBottom: 8 }}>Elements</div>
                                    <div style={{ position: 'relative', marginBottom: 10 }}>
                                        <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search components..." className="ia-input" style={{ paddingLeft: 28 }} />
                                    </div>
                                    {['Basic', 'Layout', 'Media'].map(group => (
                                        <div key={group} style={{ marginBottom: 16 }}>
                                            <div className="ia-subtitle" style={{ marginBottom: 8 }}>{group}</div>
                                            <div className="ia-grid-3">
                                                {COMPONENT_REGISTRY.filter(c => c.group === group && (!search || c.label.toLowerCase().includes(search.toLowerCase()))).map(c => {
                                                    const CI = c.icon;
                                                    return (
                                                        <button key={c.type} className="comp-btn" onClick={() => addElement(c.type)} title={`Add ${c.label}`}>
                                                            <CI size={18} />
                                                            <span>{c.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    <div style={{ marginTop: 20 }}>
                                        <div className="ia-subtitle" style={{ marginBottom: 8 }}>Smart Templates</div>
                                        <div className="flex-col gap-6">
                                            {TEMPLATE_REGISTRY.map(t => (
                                                <button key={t.label} className="ia-btn flex-row gap-12" onClick={() => addTemplate(t)}
                                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, background: th.bg, border: `1px solid ${th.border}`, color: th.text, fontSize: 11, fontWeight: 700 }}>
                                                    <t.icon size={14} className="text-accent" />
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {leftActiveTab === 'templates' && (
                                <div className="ia-section">
                                    <div className="ia-label" style={{ marginBottom: 12 }}>Project Library</div>
                                    <div className="flex-col gap-8">
                                        {PREMADE_PROJECTS.map(p => (
                                            <button key={p.id} className="ia-btn flex-row gap-12" onClick={() => loadPremadeProject(p)}
                                                style={{ width: '100%', padding: '14px 16px', borderRadius: 16, background: th.bg, border: `1px solid ${th.border}`, color: th.text, transition: 'all 0.2s', textAlign: 'left' }}>
                                                <div className="flex-center" style={{ width: 40, height: 40, borderRadius: 12, background: `${th.accent}11`, border: `1px solid ${th.accent}22` }}>
                                                    <p.icon size={20} className="text-accent" />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 2 }}>{p.name}</div>
                                                    <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '.05em' }}>{p.state.theme} Theme • {p.state.elements.length} Elements</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {leftActiveTab === 'layers' && (
                                <div className="ia-section" style={{ flex: 1 }}>
                                    <div className="flex-between" style={{ marginBottom: 12 }}>
                                        <div className="ia-label">Layers ({elements.length})</div>
                                        {elements.length > 0 && (
                                            <button onClick={clearCanvas} className="ia-btn flex-row gap-4" style={{ fontSize: 9, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '.1em', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <RefreshCw size={10} /> Clear
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex-row gap-6" style={{ marginBottom: 12 }}>
                                        {([1, 2, 3] as const).map(c => (
                                            <button key={c} onClick={() => setColumns(c)} className="ia-btn flex-center" style={{ flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 10, fontWeight: 800, background: columns === c ? `${th.accent}22` : th.bg, color: columns === c ? th.accent : '#666', border: `1px solid ${columns === c ? `${th.accent}44` : th.border}`, cursor: 'pointer' }}>
                                                <Columns size={11} style={{ marginRight: 3 }} />{c}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="ia-scroll" style={{ maxHeight: 300 }}>
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                            <SortableContext items={elements.map(e => e.id)} strategy={verticalListSortingStrategy}>
                                                {elements.map((el, idx) => (
                                                    <SortableLayerItem key={el.id} el={el} idx={idx} selectedId={selectedId} th={th}
                                                        onSelect={setSelectedId} onMove={moveElement} onDuplicate={duplicateElement} onDelete={deleteElement} />
                                                ))}
                                            </SortableContext>
                                        </DndContext>
                                        {elements.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '24px 0', color: '#555', fontSize: 11 }}>
                                                <MousePointer2 size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: .3 }} />
                                                Add elements from above
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex-row gap-6" style={{ marginTop: 'auto', padding: 16, borderTop: `1px solid ${th.border}` }}>
                                <Sparkles size={11} className="text-accent" style={{ opacity: 0.5 }} />
                                <span className="ia-subtitle" style={{ color: '#554' }}>Live Neural Synthesis</span>
                            </div>
                        </aside>

                        {/* Canvas area */}
                        <main className="ia-canvas" onClick={() => setSelectedId(null)}>
                            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }}>
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={elements.map(e => e.id)} strategy={verticalListSortingStrategy}>
                                        <motion.div layout style={{ width: previewWidth, background: th.surface, border: `1px solid ${th.border}`, borderRadius: 32, minHeight: 600, padding: 32, boxShadow: '0 40px 120px rgba(0,0,0,0.5)', display: 'grid', gridTemplateColumns: columns === 1 ? '1fr' : columns === 2 ? '1fr 1fr' : '1fr 1fr 1fr', gap: 16, alignContent: 'start', transition: 'width .5s cubic-bezier(.4,0,.2,1)' }}>
                                            {elements.length === 0 ? (
                                                <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, opacity: .2, border: `2px dashed ${th.border}`, borderRadius: 24 }}>
                                                    <MousePointer2 size={40} style={{ marginBottom: 16 }} />
                                                    <div style={{ fontWeight: 900, fontSize: 20, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 8 }}>Void Canvas</div>
                                                    <div style={{ fontSize: 12, color: '#888' }}>Drag sections here or use AI Generate</div>
                                                </div>
                                            ) : (
                                                elements.map(el => (
                                                    <SortableCanvasItem key={el.id} el={el} theme={theme} selectedId={selectedId} onSelect={setSelectedId} />
                                                ))
                                            )}
                                        </motion.div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                            <div className="flex-row gap-6" style={{ marginTop: 16 }}>
                                <Sparkles size={11} className="text-accent" style={{ opacity: 0.5 }} />
                                <span className="ia-subtitle" style={{ color: '#554' }}>Live Neural Synthesis — Auto-Saved</span>
                            </div>
                        </main>

                        {/* Right sidebar: Studio Pro Suite */}
                        <aside className="ia-sidebar-right" style={{ display: 'flex', flexDirection: 'column', background: th.surface, borderLeft: `1px solid ${th.border}`, overflow: 'hidden' }}>
                            {/* Tab Header */}
                            <div className="flex-row" style={{ borderBottom: `1px solid ${th.border}`, background: th.surface }}>
                                {(['props', 'ai', 'auditor'] as const).map(tab => (
                                    <button key={tab} title={tab.toUpperCase()} onClick={() => setRightActiveTab(tab)}
                                        className="flex-center"
                                        style={{ flex: 1, padding: '12px', background: rightActiveTab === tab ? 'transparent' : `${th.bg}44`, border: 'none', borderBottom: rightActiveTab === tab ? `2px solid ${th.accent}` : '2px solid transparent', color: rightActiveTab === tab ? th.accent : '#666', cursor: 'pointer', transition: 'all .2s' }}>
                                        {tab === 'props' ? <Settings2 size={16} /> : tab === 'ai' ? <MessageSquare size={16} /> : <Activity size={16} />}
                                    </button>
                                ))}
                            </div>

                            <div className="ia-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                {rightActiveTab === 'props' ? (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div className="ia-section" style={{ borderBottom: `1px solid ${th.border}`, background: th.bg }}>
                                            <div className="flex-row gap-8">
                                                <Settings2 size={16} className="text-accent" />
                                                <span className="ia-label">Properties</span>
                                            </div>
                                        </div>

                                        {!selectedEl ? (
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: .2, padding: 24, textAlign: 'center' }}>
                                                <MousePointer2 size={32} style={{ marginBottom: 12 }} />
                                                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.15em' }}>Select a node</div>
                                            </div>
                                        ) : (
                                            <div className="ia-scroll" style={{ flex: 1, padding: 16 }}>
                                                <AnimatePresence mode="wait">
                                                    <motion.div key={selectedEl.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                                                        {/* Type badge */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <span style={{ padding: '4px 10px', borderRadius: 8, background: `${th.accent}22`, color: th.accent, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em' }}>{selectedEl.type}</span>
                                                            <span style={{ fontSize: 10, color: '#666' }}>{selectedEl.id}</span>
                                                        </div>

                                                        {/* Label */}
                                                        <div>
                                                            <div className="ia-label" style={{ marginBottom: 6 }}>{selectedEl.type === 'image' ? 'Image URL' : 'Label / Content'}</div>
                                                            {selectedEl.type === 'textarea' ? (
                                                                <textarea title="Edit content" value={selectedEl.label} onChange={e => updateLabel(selectedEl.id, e.target.value)} className="ia-input" rows={3} style={{ resize: 'vertical' }} />
                                                            ) : (
                                                                <input title="Edit content" type="text" value={selectedEl.label} onChange={e => updateLabel(selectedEl.id, e.target.value)} className="ia-input" />
                                                            )}
                                                        </div>

                                                        {/* Colors */}
                                                        <div>
                                                            <div className="ia-label" style={{ marginBottom: 8 }}>Colors</div>
                                                            <div className="ia-grid-2">
                                                                {[{ key: 'bg', label: 'Background' }, { key: 'color', label: 'Text' }, { key: 'borderColor', label: 'Border' }].map(({ key, label }) => (
                                                                    <div key={key} className="flex-col gap-4">
                                                                        <span style={{ fontSize: 9, fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</span>
                                                                        <input title={`Edit ${label}`} type="color" value={(selectedEl.props as any)[key] || '#000000'} onChange={e => updateProps(selectedEl.id, { [key]: e.target.value })}
                                                                            style={{ width: '100%', height: 36, borderRadius: 8, border: `1px solid ${th.border}`, background: th.bg, cursor: 'pointer', padding: 2 }} />
                                                                    </div>
                                                                ))}
                                                                <div className="flex-col gap-4" style={{ gridColumn: '2/-1' }}>
                                                                    <span style={{ fontSize: 9, fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '.1em' }}>Reset Colors</span>
                                                                    <button className="ia-btn ia-btn-ghost w-full" style={{ border: `1px solid ${th.border}`, borderRadius: 8, fontSize: 10, fontWeight: 700 }}
                                                                        onClick={() => updateProps(selectedEl.id, { bg: '', color: '', borderColor: '' })}>Reset</button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Font Size */}
                                                        <div>
                                                            <div className="ia-label" style={{ marginBottom: 8 }}>Font Size</div>
                                                            <div className="flex-row gap-4" style={{ flexWrap: 'wrap' }}>
                                                                {(['xs', 'sm', 'base', 'lg', 'xl', '2xl'] as const).map(s => (
                                                                    <button key={s} className="ia-btn" onClick={() => updateProps(selectedEl.id, { fontSize: s })}
                                                                        style={{ padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 800, background: selectedEl.props.fontSize === s ? `${th.accent}22` : th.bg, color: selectedEl.props.fontSize === s ? th.accent : '#666', border: `1px solid ${selectedEl.props.fontSize === s ? `${th.accent}44` : th.border}`, cursor: 'pointer' }}>
                                                                        {s}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Alignment */}
                                                        <div>
                                                            <div className="ia-label" style={{ marginBottom: 8 }}>Text Align</div>
                                                            <div className="flex-row gap-4">
                                                                {([{ v: 'left', I: AlignLeft }, { v: 'center', I: AlignCenter }, { v: 'right', I: AlignRight }] as const).map(({ v, I }) => (
                                                                    <button key={v} title={`Align ${v}`} className="ia-btn" onClick={() => updateProps(selectedEl.id, { align: v })}
                                                                        style={{ flex: 1, padding: '8px', borderRadius: 8, background: selectedEl.props.align === v ? `${th.accent}22` : th.bg, color: selectedEl.props.align === v ? th.accent : '#666', border: `1px solid ${selectedEl.props.align === v ? `${th.accent}44` : th.border}`, cursor: 'pointer' }}>
                                                                        <I size={14} style={{ margin: '0 auto' }} />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Border Radius */}
                                                        <div>
                                                            <div className="ia-label" style={{ marginBottom: 6 }}>Border Radius: {selectedEl.props.radius ?? 16}px</div>
                                                            <input title="Border Radius" type="range" min={0} max={64} value={selectedEl.props.radius ?? 16}
                                                                onChange={e => updateProps(selectedEl.id, { radius: Number(e.target.value) })}
                                                                style={{ width: '100%', accentColor: th.accent }} />
                                                        </div>

                                                        {/* Padding */}
                                                        <div>
                                                            <div className="ia-label" style={{ marginBottom: 6 }}>Padding: {selectedEl.props.padding ?? 4}</div>
                                                            <input title="Padding" type="range" min={0} max={16} value={selectedEl.props.padding ?? 4}
                                                                onChange={e => updateProps(selectedEl.id, { padding: Number(e.target.value) })}
                                                                style={{ width: '100%', accentColor: th.accent }} />
                                                        </div>

                                                        {/* Width */}
                                                        <div>
                                                            <div className="ia-label" style={{ marginBottom: 8 }}>Width</div>
                                                            <div className="flex-row gap-4">
                                                                {(['auto', 'half', 'full'] as const).map(w => (
                                                                    <button key={w} className="ia-btn" onClick={() => updateProps(selectedEl.id, { width: w })}
                                                                        style={{ flex: 1, padding: '6px', borderRadius: 8, fontSize: 10, fontWeight: 800, background: selectedEl.props.width === w ? `${th.accent}22` : th.bg, color: selectedEl.props.width === w ? th.accent : '#666', border: `1px solid ${selectedEl.props.width === w ? `${th.accent}44` : th.border}`, cursor: 'pointer' }}>
                                                                        {w}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Advanced Styles */}
                                                        <div className="flex-col gap-16" style={{ padding: '16px 0', borderTop: `1px solid ${th.border}` }}>
                                                            <div className="ia-label">Advanced Styles</div>

                                                            <div className="ia-grid-2" style={{ gap: 12 }}>
                                                                <div className="flex-col gap-4">
                                                                    <div className="ia-subtitle">Blur (px)</div>
                                                                    <input title="Blur Strength" type="range" min={0} max={40} value={selectedEl.props.blur || 0} onChange={e => updateProps(selectedEl.id, { blur: Number(e.target.value) })} style={{ width: '100%', accentColor: th.accent }} />
                                                                </div>
                                                                <div className="flex-col gap-4">
                                                                    <div className="ia-subtitle">Opacity (%)</div>
                                                                    <input title="Opacity Level" type="range" min={0} max={100} value={selectedEl.props.opacity ?? 100} onChange={e => updateProps(selectedEl.id, { opacity: Number(e.target.value) })} style={{ width: '100%', accentColor: th.accent }} />
                                                                </div>
                                                            </div>

                                                            <div className="flex-col gap-8">
                                                                <div className="ia-subtitle">Shadow Preset</div>
                                                                <div className="ia-grid-3" style={{ gap: 4 }}>
                                                                    {(['none', 'soft', 'medium', 'deep', 'glow'] as const).map(s => (
                                                                        <button key={s} className="ia-btn" onClick={() => updateProps(selectedEl.id, { shadow: s })}
                                                                            style={{ padding: '6px', borderRadius: 8, fontSize: 9, fontWeight: 800, background: selectedEl.props.shadow === s ? `${th.accent}22` : th.bg, color: selectedEl.props.shadow === s ? th.accent : '#666', border: `1px solid ${selectedEl.props.shadow === s ? `${th.accent}44` : th.border}` }}>
                                                                            {s}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="flex-col gap-8">
                                                                <div className="ia-subtitle">Gradient Preset</div>
                                                                <div className="ia-grid-2" style={{ gap: 4 }}>
                                                                    {[
                                                                        { l: 'None', v: '' },
                                                                        { l: 'Purple', v: 'linear-gradient(to right, #a855f7, #6366f1)' },
                                                                        { l: 'Ocean', v: 'linear-gradient(to right, #0ea5e9, #22d3ee)' },
                                                                        { l: 'Sunset', v: 'linear-gradient(to right, #f97316, #facc15)' },
                                                                    ].map(g => (
                                                                        <button key={g.l} className="ia-btn" onClick={() => updateProps(selectedEl.id, { gradient: g.v })}
                                                                            style={{ padding: '6px', borderRadius: 8, fontSize: 9, fontWeight: 800, background: selectedEl.props.gradient === g.v ? `${th.accent}22` : th.bg, color: selectedEl.props.gradient === g.v ? th.accent : '#666', border: `1px solid ${selectedEl.props.gradient === g.v ? `${th.accent}44` : th.border}` }}>
                                                                            {g.l}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div style={{ fontSize: 9, fontWeight: 800, color: '#666', textTransform: 'uppercase', marginBottom: 8 }}>Animation</div>
                                                                <select title="Choose Animation" value={selectedEl.props.animation || 'none'} onChange={e => updateProps(selectedEl.id, { animation: e.target.value as any })}
                                                                    style={{ width: '100%', background: th.bg, color: th.text, border: `1px solid ${th.border}`, borderRadius: 8, padding: '6px', fontSize: 11 }}>
                                                                    <option value="none">No Animation</option>
                                                                    <option value="fadeIn">Fade In</option>
                                                                    <option value="slideUp">Slide Up</option>
                                                                    <option value="scalePop">Scale Pop</option>
                                                                    <option value="rotateIn">Rotate In</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex-row gap-8" style={{ paddingTop: 16, borderTop: `1px solid ${th.border}` }}>
                                                            <button className="ia-btn ia-btn-ghost flex-center w-full gap-6" style={{ border: `1px solid ${th.border}`, borderRadius: 10, fontSize: 11, fontWeight: 700 }}
                                                                onClick={() => duplicateElement(selectedEl.id)}>
                                                                <Copy size={13} /> Duplicate
                                                            </button>
                                                            <button className="ia-btn flex-row flex-center gap-6" style={{ padding: '8px 16px', borderRadius: 10, background: '#ef444422', border: '1px solid #ef444433', color: '#ef4444', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
                                                                onClick={() => deleteElement(selectedEl.id)}>
                                                                <Trash2 size={13} /> Delete
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        {/* Bottom: export shortcuts */}
                                        <div className="ia-section" style={{ borderTop: `1px solid ${th.border}` }}>
                                            <div className="ia-label" style={{ marginBottom: 10 }}>Quick Export</div>
                                            <div className="flex-row gap-6">
                                                {(['tsx', 'html', 'json'] as const).map(f => (
                                                    <button key={f} className="ia-btn w-full" style={{ padding: '7px 0', borderRadius: 9, fontSize: 10, fontWeight: 800, background: th.bg, color: '#888', border: `1px solid ${th.border}`, cursor: 'pointer' }}
                                                        onClick={() => { setCodeFormat(f); setActiveTab('code'); }}>
                                                        {f.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : rightActiveTab === 'ai' ? (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <div className="ia-section" style={{ borderBottom: `1px solid ${th.border}`, background: th.bg }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <MessageSquare size={16} style={{ color: th.accent }} />
                                                <span style={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.15em' }}>AI Assistant</span>
                                            </div>
                                        </div>
                                        <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
                                            {messages.map(m => (
                                                <div key={m.id} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: '10px 14px', borderRadius: 16, background: m.role === 'user' ? th.accent : th.bg, color: m.role === 'user' ? '#fff' : th.text, fontSize: 12, border: `1px solid ${m.role === 'user' ? 'transparent' : th.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>{m.text}</div>
                                            ))}
                                        </div>
                                        <div style={{ padding: 12, borderTop: `1px solid ${th.border}`, background: th.surface }}>
                                            <div style={{ position: 'relative' }}>
                                                <input title="Type your message" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask AI..." className="ia-input" style={{ paddingRight: 40 }} />
                                                <button title="Send" onClick={sendMessage} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: th.accent, cursor: 'pointer' }}><Send size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ flex: 1, padding: 20 }}>
                                        <div className="ia-label" style={{ marginBottom: 16 }}>Studio Pro Health</div>
                                        <div style={{ background: `${th.bg}44`, border: `1px solid ${th.border}`, borderRadius: 24, padding: 24, textAlign: 'center', marginBottom: 20 }}>
                                            <div style={{ fontSize: 32, fontWeight: 900, color: th.accent }}>85%</div>
                                            <div style={{ fontSize: 10, fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '.1em' }}>Performance</div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, background: '#10b98111', border: '1px solid #10b98122' }}>
                                                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                                                <div style={{ fontSize: 11, fontWeight: 700 }}>Clean DOM</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, background: '#f59e0b11', border: '1px solid #f59e0b22' }}>
                                                <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
                                                <div style={{ fontSize: 11, fontWeight: 700 }}>Add SEO Data</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </>
    );
}
