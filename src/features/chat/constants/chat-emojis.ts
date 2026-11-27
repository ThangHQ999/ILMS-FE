import { normalizeSearchText } from '../utils/chat-message.utils';

export type ChatEmojiCategoryId =
  | 'smileys'
  | 'animals'
  | 'food'
  | 'activities'
  | 'travel'
  | 'objects'
  | 'symbols'
  | 'flags';

export interface ChatEmojiEntry {
  emoji: string;
  keywords: string;
}

export interface ChatEmojiCategory {
  id: ChatEmojiCategoryId;
  icon: string;
  items: readonly ChatEmojiEntry[];
}

export const QUICK_REACTION_EMOJIS: readonly string[] = [
  '👍',
  '❤️',
  '🔥',
  '🎉',
  '😂',
  '😮',
  '😢',
  '🙏',
  '👏',
  '✨',
  '💯',
  '🤝',
] as const;

export const CHAT_EMOJI_CATEGORIES: readonly ChatEmojiCategory[] = [
  {
    id: 'smileys',
    icon: 'mood',
    items: [
      { emoji: '😀', keywords: 'grin smile happy cuoi vui' },
      { emoji: '😃', keywords: 'happy smile joyful cuoi tuoi' },
      { emoji: '😄', keywords: 'laugh happy smile cuoi haha' },
      { emoji: '😁', keywords: 'beam grin proud he rang' },
      { emoji: '😆', keywords: 'laughing xd cuoi lon' },
      { emoji: '🥹', keywords: 'touched tears emotional xuc dong' },
      { emoji: '😅', keywords: 'sweat nervous relief do mo hoi' },
      { emoji: '😂', keywords: 'joy tears laugh haha cuoi ra nuoc mat' },
      { emoji: '🤣', keywords: 'rofl laugh cuoi lan lon' },
      { emoji: '😊', keywords: 'blush warm smile mim cuoi de thuong' },
      { emoji: '😇', keywords: 'angel innocent thien than' },
      { emoji: '🙂', keywords: 'slightly smiling nhe nhang' },
      { emoji: '🙃', keywords: 'upside down playful nghich ngom' },
      { emoji: '😉', keywords: 'wink nhay mat' },
      { emoji: '😌', keywords: 'relieved calm thu gian' },
      { emoji: '😍', keywords: 'heart eyes love yeu thich me' },
      { emoji: '🥰', keywords: 'hearts love adore yeu thuong' },
      { emoji: '😘', keywords: 'kiss love hon' },
      { emoji: '😗', keywords: 'kissing whistle' },
      { emoji: '😙', keywords: 'kissing smiling' },
      { emoji: '😋', keywords: 'yummy delicious ngon' },
      { emoji: '😛', keywords: 'tongue playful le luoi' },
      { emoji: '😝', keywords: 'tongue wink nghich' },
      { emoji: '😜', keywords: 'crazy tongue nhay mat' },
      { emoji: '🤪', keywords: 'zany silly hai huoc' },
      { emoji: '🤨', keywords: 'raised eyebrow nghi ngo' },
      { emoji: '🧐', keywords: 'monocle inspect soi xet nghien cuu' },
      { emoji: '🤓', keywords: 'nerd study smart deo kinh hoc gioi' },
      { emoji: '😎', keywords: 'cool sunglasses ngau chat' },
      { emoji: '🥸', keywords: 'disguise funny hoa trang' },
      { emoji: '🤩', keywords: 'star struck excited nguong mo' },
      { emoji: '🥳', keywords: 'party celebrate sinh nhat an mung' },
      { emoji: '😏', keywords: 'smirk confident cuoi nhech mep' },
      { emoji: '😔', keywords: 'pensive sad buon suy tu' },
      { emoji: '😢', keywords: 'cry sad khoc buon' },
      { emoji: '😮', keywords: 'wow surprised ngac nhien' },
      { emoji: '👍', keywords: 'thumbs up like ok dong y tuyet' },
      { emoji: '👏', keywords: 'clap applause vo tay chuc mung' },
      { emoji: '🙏', keywords: 'please thanks pray cam on xin' },
      { emoji: '🤝', keywords: 'handshake agree hop tac bat tay' },
    ],
  },
  {
    id: 'animals',
    icon: 'pets',
    items: [
      { emoji: '🐶', keywords: 'dog puppy cho cun' },
      { emoji: '🐱', keywords: 'cat kitty meo' },
      { emoji: '🐭', keywords: 'mouse chuot' },
      { emoji: '🐹', keywords: 'hamster chuot tui' },
      { emoji: '🐰', keywords: 'rabbit bunny tho' },
      { emoji: '🦊', keywords: 'fox cao' },
      { emoji: '🐻', keywords: 'bear gau' },
      { emoji: '🐼', keywords: 'panda gau truc' },
      { emoji: '🐨', keywords: 'koala' },
      { emoji: '🐯', keywords: 'tiger ho' },
      { emoji: '🦁', keywords: 'lion su tu' },
      { emoji: '🐮', keywords: 'cow bo' },
      { emoji: '🐸', keywords: 'frog ech' },
      { emoji: '🐵', keywords: 'monkey khi' },
      { emoji: '🦉', keywords: 'owl socratic cu meo tri tue' },
      { emoji: '🦋', keywords: 'butterfly buom' },
      { emoji: '🌸', keywords: 'cherry blossom hoa anh dao' },
      { emoji: '🌺', keywords: 'hibiscus hoa' },
      { emoji: '🌻', keywords: 'sunflower hoa huong duong' },
      { emoji: '🌿', keywords: 'herb leaf plant la cay xanh' },
      { emoji: '🍀', keywords: 'clover lucky co bon la may man' },
      { emoji: '🌈', keywords: 'rainbow cau vong' },
      { emoji: '☀️', keywords: 'sun sunny mat troi nang' },
      { emoji: '🌙', keywords: 'moon crescent night mat trang dem' },
    ],
  },
  {
    id: 'food',
    icon: 'lunch_dining',
    items: [
      { emoji: '🍎', keywords: 'apple fruit tao' },
      { emoji: '🍊', keywords: 'orange tangerine cam' },
      { emoji: '🍋', keywords: 'lemon chanh' },
      { emoji: '🍉', keywords: 'watermelon dua hau' },
      { emoji: '🍓', keywords: 'strawberry dau tay' },
      { emoji: '🍑', keywords: 'peach dao' },
      { emoji: '🥑', keywords: 'avocado bo' },
      { emoji: '🥐', keywords: 'croissant bread banh mi' },
      { emoji: '🍕', keywords: 'pizza food' },
      { emoji: '🍔', keywords: 'burger' },
      { emoji: '🍟', keywords: 'fries khoai tay chien' },
      { emoji: '🍜', keywords: 'ramen noodle pho mi' },
      { emoji: '🍣', keywords: 'sushi' },
      { emoji: '🍰', keywords: 'cake dessert banh kem' },
      { emoji: '🍩', keywords: 'donut banh' },
      { emoji: '🍪', keywords: 'cookie banh quy' },
      { emoji: '☕', keywords: 'coffee break cafe ca phe' },
      { emoji: '🧋', keywords: 'boba bubble tea tra sua' },
      { emoji: '🍵', keywords: 'tea matcha tra' },
      { emoji: '🧃', keywords: 'juice nuoc ep' },
    ],
  },
  {
    id: 'activities',
    icon: 'sports_soccer',
    items: [
      { emoji: '⚽', keywords: 'soccer football bong da' },
      { emoji: '🏀', keywords: 'basketball bong ro' },
      { emoji: '🏈', keywords: 'football bong bau duc' },
      { emoji: '🎾', keywords: 'tennis quan vot' },
      { emoji: '🏐', keywords: 'volleyball bong chuyen' },
      { emoji: '🏓', keywords: 'ping pong table tennis bong ban' },
      { emoji: '🏸', keywords: 'badminton cau long' },
      { emoji: '🎯', keywords: 'target goal focus muc tieu tap trung' },
      { emoji: '🎮', keywords: 'game controller tro choi' },
      { emoji: '🎲', keywords: 'dice xuc xac' },
      { emoji: '🎸', keywords: 'guitar music nhac' },
      { emoji: '🎧', keywords: 'headphones study focus tai nghe' },
      { emoji: '🎨', keywords: 'art paint palette ve nghe thuat' },
      { emoji: '🎬', keywords: 'movie cinema phim' },
      { emoji: '🏆', keywords: 'trophy winner cup giai thuong chien thang' },
      { emoji: '🥇', keywords: 'gold medal first huy chuong vang' },
    ],
  },
  {
    id: 'travel',
    icon: 'beach_access',
    items: [
      { emoji: '🚗', keywords: 'car drive xe hoi' },
      { emoji: '🚌', keywords: 'bus xe buyt' },
      { emoji: '🚲', keywords: 'bike bicycle xe dap' },
      { emoji: '✈️', keywords: 'airplane flight travel may bay du lich' },
      { emoji: '🚀', keywords: 'rocket launch space ten lua phong' },
      { emoji: '🛸', keywords: 'ufo space vu tru' },
      { emoji: '🏖️', keywords: 'beach vacation bien nghi he' },
      { emoji: '🏔️', keywords: 'mountain nui' },
      { emoji: '🏫', keywords: 'school university campus truong hoc' },
      { emoji: '🏛️', keywords: 'library museum thu vien' },
      { emoji: '🏠', keywords: 'home house nha' },
      { emoji: '⛺', keywords: 'camp tent cam trai' },
      { emoji: '🎡', keywords: 'ferris wheel park cong vien' },
      { emoji: '🌍', keywords: 'earth world globe trai dat the gioi' },
      { emoji: '🪐', keywords: 'planet saturn cosmos hanh tinh' },
      { emoji: '🗺️', keywords: 'map roadmap ban do lo trinh' },
    ],
  },
  {
    id: 'objects',
    icon: 'lightbulb',
    items: [
      { emoji: '💡', keywords: 'idea bulb lightbulb y tuong sang kien' },
      { emoji: '📚', keywords: 'books study library sach hoc tap' },
      { emoji: '📖', keywords: 'open book read doc sach' },
      { emoji: '📝', keywords: 'memo note write ghi chu bai tap' },
      { emoji: '✏️', keywords: 'pencil edit but chi' },
      { emoji: '📌', keywords: 'pin ghim' },
      { emoji: '💻', keywords: 'laptop computer code may tinh lap trinh' },
      { emoji: '⌨️', keywords: 'keyboard ban phim' },
      { emoji: '📱', keywords: 'phone mobile dien thoai' },
      { emoji: '⏰', keywords: 'alarm clock timer pomodoro dong ho hen gio' },
      { emoji: '📅', keywords: 'calendar schedule lich' },
      { emoji: '🔍', keywords: 'search find tim kiem' },
      { emoji: '🔔', keywords: 'bell notification thong bao' },
      { emoji: '🎓', keywords: 'graduation cap study mu tot nghiep hoc van' },
      { emoji: '🔬', keywords: 'microscope science khoa hoc' },
      { emoji: '⚙️', keywords: 'gear settings cai dat' },
    ],
  },
  {
    id: 'symbols',
    icon: 'favorite',
    items: [
      { emoji: '❤️', keywords: 'red heart love trai tim yeu' },
      { emoji: '🧡', keywords: 'orange heart tim cam' },
      { emoji: '💛', keywords: 'yellow heart tim vang' },
      { emoji: '💚', keywords: 'green heart tim xanh la' },
      { emoji: '💙', keywords: 'blue heart tim xanh duong' },
      { emoji: '💜', keywords: 'purple heart tim tim' },
      { emoji: '💖', keywords: 'sparkling heart tim lap lanh' },
      { emoji: '💯', keywords: '100 hundred perfect diem muoi tuyet doi' },
      { emoji: '🔥', keywords: 'fire lit hot streak lua chay' },
      { emoji: '✨', keywords: 'sparkles magic shine lap lanh tuyet' },
      { emoji: '🎉', keywords: 'party confetti celebrate chuc mung' },
      { emoji: '⭐', keywords: 'star favorite ngoi sao' },
      { emoji: '⚡', keywords: 'lightning fast tia chop nhanh' },
      { emoji: '✅', keywords: 'check done complete xong duyet' },
      { emoji: '❓', keywords: 'question help hoi' },
      { emoji: '💬', keywords: 'speech bubble chat tin nhan' },
    ],
  },
  {
    id: 'flags',
    icon: 'flag',
    items: [
      { emoji: '🇻🇳', keywords: 'vietnam co viet nam vn' },
      { emoji: '🇺🇸', keywords: 'usa united states america en co my' },
      { emoji: '🇬🇧', keywords: 'uk britain english co anh' },
      { emoji: '🇯🇵', keywords: 'japan co nhat ban' },
      { emoji: '🇰🇷', keywords: 'korea co han quoc' },
      { emoji: '🇫🇷', keywords: 'france co phap' },
      { emoji: '🇩🇪', keywords: 'germany co duc' },
      { emoji: '🇨🇦', keywords: 'canada' },
      { emoji: '🇦🇺', keywords: 'australia uc' },
      { emoji: '🇸🇬', keywords: 'singapore' },
      { emoji: '🚩', keywords: 'red flag milestone cot moc' },
      { emoji: '🏁', keywords: 'checkered flag finish ve dich' },
      { emoji: '🏳️‍🌈', keywords: 'rainbow pride' },
      { emoji: '🏴', keywords: 'black flag' },
      { emoji: '🏳️', keywords: 'white flag' },
      { emoji: '🎌', keywords: 'crossed flags' },
    ],
  },
] as const;

/**
 * Searches chat emojis across all categories using case- and diacritic-insensitive matching.
 */
export function searchChatEmojis(query: string): ChatEmojiEntry[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];

  const rawTrimmed = query.trim();
  const seen = new Set<string>();
  const results: ChatEmojiEntry[] = [];

  for (const category of CHAT_EMOJI_CATEGORIES) {
    for (const item of category.items) {
      if (seen.has(item.emoji)) continue;
      if (
        item.emoji.includes(rawTrimmed) ||
        item.keywords.includes(normalized)
      ) {
        seen.add(item.emoji);
        results.push(item);
      }
    }
  }

  return results;
}
