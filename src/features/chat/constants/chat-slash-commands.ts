export interface SlashCommandDef {
  command: string;
  usageKey:
    | 'slashPollUsage'
    | 'slashCodeUsage'
    | 'slashAiUsage'
    | 'slashPomodoroUsage'
    | 'slashShareUsage';
  descriptionKey:
    | 'slashPollDesc'
    | 'slashCodeDesc'
    | 'slashAiDesc'
    | 'slashPomodoroDesc'
    | 'slashShareDesc';
  icon: string;
}

export const CHAT_SLASH_COMMANDS: SlashCommandDef[] = [
  {
    command: '/poll',
    usageKey: 'slashPollUsage',
    descriptionKey: 'slashPollDesc',
    icon: 'poll',
  },
  {
    command: '/code',
    usageKey: 'slashCodeUsage',
    descriptionKey: 'slashCodeDesc',
    icon: 'code',
  },
  {
    command: '/ai',
    usageKey: 'slashAiUsage',
    descriptionKey: 'slashAiDesc',
    icon: 'auto_awesome',
  },
  {
    command: '/pomodoro',
    usageKey: 'slashPomodoroUsage',
    descriptionKey: 'slashPomodoroDesc',
    icon: 'timer',
  },
  {
    command: '/share',
    usageKey: 'slashShareUsage',
    descriptionKey: 'slashShareDesc',
    icon: 'folder_shared',
  },
];
