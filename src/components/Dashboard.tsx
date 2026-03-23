import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import SettingsPanel from '@/components/SettingsPanel';
import UserCenter from '@/components/UserCenter';
import BotCheck, { needsBotCheck, markBotCheckPassed } from '@/components/BotCheck';
import TextGenerator from '@/components/tools/TextGenerator';
import ImageGenerator from '@/components/tools/ImageGenerator';
import TextToVideo from '@/components/tools/TextToVideo';
import ImageToVideo from '@/components/tools/ImageToVideo';
import AudioGenerator from '@/components/tools/AudioGenerator';

const toolComponents: Record<string, React.FC> = {
  textGen: TextGenerator,
  imageGen: ImageGenerator,
  textToVideo: TextToVideo,
  imageToVideo: ImageToVideo,
  audioGen: AudioGenerator,
};

const Dashboard: React.FC = () => {
  const { deviceMode, currentTool, backgroundUrl } = useAppStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showBotCheck, setShowBotCheck] = useState(needsBotCheck);
  const isMobile = deviceMode === 'mobile';
  const ToolComponent = toolComponents[currentTool] || TextGenerator;

  return (
    <div
      className="h-screen flex overflow-hidden bg-background relative"
      style={backgroundUrl ? {
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      {backgroundUrl && <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />}

      {!isMobile && (
        <div className="relative z-10">
          <Sidebar />
        </div>
      )}

      {isMobile && <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />}

      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        {isMobile && (
          <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-card/80 backdrop-blur-md">
            <button onClick={() => setMobileNavOpen(true)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <Menu className="w-5 h-5 text-foreground" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-hidden bg-card/60 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTool}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <ToolComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <SettingsPanel />
      <UserCenter />

      {/* Daily bot check */}
      {showBotCheck && (
        <BotCheck
          onPass={() => setShowBotCheck(false)}
          onClose={() => {
            markBotCheckPassed();
            setShowBotCheck(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
