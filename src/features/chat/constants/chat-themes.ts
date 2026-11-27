export type ChatThemeKey =
  | 'DEFAULT'
  | 'OCEAN'
  | 'SUNSET'
  | 'FOREST'
  | 'MIDNIGHT'
  | 'LOVE';

export const CHAT_THEME_ORDER: readonly ChatThemeKey[] = [
  'DEFAULT',
  'OCEAN',
  'FOREST',
  'LOVE',
  'SUNSET',
  'MIDNIGHT',
] as const;

export interface ChatThemePalette {
  key: ChatThemeKey;
  label: string;
  artistCredit: string;
  description: string;
  recommendedEmoji: string;
  wallpaperUrl: string | null;
  swatchClass: string;
  surfaceBgClass: string;
  wallpaperOverlayClass: string;
  headerClass: string;
  headerTitleClass: string;
  headerSubtitleClass: string;
  headerIconBtnClass: string;
  composerBarClass: string;
  composerInputClass: string;
  composerIconBtnClass: string;
  myBubbleClass: string;
  peerBubbleClass: string;
  dateDividerClass: string;
  systemMessageClass: string;
  accentBtnClass: string;
  accentTextClass: string;
  previewCancelBtnClass: string;
  previewConfirmBtnClass: string;
  aiBubbleClass: string;
  aiHeaderClass: string;
  aiAvatarClass: string;
  aiDotClass: string;
  aiSourceChipClass: string;
  highlightRingClass: string;
}

export const CHAT_THEMES: Record<ChatThemeKey, ChatThemePalette> = {
  DEFAULT: {
    key: 'DEFAULT',
    label: 'Cổ điển',
    artistCredit: 'Giao diện tinh giản ILMS',
    description: 'Sáng sủa, tinh gọn theo phong cách Gemini MD3 mặc định.',
    recommendedEmoji: '👍',
    wallpaperUrl: null,
    swatchClass: 'bg-[#0B57D0] dark:bg-[#A8C7FA]',
    surfaceBgClass: 'bg-white dark:bg-[#1E1F20]',
    wallpaperOverlayClass: '',
    headerClass:
      'bg-white dark:bg-[#1E1F20] border-b border-[#F0F4F9] dark:border-[#282A2C]',
    headerTitleClass: 'text-[#1F1F1F] dark:text-[#E3E3E3]',
    headerSubtitleClass: 'text-[#444746] dark:text-[#8E918F]',
    headerIconBtnClass:
      'bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] text-[#444746] dark:text-[#C4C7C5]',
    composerBarClass:
      'bg-white dark:bg-[#1E1F20] border-t border-[#F0F4F9] dark:border-[#282A2C]',
    composerInputClass:
      'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] dark:placeholder:text-[#8E918F]',
    composerIconBtnClass:
      'bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] text-[#0B57D0] dark:text-[#A8C7FA]',
    myBubbleClass:
      'bg-[#0B57D0] text-white dark:bg-[#004A77] dark:text-[#E3E3E3]',
    peerBubbleClass:
      'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3]',
    dateDividerClass:
      'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#444746] dark:text-[#8E918F]',
    systemMessageClass:
      'text-[#747775] dark:text-[#8E918F]',
    accentBtnClass:
      'bg-[#0B57D0] text-white hover:bg-[#0842A0] dark:bg-[#A8C7FA] dark:text-[#062E6F] dark:hover:bg-[#8AB4F8]',
    accentTextClass: 'text-[#0B57D0] dark:text-[#A8C7FA]',
    previewCancelBtnClass:
      'bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3]',
    previewConfirmBtnClass:
      'bg-[#0B57D0] hover:bg-[#0842A0] text-white dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F]',
    aiBubbleClass:
      'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3]',
    aiHeaderClass: 'text-[#0B57D0] dark:text-[#A8C7FA]',
    aiAvatarClass:
      'bg-white/95 dark:bg-[#1E1F20]/95 ring-1 ring-black/10 dark:ring-white/15 shadow-xs',
    aiDotClass: 'bg-[#5E35B1] dark:bg-[#D1C4E9]',
    aiSourceChipClass:
      'bg-white/85 text-[#444746] dark:bg-[#1E1F20] dark:text-[#C4C7C5]',
    highlightRingClass:
      'ring-[3px] ring-[#0B57D0] dark:ring-[#A8C7FA] ring-offset-2 ring-offset-white dark:ring-offset-[#1E1F20]',
  },

  OCEAN: {
    key: 'OCEAN',
    label: 'Pixel Dreamscape',
    artistCredit: 'Tác phẩm minh họa của ILMS Studio',
    description: 'Cổng đá pixel mộng mơ, trời xanh băng và bong bóng hồng phấn.',
    recommendedEmoji: '✨',
    wallpaperUrl: '/images/chat-themes/ocean-dreamscape.png',
    swatchClass: 'bg-[#0E3A53] dark:bg-[#38BDF8]',
    surfaceBgClass: 'bg-[#C8F3FF] dark:bg-[#071824]',
    wallpaperOverlayClass: 'bg-white/5 dark:bg-[#071824]/75',
    headerClass:
      'bg-[#D4F6FF]/85 backdrop-blur-md border-b border-[#0E3A53]/10 dark:bg-[#0A1F2E]/85 dark:border-white/10',
    headerTitleClass: 'text-[#0A2536] dark:text-[#E6F6FF]',
    headerSubtitleClass: 'text-[#285570] dark:text-[#8ECAE6]',
    headerIconBtnClass:
      'bg-white/65 hover:bg-white/90 text-[#0E3A53] dark:bg-[#133145]/85 dark:hover:bg-[#1A425C] dark:text-[#B8E8FF]',
    composerBarClass:
      'bg-[#D9F7FF]/85 backdrop-blur-md border-t border-[#0E3A53]/10 dark:bg-[#0A1F2E]/88 dark:border-white/10',
    composerInputClass:
      'bg-white/85 dark:bg-[#132C3E]/90 text-[#0A2536] dark:text-[#E6F6FF] placeholder:text-[#4A748D] dark:placeholder:text-[#7DA8C2]',
    composerIconBtnClass:
      'bg-white/75 hover:bg-white text-[#0E3A53] dark:bg-[#133145]/90 dark:hover:bg-[#1B425C] dark:text-[#7DD3FC]',
    myBubbleClass:
      'bg-[#0E3A53] text-white dark:bg-[#0284C7] dark:text-white shadow-xs',
    peerBubbleClass:
      'bg-[#FCE1F6]/95 text-[#1F1F1F] dark:bg-[#162836]/90 dark:text-[#E6F4FA] backdrop-blur-xs shadow-xs',
    dateDividerClass:
      'bg-white/80 text-[#0E3A53] dark:bg-[#0E2433]/85 dark:text-[#B8E8FF] backdrop-blur-xs shadow-xs',
    systemMessageClass:
      'bg-white/70 text-[#1F4963] dark:bg-[#0E2433]/80 dark:text-[#A9D6EC] backdrop-blur-xs',
    accentBtnClass:
      'bg-[#0E3A53] text-white hover:bg-[#09293B] dark:bg-[#38BDF8] dark:text-[#062334] dark:hover:bg-[#7DD3FC]',
    accentTextClass: 'text-[#0E3A53] dark:text-[#7DD3FC]',
    previewCancelBtnClass:
      'bg-[#FCE1F6] hover:bg-[#F8CCF0] text-[#1F1F1F] dark:bg-[#162836] dark:hover:bg-[#1F374A] dark:text-[#E6F4FA]',
    previewConfirmBtnClass:
      'bg-[#0E3A53] hover:bg-[#09293B] text-white dark:bg-[#0284C7] dark:hover:bg-[#0369A1] dark:text-white',
    aiBubbleClass:
      'bg-[#FCE1F6]/95 text-[#1F1F1F] dark:bg-[#162836]/90 dark:text-[#E6F4FA] backdrop-blur-xs shadow-xs',
    aiHeaderClass: 'text-[#0E3A53] dark:text-[#7DD3FC]',
    aiAvatarClass:
      'bg-white/95 dark:bg-[#1E1F20]/95 ring-1 ring-black/10 dark:ring-white/15 shadow-xs',
    aiDotClass: 'bg-[#0284C7] dark:bg-[#7DD3FC]',
    aiSourceChipClass:
      'bg-white/85 text-[#0E3A53] dark:bg-[#071824]/80 dark:text-[#B8E8FF]',
    highlightRingClass:
      'ring-[3px] ring-[#0E3A53] dark:ring-[#38BDF8] ring-offset-2 ring-offset-white/90 dark:ring-offset-[#071824]',
  },

  FOREST: {
    key: 'FOREST',
    label: 'Tán lá xanh',
    artistCredit: 'Tác phẩm minh họa của ILMS Studio',
    description: 'Sắc xanh bạc hà dịu mắt cùng tán lá nhiệt đới thanh bình.',
    recommendedEmoji: '🌿',
    wallpaperUrl: '/images/chat-themes/forest-leaves.png',
    swatchClass: 'bg-[#0B5D3B] dark:bg-[#34D399]',
    surfaceBgClass: 'bg-[#A9DFC7] dark:bg-[#091C14]',
    wallpaperOverlayClass: 'bg-white/5 dark:bg-[#091C14]/75',
    headerClass:
      'bg-[#B7E7D1]/85 backdrop-blur-md border-b border-[#0B5D3B]/10 dark:bg-[#0D241B]/85 dark:border-white/10',
    headerTitleClass: 'text-[#082E1E] dark:text-[#E2F7EC]',
    headerSubtitleClass: 'text-[#255C45] dark:text-[#86CFAF]',
    headerIconBtnClass:
      'bg-white/65 hover:bg-white/90 text-[#0B5D3B] dark:bg-[#143527]/85 dark:hover:bg-[#1B4734] dark:text-[#A7F3D0]',
    composerBarClass:
      'bg-[#BFEAD6]/85 backdrop-blur-md border-t border-[#0B5D3B]/10 dark:bg-[#0D241B]/88 dark:border-white/10',
    composerInputClass:
      'bg-white/85 dark:bg-[#143226]/90 text-[#082E1E] dark:text-[#E2F7EC] placeholder:text-[#447862] dark:placeholder:text-[#7EB59B]',
    composerIconBtnClass:
      'bg-white/75 hover:bg-white text-[#0B5D3B] dark:bg-[#143527]/90 dark:hover:bg-[#1C4735] dark:text-[#6EE7B7]',
    myBubbleClass:
      'bg-[#0B5D3B] text-white dark:bg-[#0F764A] dark:text-white shadow-xs',
    peerBubbleClass:
      'bg-[#F2FBF7]/95 text-[#0F291E] dark:bg-[#152E23]/90 dark:text-[#E3F5EC] backdrop-blur-xs shadow-xs',
    dateDividerClass:
      'bg-white/80 text-[#0B5D3B] dark:bg-[#10291F]/85 dark:text-[#A7F3D0] backdrop-blur-xs shadow-xs',
    systemMessageClass:
      'bg-white/70 text-[#194E37] dark:bg-[#10291F]/80 dark:text-[#98E2C0] backdrop-blur-xs',
    accentBtnClass:
      'bg-[#0B5D3B] text-white hover:bg-[#08472D] dark:bg-[#34D399] dark:text-[#052E1C] dark:hover:bg-[#6EE7B7]',
    accentTextClass: 'text-[#0B5D3B] dark:text-[#6EE7B7]',
    previewCancelBtnClass:
      'bg-[#F2FBF7] hover:bg-[#E2F5EC] text-[#0F291E] dark:bg-[#152E23] dark:hover:bg-[#1C3D2F] dark:text-[#E3F5EC]',
    previewConfirmBtnClass:
      'bg-[#0B5D3B] hover:bg-[#08472D] text-white dark:bg-[#0F764A] dark:hover:bg-[#0B5D3B] dark:text-white',
    aiBubbleClass:
      'bg-[#F2FBF7]/95 text-[#0F291E] dark:bg-[#152E23]/90 dark:text-[#E3F5EC] backdrop-blur-xs shadow-xs',
    aiHeaderClass: 'text-[#0B5D3B] dark:text-[#6EE7B7]',
    aiAvatarClass:
      'bg-white/95 dark:bg-[#1E1F20]/95 ring-1 ring-black/10 dark:ring-white/15 shadow-xs',
    aiDotClass: 'bg-[#059669] dark:bg-[#6EE7B7]',
    aiSourceChipClass:
      'bg-white/85 text-[#0B5D3B] dark:bg-[#091C14]/80 dark:text-[#A7F3D0]',
    highlightRingClass:
      'ring-[3px] ring-[#0B5D3B] dark:ring-[#34D399] ring-offset-2 ring-offset-white/90 dark:ring-offset-[#091C14]',
  },

  LOVE: {
    key: 'LOVE',
    label: 'Tình yêu',
    artistCredit: 'Tác phẩm minh họa của ILMS Studio',
    description: 'Nền hồng pastel 3D dịu dàng cùng điểm nhấn hồng rực rỡ.',
    recommendedEmoji: '💖',
    wallpaperUrl: '/images/chat-themes/love-hearts.png',
    swatchClass: 'bg-[#E6007A] dark:bg-[#F472B6]',
    surfaceBgClass: 'bg-[#FFDCEB] dark:bg-[#230C18]',
    wallpaperOverlayClass: 'bg-white/5 dark:bg-[#230C18]/78',
    headerClass:
      'bg-[#FFE6F2]/85 backdrop-blur-md border-b border-[#E6007A]/10 dark:bg-[#2B101E]/85 dark:border-white/10',
    headerTitleClass: 'text-[#3A0D24] dark:text-[#FFE4F1]',
    headerSubtitleClass: 'text-[#873860] dark:text-[#F9A8D4]',
    headerIconBtnClass:
      'bg-white/70 hover:bg-white/95 text-[#C20066] dark:bg-[#3D172B]/85 dark:hover:bg-[#4F1E38] dark:text-[#FBCFE8]',
    composerBarClass:
      'bg-[#FFE8F3]/85 backdrop-blur-md border-t border-[#E6007A]/10 dark:bg-[#2B101E]/88 dark:border-white/10',
    composerInputClass:
      'bg-white/88 dark:bg-[#3A1729]/90 text-[#2B1220] dark:text-[#FFE4F1] placeholder:text-[#9B587A] dark:placeholder:text-[#D48AB0]',
    composerIconBtnClass:
      'bg-white/75 hover:bg-white text-[#E6007A] dark:bg-[#3D172B]/90 dark:hover:bg-[#501F39] dark:text-[#F472B6]',
    myBubbleClass:
      'bg-[#E6007A] text-white dark:bg-[#DB2777] dark:text-white shadow-xs',
    peerBubbleClass:
      'bg-[#FFF8FB]/95 text-[#2B1220] dark:bg-[#351828]/90 dark:text-[#FCE7F3] backdrop-blur-xs shadow-xs',
    dateDividerClass:
      'bg-white/82 text-[#9E145A] dark:bg-[#311323]/85 dark:text-[#FBCFE8] backdrop-blur-xs shadow-xs',
    systemMessageClass:
      'bg-white/75 text-[#872657] dark:bg-[#311323]/80 dark:text-[#F9A8D4] backdrop-blur-xs',
    accentBtnClass:
      'bg-[#E6007A] text-white hover:bg-[#C20066] dark:bg-[#F472B6] dark:text-[#430926] dark:hover:bg-[#F9A8D4]',
    accentTextClass: 'text-[#E6007A] dark:text-[#F472B6]',
    previewCancelBtnClass:
      'bg-[#FFF8FB] hover:bg-[#FFEBF3] text-[#2B1220] dark:bg-[#351828] dark:hover:bg-[#472036] dark:text-[#FCE7F3]',
    previewConfirmBtnClass:
      'bg-[#E6007A] hover:bg-[#C20066] text-white dark:bg-[#DB2777] dark:hover:bg-[#BE185D] dark:text-white',
    aiBubbleClass:
      'bg-[#FFF8FB]/95 text-[#2B1220] dark:bg-[#351828]/90 dark:text-[#FCE7F3] backdrop-blur-xs shadow-xs',
    aiHeaderClass: 'text-[#E6007A] dark:text-[#F472B6]',
    aiAvatarClass:
      'bg-white/95 dark:bg-[#1E1F20]/95 ring-1 ring-black/10 dark:ring-white/15 shadow-xs',
    aiDotClass: 'bg-[#E6007A] dark:bg-[#F472B6]',
    aiSourceChipClass:
      'bg-white/85 text-[#872657] dark:bg-[#230C18]/80 dark:text-[#FBCFE8]',
    highlightRingClass:
      'ring-[3px] ring-[#C20066] dark:ring-[#F472B6] ring-offset-2 ring-offset-white/90 dark:ring-offset-[#230C18]',
  },

  SUNSET: {
    key: 'SUNSET',
    label: 'Lễ hội sắc màu',
    artistCredit: 'Tác phẩm minh họa của ILMS Studio',
    description: 'Họa tiết doodle lễ hội tươi vui tương phản xanh dương nổi bật.',
    recommendedEmoji: '🎉',
    wallpaperUrl: '/images/chat-themes/sunset-festival.png',
    swatchClass: 'bg-[#1E40AF] dark:bg-[#60A5FA]',
    surfaceBgClass: 'bg-[#7AE866] dark:bg-[#112111]',
    wallpaperOverlayClass: 'bg-white/5 dark:bg-[#112111]/80',
    headerClass:
      'bg-[#85ED72]/88 backdrop-blur-md border-b border-[#165A1A]/15 dark:bg-[#152815]/88 dark:border-white/10',
    headerTitleClass: 'text-[#0E2912] dark:text-[#ECFCE8]',
    headerSubtitleClass: 'text-[#215727] dark:text-[#9BE29A]',
    headerIconBtnClass:
      'bg-white/75 hover:bg-white text-[#1E40AF] dark:bg-[#1E371E]/85 dark:hover:bg-[#274727] dark:text-[#93C5FD]',
    composerBarClass:
      'bg-[#8AED78]/88 backdrop-blur-md border-t border-[#165A1A]/15 dark:bg-[#152815]/90 dark:border-white/10',
    composerInputClass:
      'bg-white/90 dark:bg-[#1D341D]/90 text-[#1A2616] dark:text-[#ECFCE8] placeholder:text-[#4E6E4A] dark:placeholder:text-[#8FB88D]',
    composerIconBtnClass:
      'bg-white/80 hover:bg-white text-[#1E40AF] dark:bg-[#1E371E]/90 dark:hover:bg-[#294929] dark:text-[#60A5FA]',
    myBubbleClass:
      'bg-[#1E40AF] text-white dark:bg-[#2563EB] dark:text-white shadow-xs',
    peerBubbleClass:
      'bg-[#FFFDF5]/95 text-[#1A2616] dark:bg-[#1F2E1D]/90 dark:text-[#ECFCE8] backdrop-blur-xs shadow-xs',
    dateDividerClass:
      'bg-white/85 text-[#18381C] dark:bg-[#182B18]/85 dark:text-[#BBF7D0] backdrop-blur-xs shadow-xs',
    systemMessageClass:
      'bg-white/78 text-[#1C4721] dark:bg-[#182B18]/80 dark:text-[#A7EFA8] backdrop-blur-xs',
    accentBtnClass:
      'bg-[#1E40AF] text-white hover:bg-[#1E3A8A] dark:bg-[#60A5FA] dark:text-[#08204A] dark:hover:bg-[#93C5FD]',
    accentTextClass: 'text-[#1E40AF] dark:text-[#60A5FA]',
    previewCancelBtnClass:
      'bg-[#FFFDF5] hover:bg-[#F3F8EB] text-[#1A2616] dark:bg-[#1F2E1D] dark:hover:bg-[#2A3E28] dark:text-[#ECFCE8]',
    previewConfirmBtnClass:
      'bg-[#1E40AF] hover:bg-[#1E3A8A] text-white dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] dark:text-white',
    aiBubbleClass:
      'bg-[#FFFDF5]/95 text-[#1A2616] dark:bg-[#1F2E1D]/90 dark:text-[#ECFCE8] backdrop-blur-xs shadow-xs',
    aiHeaderClass: 'text-[#1E40AF] dark:text-[#60A5FA]',
    aiAvatarClass:
      'bg-white/95 dark:bg-[#1E1F20]/95 ring-1 ring-black/10 dark:ring-white/15 shadow-xs',
    aiDotClass: 'bg-[#1E40AF] dark:bg-[#60A5FA]',
    aiSourceChipClass:
      'bg-white/85 text-[#1E3A8A] dark:bg-[#0F1B2E]/80 dark:text-[#BFDBFE]',
    highlightRingClass:
      'ring-[3px] ring-[#1E40AF] dark:ring-[#60A5FA] ring-offset-2 ring-offset-white/90 dark:ring-offset-[#112111]',
  },

  MIDNIGHT: {
    key: 'MIDNIGHT',
    label: 'Ngân hà đêm',
    artistCredit: 'Tác phẩm minh họa của ILMS Studio',
    description: 'Bầu trời chạng vạng tím chàm cùng chòm sao vàng dịu nhẹ.',
    recommendedEmoji: '🪐',
    wallpaperUrl: '/images/chat-themes/midnight-cosmos.png',
    swatchClass: 'bg-[#4F46E5] dark:bg-[#818CF8]',
    surfaceBgClass: 'bg-[#2D266B] dark:bg-[#090B1A]',
    wallpaperOverlayClass: 'bg-[#19143E]/15 dark:bg-[#090B1A]/68',
    headerClass:
      'bg-[#28215E]/85 backdrop-blur-md border-b border-white/10 dark:bg-[#10122A]/85 dark:border-white/10',
    headerTitleClass: 'text-white dark:text-[#EEF2FF]',
    headerSubtitleClass: 'text-[#C7D2FE] dark:text-[#A5B4FC]',
    headerIconBtnClass:
      'bg-white/15 hover:bg-white/25 text-white dark:bg-[#1D2047]/85 dark:hover:bg-[#282C5E] dark:text-[#C7D2FE]',
    composerBarClass:
      'bg-[#261F5A]/88 backdrop-blur-md border-t border-white/10 dark:bg-[#10122A]/90 dark:border-white/10',
    composerInputClass:
      'bg-white/92 dark:bg-[#1B1D3B]/90 text-[#1E1B4B] dark:text-[#EEF2FF] placeholder:text-[#6366A1] dark:placeholder:text-[#98A2E8]',
    composerIconBtnClass:
      'bg-white/20 hover:bg-white/30 text-white dark:bg-[#1D2047]/90 dark:hover:bg-[#292D63] dark:text-[#A5B4FC]',
    myBubbleClass:
      'bg-gradient-to-br from-[#3B28CC] to-[#6D28D9] text-white dark:from-[#4F46E5] dark:to-[#7C3AED] dark:text-white shadow-xs',
    peerBubbleClass:
      'bg-[#F3F0FF]/95 text-[#1E1B4B] dark:bg-[#1E1D3A]/90 dark:text-[#EDE9FE] backdrop-blur-xs shadow-xs',
    dateDividerClass:
      'bg-white/85 text-[#2E2575] dark:bg-[#181A38]/85 dark:text-[#C7D2FE] backdrop-blur-xs shadow-xs',
    systemMessageClass:
      'bg-[#19143E]/60 text-[#E0E7FF] dark:bg-[#181A38]/80 dark:text-[#C7D2FE] backdrop-blur-xs',
    accentBtnClass:
      'bg-[#4F46E5] text-white hover:bg-[#4338CA] dark:bg-[#818CF8] dark:text-[#161347] dark:hover:bg-[#A5B4FC]',
    accentTextClass: 'text-[#4F46E5] dark:text-[#A5B4FC]',
    previewCancelBtnClass:
      'bg-[#F3F0FF] hover:bg-[#E5DFFF] text-[#1E1B4B] dark:bg-[#1E1D3A] dark:hover:bg-[#2A2952] dark:text-[#EDE9FE]',
    previewConfirmBtnClass:
      'bg-[#4F46E5] hover:bg-[#4338CA] text-white dark:bg-[#6366F1] dark:hover:bg-[#4F46E5] dark:text-white',
    aiBubbleClass:
      'bg-[#F3F0FF]/95 text-[#1E1B4B] dark:bg-[#1E1D3A]/90 dark:text-[#EDE9FE] backdrop-blur-xs shadow-xs',
    aiHeaderClass: 'text-[#4F46E5] dark:text-[#A5B4FC]',
    aiAvatarClass:
      'bg-white/95 dark:bg-[#1E1F20]/95 ring-1 ring-black/10 dark:ring-white/15 shadow-xs',
    aiDotClass: 'bg-[#4F46E5] dark:bg-[#A5B4FC]',
    aiSourceChipClass:
      'bg-white/85 text-[#312E81] dark:bg-[#0F1028]/80 dark:text-[#C7D2FE]',
    highlightRingClass:
      'ring-[3px] ring-[#F59E0B] dark:ring-[#FDE047] ring-offset-2 ring-offset-[#2D266B] dark:ring-offset-[#090B1A]',
  },
};

export function resolveChatTheme(themeKey?: string | null): ChatThemePalette {
  const normalized = (themeKey || 'DEFAULT').toUpperCase() as ChatThemeKey;
  return CHAT_THEMES[normalized] ?? CHAT_THEMES.DEFAULT;
}

export const QUICK_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'] as const;

export const DEFAULT_QUICK_EMOJIS = ['👍', '❤️', '🔥', '🎓', '✨', '👏', '🚀', '💡'] as const;
