import popBg from '../assets/pop.jpeg';
import dontwaitBg from '../assets/dontwait.jpg';
import hackerBg from '../assets/hacker.jpg';
import tiredBg from '../assets/tired.png';
import brainsBg from '../assets/brains.jpg';
import pnpBg from '../assets/pnp.jpg';
import prgmindBg from '../assets/prgmind.jpg';
import faceBg from '../assets/face.jpg';
import { NavSection } from '../components/layout/Sidebar';

export interface PageBackgroundMeta {
  src: string;
  name: string;
  pageTitle: string;
  themeContext: string;
}

export const PAGE_BACKGROUNDS: Record<NavSection, PageBackgroundMeta> = {
  today: {
    src: popBg,
    name: 'pop.jpeg',
    pageTitle: 'Today Dashboard',
    themeContext: 'Cybernetic Focus & Executive Flow',
  },
  calendar: {
    src: dontwaitBg,
    name: 'dontwait.jpg',
    pageTitle: 'Calendar & Schedule',
    themeContext: 'Urgency & Time Horizon ("Don\'t Wait")',
  },
  tasks: {
    src: hackerBg,
    name: 'hacker.jpg',
    pageTitle: 'Task Management',
    themeContext: 'Matrix Code Engineering & Deep Flow',
  },
  waiting: {
    src: tiredBg,
    name: 'tired.png',
    pageTitle: 'Waiting & Backlog',
    themeContext: 'Complex Calculus & Mental Pacing',
  },
  companion: {
    src: brainsBg,
    name: 'brains.jpg',
    pageTitle: 'AI Companion',
    themeContext: 'Neural Synaptic Intelligence',
  },
  goals: {
    src: pnpBg,
    name: 'pnp.jpg',
    pageTitle: 'Goals & Strategic Projects',
    themeContext: 'Inception of Ideas into Digital Reality',
  },
  insights: {
    src: prgmindBg,
    name: 'prgmind.jpg',
    pageTitle: 'Insights & Review',
    themeContext: 'Architect Mindset & Feedback Loops',
  },
  settings: {
    src: faceBg,
    name: 'face.jpg',
    pageTitle: 'System Settings',
    themeContext: 'Human Identity & Biometric Core',
  },
};
