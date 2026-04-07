import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import SettingsPanel from '@/components/SettingsPanel';
import UserCenter from '@/components/UserCenter';
import TopBar from '@/components/TopBar';
import QuickToolbar from '@/components/QuickToolbar';
import BotCheck, { needsBotCheck, markBotCheckPassed } from '@/components/BotCheck';
import TextGenerator from '@/components/tools/TextGenerator';
import ImageGenerator from '@/components/tools/ImageGenerator';
import TextToVideo from '@/components/tools/TextToVideo';
import ImageToVideo from '@/components/tools/ImageToVideo';
import AudioGenerator from '@/components/tools/AudioGenerator';
import VoiceTranslator from '@/components/tools/VoiceTranslator';
import PromptLibrary from '@/components/PromptLibrary';
import UtilityBox from '@/components/tools/UtilityBox';

const toolComponents: Record<string, React.FC> = {
  textGen: TextGenerator,
  imageGen: ImageGenerator,
  textToVideo: TextToVideo,
  imageToVideo: ImageToVideo,
  audioGen: AudioGenerator,
  voiceTranslate: VoiceTranslator,
  promptLib: PromptLibrary,
  utilityBox: UtilityBox,
};

const Dashboard: React.FC = () => {
  const { deviceMode, currentTool, backgroundUrl, glassEffect } = useAppStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showBotCheck, setShowBotCheck] = useState(needsBotCheck);
  const isMobile = deviceMode === 'mobile';
  const ToolComponent = toolComponents[currentTool] || TextGenerator;

  return (
    <div
      className="h-screen flex overflow-hidden bg-background relative"
      style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {backgroundUrl && <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />}

      <div className="relative z-10 hidden sm:block">
        <Sidebar />
      </div>

      {isMobile && <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />}

      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <div className={`px-3 sm:px-4 py-2 border-b border-border flex items-center justify-between relative z-30
          ${glassEffect ? 'bg-card/50 backdrop-blur-xl' : 'bg-card/80 backdrop-blur-md'}`}>
          <div className="flex items-center gap-2">
            {isMobile && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileNavOpen(true)}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <Menu className="w-5 h-5 text-foreground" />
              </motion.button>
            )}
          </div>
          <TopBar />
        </div>

        <div className={`flex-1 overflow-hidden relative z-0
          ${glassEffect ? 'bg-card/30 backdrop-blur-sm' : 'bg-card/60 backdrop-blur-sm'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTool}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 28 }}
              className="h-full"
            >
              <ToolComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <QuickToolbar />
      <SettingsPanel />
      <UserCenter />

      {showBotCheck && (
        <BotCheck
          onPass={() => setShowBotCheck(false)}
          onClose={() => { markBotCheckPassed(); setShowBotCheck(false); }}
        />
      )}
    </div>
  );
};

export default Dashboard;
